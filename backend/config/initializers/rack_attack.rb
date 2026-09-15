# frozen_string_literal: true

class Rack::Attack
  # Rate limit login by IP: 5 attempts per 20s
  throttle("auth/sign_in/ip", limit: 5, period: 20.seconds) do |req|
    req.ip if req.path == "/api/v1/auth/sign_in" && req.post?
  end

  # Rate limit sign-in by email: 10 attempts per minute
  throttle("auth/sign_in/email", limit: 10, period: 1.minute) do |req|
    if req.path == "/api/v1/auth/sign_in" && req.post?
      begin
        params = JSON.parse(req.body.tap(&:rewind).read)
        params["email"].to_s.downcase.strip.presence
      rescue StandardError
        nil
      end
    end
  end

  # Rate limit sign-up by IP: 5 accounts per 10 minutes
  throttle("auth/sign_up/ip", limit: 5, period: 10.minutes) do |req|
    req.ip if req.path == "/api/v1/auth/sign_up" && req.post?
  end

  # Rate limit password reset requests: 3 per 15 minutes per IP
  throttle("auth/password_reset/ip", limit: 3, period: 15.minutes) do |req|
    req.ip if req.path.start_with?("/api/v1/auth/password/forgot") && req.post?
  end

  # Rate limit general auth endpoints
  throttle("auth/ip", limit: 60, period: 1.minute) do |req|
    req.ip if req.path.start_with?("/api/v1/auth")
  end

  # Rate limit quote requests creation
  throttle("quote_requests/ip", limit: 10, period: 1.minute) do |req|
    req.ip if req.path.include?("quote_requests") && req.post?
  end

  # Global API throttle
  throttle("api/ip", limit: 300, period: 1.minute) do |req|
    req.ip if req.path.start_with?("/api/")
  end

  # Custom JSON API throttled response
  self.throttled_responder = lambda do |req|
    match_data = req.env["rack.attack.match_data"]
    now = match_data ? match_data[:epoch_time] : Time.current.to_i
    retry_after = match_data ? (match_data[:period] - (now % match_data[:period])) : 60

    headers = {
      "Content-Type" => "application/json; charset=utf-8",
      "Retry-After" => retry_after.to_s,
      "X-RateLimit-Limit" => match_data ? match_data[:limit].to_s : "0",
      "X-RateLimit-Remaining" => "0"
    }

    body = {
      type: "https://api.dronehub.example/problems/rate-limited",
      title: "Muitas requisições. Aguarde antes de tentar novamente.",
      status: 429,
      code: "RATE_LIMITED",
      retry_after: retry_after,
      request_id: req.env["HTTP_X_REQUEST_ID"] || SecureRandom.uuid
    }.to_json

    [429, headers, [body]]
  end
end
