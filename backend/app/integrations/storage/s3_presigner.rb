# frozen_string_literal: true

require "cgi"
require "openssl"
require "uri"

module Integrations
  module Storage
    # =============================================================================
    # S3-compatible presigner (AWS S3 + MinIO)
    #
    # Env:
    #   S3_ENDPOINT          e.g. http://localhost:9000  (MinIO) or https://s3.amazonaws.com
    #   S3_BUCKET            default dronehub-mvp
    #   S3_ACCESS_KEY_ID
    #   S3_SECRET_ACCESS_KEY
    #   S3_REGION            default us-east-1
    #   S3_FORCE_PATH_STYLE  true for MinIO
    #
    # Production: prefer official aws-sdk-s3 Presigner.
    # This class is a zero-dependency SigV4 PUT presign suitable for MVP + MinIO.
    # =============================================================================
    class S3Presigner
      DEFAULT_EXPIRES = 900 # 15 minutes

      def initialize(
        endpoint: ENV.fetch("S3_ENDPOINT", "http://localhost:9000"),
        bucket: ENV.fetch("S3_BUCKET", "dronehub-mvp"),
        access_key: ENV.fetch("S3_ACCESS_KEY_ID", "dronehub"),
        secret_key: ENV.fetch("S3_SECRET_ACCESS_KEY", "dronehubsecret"),
        region: ENV.fetch("S3_REGION", "us-east-1"),
        force_path_style: ENV.fetch("S3_FORCE_PATH_STYLE", "true") == "true"
      )
        @endpoint = endpoint.chomp("/")
        @bucket = bucket
        @access_key = access_key
        @secret_key = secret_key
        @region = region
        @force_path_style = force_path_style
      end

      # Returns a presigned PUT URL for direct browser/worker upload.
      def presign_put(key:, content_type:, expires_in: DEFAULT_EXPIRES)
        raise ArgumentError, "key required" if key.blank?
        raise ArgumentError, "content_type required" if content_type.blank?

        now = Time.now.utc
        amz_date = now.strftime("%Y%m%dT%H%M%SZ")
        datestamp = now.strftime("%Y%m%d")
        credential_scope = "#{datestamp}/#{region}/s3/aws4_request"
        credential = "#{access_key}/#{credential_scope}"

        host = URI.parse(endpoint).host
        port = URI.parse(endpoint).port
        host_header = (port && ![80, 443].include?(port)) ? "#{host}:#{port}" : host

        canonical_uri = if force_path_style
                          "/#{bucket}/#{key.split('/').map { |p| CGI.escape(p).gsub('+', '%20') }.join('/')}"
                        else
                          "/#{key.split('/').map { |p| CGI.escape(p).gsub('+', '%20') }.join('/')}"
                        end

        signed_headers = "host"
        query = {
          "X-Amz-Algorithm" => "AWS4-HMAC-SHA256",
          "X-Amz-Credential" => credential,
          "X-Amz-Date" => amz_date,
          "X-Amz-Expires" => expires_in.to_s,
          "X-Amz-SignedHeaders" => signed_headers
        }
        # Optional: bind content-type via signed header would need it in signed_headers;
        # browsers often send Content-Type — document that clients must match session content_type.
        canonical_query = query.sort.map { |k, v| "#{CGI.escape(k)}=#{CGI.escape(v)}" }.join("&")

        canonical_headers = "host:#{host_header}\n"
        payload_hash = "UNSIGNED-PAYLOAD"
        canonical_request = [
          "PUT",
          canonical_uri,
          canonical_query,
          canonical_headers,
          signed_headers,
          payload_hash
        ].join("\n")

        string_to_sign = [
          "AWS4-HMAC-SHA256",
          amz_date,
          credential_scope,
          OpenSSL::Digest::SHA256.hexdigest(canonical_request)
        ].join("\n")

        signing_key = derive_signing_key(secret_key, datestamp, region, "s3")
        signature = OpenSSL::HMAC.hexdigest("SHA256", signing_key, string_to_sign)

        query_with_sig = canonical_query + "&X-Amz-Signature=#{signature}"
        base = if force_path_style
                 "#{endpoint}/#{bucket}/#{key}"
               else
                 # virtual-hosted
                 scheme = URI.parse(endpoint).scheme
                 "#{scheme}://#{bucket}.#{host_header}/#{key}"
               end

        # Use endpoint path style URL with query string
        "#{endpoint}#{canonical_uri}?#{query_with_sig}"
      end

      def public_object_url(key)
        if force_path_style
          "#{endpoint}/#{bucket}/#{key}"
        else
          "#{endpoint}/#{key}"
        end
      end

      private

      attr_reader :endpoint, :bucket, :access_key, :secret_key, :region, :force_path_style

      def derive_signing_key(secret, datestamp, region, service)
        k_date = OpenSSL::HMAC.digest("SHA256", "AWS4#{secret}", datestamp)
        k_region = OpenSSL::HMAC.digest("SHA256", k_date, region)
        k_service = OpenSSL::HMAC.digest("SHA256", k_region, service)
        OpenSSL::HMAC.digest("SHA256", k_service, "aws4_request")
      end
    end
  end
end
