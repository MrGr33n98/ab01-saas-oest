# syntax=docker/dockerfile:1.7
# The lockfile is intentionally mandatory: production dependencies must be reproducible.
FROM ruby:3.3-slim AS dependencies
WORKDIR /app
ENV BUNDLE_DEPLOYMENT=1 \
    BUNDLE_WITHOUT=development:test \
    BUNDLE_PATH=/usr/local/bundle
RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential libpq-dev curl \
  && rm -rf /var/lib/apt/lists/*
COPY backend/Gemfile backend/Gemfile.lock ./
RUN --mount=type=cache,target=/usr/local/bundle/cache bundle install --jobs 4 --retry 3

FROM ruby:3.3-slim AS runtime
WORKDIR /app
ENV RAILS_ENV=production \
    RACK_ENV=production \
    RAILS_LOG_TO_STDOUT=true \
    RAILS_SERVE_STATIC_FILES=true \
    BUNDLE_DEPLOYMENT=1 \
    BUNDLE_WITHOUT=development:test \
    BUNDLE_PATH=/usr/local/bundle
RUN apt-get update \
  && apt-get install -y --no-install-recommends libpq5 curl \
  && rm -rf /var/lib/apt/lists/* \
  && useradd --system --uid 1001 --create-home app
COPY --from=dependencies /usr/local/bundle /usr/local/bundle
COPY backend/ ./
RUN test -f config.ru \
  && test -f config/environment.rb \
  && test -x bin/rails \
  && chown -R app:app /app
USER app
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD ruby -rnet/http -e 'exit(Net::HTTP.get_response(URI("http://127.0.0.1:3000/health")).is_a?(Net::HTTPSuccess) ? 0 : 1)'
CMD ["bundle", "exec", "puma", "-b", "tcp://0.0.0.0:3000"]
