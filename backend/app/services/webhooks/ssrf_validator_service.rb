# frozen_string_literal: true

require "resolv"
require "ipaddr"

module Webhooks
  class SsrfValidatorService
    BLOCKED_RANGES = [
      IPAddr.new("127.0.0.0/8"),       # Loopback
      IPAddr.new("10.0.0.0/8"),        # Private IPv4 Class A
      IPAddr.new("172.16.0.0/12"),     # Private IPv4 Class B
      IPAddr.new("192.168.0.0/16"),    # Private IPv4 Class C
      IPAddr.new("169.254.0.0/16"),    # Link-local & Cloud Metadata (AWS/GCP/Azure)
      IPAddr.new("0.0.0.0/8"),        # Current network
      IPAddr.new("224.0.0.0/4"),       # Multicast
      IPAddr.new("240.0.0.0/4"),       # Reserved
      IPAddr.new("255.255.255.255/32"),# Broadcast
      IPAddr.new("::1/128"),           # IPv6 Loopback
      IPAddr.new("fc00::/7"),          # IPv6 Unique Local Address (ULA)
      IPAddr.new("fe80::/10"),         # IPv6 Link-local
      IPAddr.new("ff00::/8")           # IPv6 Multicast
    ].freeze

    def self.validate(url_string)
      new(url_string).validate
    end

    def initialize(url_string)
      @url_string = url_string
    end

    def validate
      uri = URI.parse(@url_string)
      return { valid: false, reason: "Only HTTP and HTTPS protocols are supported." } unless %w[http https].include?(uri.scheme&.downcase)
      return { valid: false, reason: "Hostname is missing." } if uri.host.blank?

      addresses = Resolv.getaddresses(uri.host)
      return { valid: false, reason: "Hostname '#{uri.host}' could not be resolved." } if addresses.empty?

      addresses.each do |addr|
        ip = IPAddr.new(addr)
        BLOCKED_RANGES.each do |blocked_range|
          if blocked_range.include?(ip)
            return { valid: false, reason: "Destination IP '#{addr}' is in a restricted/private network range (SSRF Protection)." }
          end
        end
      end

      { valid: true, addresses: addresses }
    rescue URI::InvalidURIError, IPAddr::InvalidAddressError => e
      { valid: false, reason: "Invalid destination address: #{e.message}" }
    end
  end
end
