#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/dronehub}"
COMPOSE_FILE="$APP_DIR/deploy/compose.production.yml"
ENV_FILE="$APP_DIR/.env"
RELEASE_FILE="$APP_DIR/.release.env"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-120}"

: "${API_IMAGE:?API_IMAGE is required}"
: "${WEB_IMAGE:?WEB_IMAGE is required}"
: "${RELEASE_SHA:?RELEASE_SHA is required}"

test -f "$COMPOSE_FILE"
test -f "$ENV_FILE"
command -v docker >/dev/null
docker compose version >/dev/null

umask 077
printf 'API_IMAGE=%s\nWEB_IMAGE=%s\nRELEASE_SHA=%s\n' \
  "$API_IMAGE" "$WEB_IMAGE" "$RELEASE_SHA" > "$RELEASE_FILE"

compose() {
  docker compose --project-directory "$APP_DIR" \
    --env-file "$ENV_FILE" --env-file "$RELEASE_FILE" \
    -f "$COMPOSE_FILE" "$@"
}

previous_image() {
  local service="$1" container
  container="$(compose ps -q "$service" 2>/dev/null || true)"
  if [[ -n "$container" ]]; then
    docker inspect --format '{{.Config.Image}}' "$container"
  fi
}

PREVIOUS_API_IMAGE="$(previous_image api || true)"
PREVIOUS_WEB_IMAGE="$(previous_image web || true)"
rollback_needed=false

rollback() {
  status=$?
  if [[ "$rollback_needed" == true && -n "$PREVIOUS_API_IMAGE" && -n "$PREVIOUS_WEB_IMAGE" ]]; then
    echo "Deployment failed; restoring the previous application images." >&2
    printf 'API_IMAGE=%s\nWEB_IMAGE=%s\nRELEASE_SHA=rollback\n' \
      "$PREVIOUS_API_IMAGE" "$PREVIOUS_WEB_IMAGE" > "$RELEASE_FILE"
    compose up -d --no-deps api worker web || true
  fi
  exit "$status"
}
trap rollback ERR

compose config -q
compose up -d --wait --wait-timeout "$WAIT_TIMEOUT" db redis
compose pull api worker web
compose run --rm --no-deps api bundle exec rails db:migrate

rollback_needed=true
compose up -d --remove-orphans --wait --wait-timeout "$WAIT_TIMEOUT" api worker web
rollback_needed=false

echo "Deployment completed: $RELEASE_SHA"
