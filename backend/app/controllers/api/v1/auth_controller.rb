# frozen_string_literal: true

module Api
  module V1
    class AuthController < ActionController::API
      before_action :set_request_id

      # POST /api/v1/auth/sign_up
      def sign_up
        email = params.require(:email).to_s.downcase.strip
        password = params.require(:password)
        return render_error(400, "TERMS_REQUIRED", "Terms must be accepted") unless params[:accepted_terms]

        if User.exists?(email: email)
          return render_error(422, "EMAIL_TAKEN", "Email already registered")
        end

        user = nil
        org = nil
        user_type = normalized_user_type
        ActiveRecord::Base.transaction do
          user = User.create!(
            email: email,
            encrypted_password: hash_password(password),
            first_name: params[:first_name],
            last_name: params[:last_name],
            accepted_terms_at: Time.current,
            accepted_privacy_at: Time.current,
            jti: SecureRandom.uuid,
            user_type: user_type
          )
          org_name = params[:organization_name].presence || "#{user.first_name || 'Org'} Workspace"
          org = Organization.create!(
            name: org_name,
            slug: unique_slug(org_name),
            organization_type: organization_type_for(user_type),
            country_code: "BR"
          )
          OrganizationMembership.create!(
            organization: org,
            user: user,
            role: "owner",
            status: "active",
            joined_at: Time.current
          )
          if user.operator?
            Operators::OperatorProfile.create!(
              organization: org,
              slug: org.slug,
              profile_kind: %w[solo company].include?(params[:profile_kind].to_s) ? params[:profile_kind] : "solo",
              company_name: params[:company_name],
              verification_status: "pending",
              accepting_jobs: false,
              searchable: false,
              headline: [params[:first_name], "Operador"].compact.join(" — ")
            )
          end
        end

        tokens = issue_tokens(user)
        begin
          Mail::Deliver.call(:welcome, user: user, organization: org)
        rescue StandardError => e
          Rails.logger.warn({ event: "welcome_mail_failed", error: e.message }.to_json)
        end
        render json: {
          data: {
            user: user_payload(user),
            organization: organization_payload(org),
            tokens: tokens
          },
          meta: { request_id: @request_id }
        }, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render_error(422, "VALIDATION", e.record.errors.full_messages.join(", "))
      end

      # POST /api/v1/auth/sign_in
      def sign_in
        user = User.find_by(email: params.require(:email).to_s.downcase.strip)
        unless user && password_match?(user, params.require(:password))
          return render_error(401, "INVALID_CREDENTIALS", "Invalid email or password")
        end

        user.update!(last_sign_in_at: Time.current, jti: SecureRandom.uuid)
        memberships = user.organization_memberships.active.includes(:organization)
        render json: {
          data: {
            user: user_payload(user),
            organizations: memberships.map { |m|
              organization_payload(m.organization).merge(role: m.role)
            },
            tokens: issue_tokens(user)
          },
          meta: { request_id: @request_id }
        }
      end

      # POST /api/v1/auth/refresh
      def refresh
        payload = decode_token(params.require(:refresh_token))
        return render_error(401, "INVALID_TOKEN", "Invalid refresh token") unless payload && payload["type"] == "refresh"

        user = User.find_by(id: payload["sub"], jti: payload["jti"])
        return render_error(401, "INVALID_TOKEN", "Session revoked") unless user

        user.update!(jti: SecureRandom.uuid)
        render json: { data: { tokens: issue_tokens(user) }, meta: { request_id: @request_id } }
      end

      # POST /api/v1/auth/password/forgot
      def password_reset_request
        email = params.require(:email).to_s.downcase.strip
        user = User.find_by(email: email)
        # Always 202 — do not leak whether email exists
        if user
          token = encode_token(
            { sub: user.id, type: "password_reset", jti: user.jti, exp: 1.hour.from_now.to_i }
          )
          Mail::Deliver.call(:password_reset, user: user, token: token)
        end
        render json: {
          data: { message: "Se o e-mail existir, enviamos instruções de redefinição." },
          meta: { request_id: @request_id }
        }, status: :accepted
      end

      # POST /api/v1/auth/password/reset
      def password_reset
        payload = decode_token(params.require(:token))
        return render_error(401, "INVALID_TOKEN", "Token inválido ou expirado") unless payload && payload["type"] == "password_reset"

        user = User.find_by(id: payload["sub"], jti: payload["jti"])
        return render_error(401, "INVALID_TOKEN", "Token inválido") unless user

        password = params.require(:password)
        return render_error(422, "WEAK_PASSWORD", "Senha deve ter ao menos 8 caracteres") if password.to_s.length < 8

        user.update!(encrypted_password: hash_password(password), jti: SecureRandom.uuid)
        render json: {
          data: { message: "Senha atualizada. Faça login." },
          meta: { request_id: @request_id }
        }
      end

      # POST /api/v1/auth/verify_email
      def verify_email
        token = params.require(:token).to_s
        payload = decode_token(token)
        user = if payload && payload["type"] == "email_verification"
                 User.find_by(id: payload["sub"])
               else
                 User.find_by(email_verification_token: token)
               end

        return render_error(400, "INVALID_TOKEN", "Token de verificação inválido ou expirado") unless user

        user.update!(
          email_verified_at: Time.current,
          email_verification_token: nil
        )

        render json: {
          data: {
            message: "E-mail verificado com sucesso",
            user: user_payload(user)
          },
          meta: { request_id: @request_id }
        }
      end

      # POST /api/v1/auth/resend_verification
      def resend_verification
        email = params.require(:email).to_s.downcase.strip
        user = User.find_by(email: email)
        if user && (!user.respond_to?(:email_verified_at) || user.email_verified_at.nil?)
          token = encode_token({ sub: user.id, type: "email_verification", exp: 24.hours.from_now.to_i })
          user.update!(email_verification_token: token) if user.respond_to?(:email_verification_token=)
          begin
            Mail::Deliver.call(:email_verification, user: user, token: token)
          rescue StandardError => e
            Rails.logger.warn({ event: "resend_verification_failed", error: e.message }.to_json)
          end
        end

        render json: {
          data: { message: "Se o e-mail estiver cadastrado e não verificado, enviamos um novo link." },
          meta: { request_id: @request_id }
        }, status: :accepted
      end

      # GET /api/v1/me
      def me
        user = current_user_from_header
        return render_error(401, "UNAUTHENTICATED", "Unauthenticated") unless user

        memberships = user.organization_memberships.active.includes(:organization)
        render json: {
          data: {
            user: user_payload(user),
            organizations: memberships.map { |m|
              organization_payload(m.organization).merge(role: m.role)
            }
          },
          meta: { request_id: @request_id }
        }
      end

      private

      def set_request_id
        @request_id = request.headers["X-Request-Id"].presence || SecureRandom.uuid
        response.set_header("X-Request-Id", @request_id)
      end

      def hash_password(password)
        # MVP: use bcrypt if available, else SHA256 with salt marker (replace with Devise in production boot)
        if defined?(BCrypt)
          BCrypt::Password.create(password)
        else
          "sha256:#{Digest::SHA256.hexdigest("dronehub-mvp-#{password}")}"
        end
      end

      def password_match?(user, password)
        if user.encrypted_password.start_with?("sha256:")
          user.encrypted_password == hash_password(password)
        elsif defined?(BCrypt)
          BCrypt::Password.new(user.encrypted_password) == password
        else
          false
        end
      end

      def issue_tokens(user)
        now = Time.current.to_i
        access = encode_token({ sub: user.id, jti: user.jti, type: "access", exp: now + 15 * 60 })
        refresh = encode_token({ sub: user.id, jti: user.jti, type: "refresh", exp: now + 7 * 24 * 3600 })
        { access_token: access, refresh_token: refresh, token_type: "Bearer", expires_in: 900 }
      end

      def encode_token(payload)
        secret = ENV["JWT_SECRET"].presence || (Rails.env.production? ? (raise "JWT_SECRET required") : "dronehub-mvp-dev-secret-change-me")
        # Minimal JWT-like payload encoding for MVP boot without full devise-jwt
        body = Base64.urlsafe_encode64(payload.to_json)
        sig = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", secret, body))
        "#{body}.#{sig}"
      end

      def decode_token(token)
        secret = ENV["JWT_SECRET"].presence || (Rails.env.production? ? (raise "JWT_SECRET required") : "dronehub-mvp-dev-secret-change-me")
        body, sig = token.to_s.split(".", 2)
        return nil unless body && sig
        expected = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", secret, body))
        return nil unless ActiveSupport::SecurityUtils.secure_compare(expected, sig)

        payload = JSON.parse(Base64.urlsafe_decode64(body))
        return nil if payload["exp"] && payload["exp"] < Time.current.to_i
        payload
      rescue StandardError
        nil
      end

      def current_user_from_header
        auth = request.headers["Authorization"].to_s
        token = auth.split(" ").last
        payload = decode_token(token)
        return nil unless payload && payload["type"] == "access"
        User.find_by(id: payload["sub"], jti: payload["jti"])
      end

      def user_payload(user)
        {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          platform_role: user.platform_role,
          user_type: user.user_type,
          email_verified: user.respond_to?(:email_verified_at) && user.email_verified_at.present?
        }
      end

      def organization_payload(org)
        {
          id: org.id,
          name: org.name,
          slug: org.slug,
          role: nil,
          organization_type: org.organization_type,
          tenant_type: org.tenant_type
        }.compact
      end

      def normalized_user_type
        requested = params[:user_type].presence || params[:tenant_type].presence || params[:organization_type].presence
        case requested.to_s
        when "operator", "drone_operator"
          "operator"
        when "enterprise", "customer", "data_company", "engineering_company", "survey_company", "government", "research", ""
          "enterprise"
        else
          raise ActionController::ParameterMissing, "user_type must be operator or enterprise"
        end
      end

      def organization_type_for(user_type)
        user_type == "operator" ? "drone_operator" : "enterprise"
      end

      def unique_slug(name)
        base = name.to_s.parameterize.presence || "org"
        slug = base
        i = 1
        while Organization.exists?(slug: slug)
          slug = "#{base}-#{i}"
          i += 1
        end
        slug
      end

      def render_error(status, code, title)
        render json: {
          type: "https://api.dronehub.example/problems/#{code.downcase}",
          title: title,
          status: status,
          code: code,
          request_id: @request_id
        }, status: status
      end
    end
  end
end
