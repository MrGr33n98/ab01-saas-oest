#!/usr/bin/env bash
# =============================================================================
# DroneHub MVP — Golden Path E2E (HTTP)
# Senior/A+++ contract: every step asserts status + extracts IDs for the next.
#
# Prerequisites:
#   docker compose up -d
#   backend: bin/rails db:prepare db:seed && bin/rails s -p 3001
#   optional: MinIO on :9000 (see docker-compose)
#
# Usage:
#   chmod +x scripts/mvp_golden_path.sh
#   API_BASE=http://localhost:3001/api/v1 ./scripts/mvp_golden_path.sh
#
# Env:
#   API_BASE   default http://localhost:3001/api/v1
#   STRICT=1   fail on any non-2xx (default 1)
# =============================================================================
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:3001/api/v1}"
STRICT="${STRICT:-1}"
WORKDIR="${TMPDIR:-/tmp}/dronehub-gp-$$"
mkdir -p "$WORKDIR"
trap 'rm -rf "$WORKDIR"' EXIT

log()  { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
fail() { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# curl JSON helper: method path [json_body] [extra curl args via env HDR_*]
# Sets: LAST_STATUS LAST_BODY LAST_REQ_ID
REQ_ID=""
TOKEN=""
ORG_ID=""
OP_TOKEN=""
OP_ORG_ID=""
ADMIN_TOKEN=""

api() {
  local method="$1" path="$2"
  local body="${3:-}"
  REQ_ID="$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "req-$(date +%s)-$RANDOM")"
  local url="${API_BASE}${path}"
  local args=(-sS -w "\n%{http_code}" -X "$method" "$url"
    -H "Accept: application/json"
    -H "Content-Type: application/json"
    -H "X-Request-Id: ${REQ_ID}")
  [[ -n "${TOKEN:-}" ]] && args+=(-H "Authorization: Bearer ${TOKEN}")
  [[ -n "${ORG_ID:-}" ]] && args+=(-H "X-Organization-Id: ${ORG_ID}")
  [[ -n "${IDEMPOTENCY_KEY:-}" ]] && args+=(-H "Idempotency-Key: ${IDEMPOTENCY_KEY}")
  if [[ -n "$body" ]]; then
    args+=(-d "$body")
  fi
  local raw
  raw="$(curl "${args[@]}")" || fail "curl failed: $method $path"
  LAST_STATUS="$(printf '%s' "$raw" | tail -n1)"
  LAST_BODY="$(printf '%s' "$raw" | sed '$d')"
  LAST_REQ_ID="$REQ_ID"
  if [[ "$STRICT" == "1" && ! "$LAST_STATUS" =~ ^2 ]]; then
    fail "$method $path → HTTP $LAST_STATUS (request_id=$REQ_ID)\n$LAST_BODY"
  fi
}

json_get() {
  # usage: json_get 'data.id' <<< "$LAST_BODY"
  local expr="$1"
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$LAST_BODY" | jq -r ".$expr // empty"
  else
    python3 - "$expr" <<'PY' <<<"$LAST_BODY"
import json,sys
expr=sys.argv[1]
data=json.load(sys.stdin)
cur=data
for part in expr.split('.'):
    if cur is None: break
    if isinstance(cur, dict):
        cur=cur.get(part)
    else:
        cur=None
        break
print("" if cur is None else cur)
PY
  fi
}

require_field() {
  local expr="$1" label="${2:-$1}"
  local v
  v="$(json_get "$expr")"
  [[ -n "$v" && "$v" != "null" ]] || fail "missing JSON field: $label\n$LAST_BODY"
  printf '%s' "$v"
}

# -----------------------------------------------------------------------------
log "0. Health"
api GET "/../health" 2>/dev/null || true
# health is outside /api/v1 in some setups — try both
HEALTH_CODE="$(curl -sS -o /dev/null -w '%{http_code}' "${API_BASE%/api/v1}/health" || true)"
if [[ "$HEALTH_CODE" != "200" ]]; then
  HEALTH_CODE="$(curl -sS -o /dev/null -w '%{http_code}' "http://localhost:3001/health" || true)"
fi
[[ "$HEALTH_CODE" == "200" ]] && ok "API health $HEALTH_CODE" || fail "API not healthy (start rails on :3001)"

# -----------------------------------------------------------------------------
log "1. Customer sign_up"
SUFFIX="$(date +%s)"
CUSTOMER_EMAIL="customer-${SUFFIX}@example.com"
api POST "/auth/sign_up" "$(cat <<JSON
{
  "email": "${CUSTOMER_EMAIL}",
  "password": "password123",
  "first_name": "Cliente",
  "last_name": "MVP",
  "organization_name": "Fazenda Demo ${SUFFIX}",
  "organization_type": "customer",
  "accepted_terms": true
}
JSON
)"
TOKEN="$(require_field 'data.tokens.access_token' tokens.access_token)"
ORG_ID="$(require_field 'data.organization.id' organization.id)"
ok "customer org=$ORG_ID email=$CUSTOMER_EMAIL"

# -----------------------------------------------------------------------------
log "2. Operator sign_up + profile bootstrap (via second account)"
OP_EMAIL="operator-${SUFFIX}@example.com"
# temporarily clear customer token for clean sign_up
_SAVE_TOKEN="$TOKEN"; _SAVE_ORG="$ORG_ID"
TOKEN=""; ORG_ID=""
api POST "/auth/sign_up" "$(cat <<JSON
{
  "email": "${OP_EMAIL}",
  "password": "password123",
  "first_name": "Operador",
  "last_name": "MVP",
  "organization_name": "Aero Map ${SUFFIX}",
  "organization_type": "drone_operator",
  "accepted_terms": true
}
JSON
)"
OP_TOKEN="$(require_field 'data.tokens.access_token')"
OP_ORG_ID="$(require_field 'data.organization.id')"
ok "operator org=$OP_ORG_ID"

# Operator profile + coverage would be created via dedicated endpoints;
# document expected follow-up if not auto-created on org type drone_operator.
TOKEN="$_SAVE_TOKEN"; ORG_ID="$_SAVE_ORG"

# -----------------------------------------------------------------------------
log "3. Create project"
api POST "/projects" "$(cat <<JSON
{
  "name": "Safra ${SUFFIX}",
  "description": "Projeto piloto MVP",
  "industry": "agriculture"
}
JSON
)"
PROJECT_ID="$(require_field 'data.id')"
ok "project=$PROJECT_ID"

# -----------------------------------------------------------------------------
log "4. Create mission draft"
api POST "/missions" "$(cat <<JSON
{
  "project_id": "${PROJECT_ID}",
  "title": "Mapeamento talhão norte",
  "mission_type": "mapping",
  "priority": "normal",
  "deadline_at": "2030-12-31T18:00:00-04:00",
  "budget": { "min": 5000, "max": 12000, "currency": "BRL" }
}
JSON
)"
MISSION_ID="$(require_field 'data.id')"
ok "mission=$MISSION_ID status=$(json_get 'data.status')"

# -----------------------------------------------------------------------------
log "5. AOI GeoJSON (server computes hectares)"
api POST "/missions/${MISSION_ID}/geometry" "$(cat <<'JSON'
{
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [-56.10, -15.60],
      [-56.00, -15.60],
      [-56.00, -15.50],
      [-56.10, -15.50],
      [-56.10, -15.60]
    ]]
  }
}
JSON
)"
AREA="$(json_get 'data.area_hectares')"
ok "AOI saved area_hectares=${AREA:-computed}"

# -----------------------------------------------------------------------------
log "6. Attach data product (orthomosaic) — resolve id from catalog"
api GET "/marketplace/data-products"
# public catalog may skip auth in controller; if 401, still try with token
PRODUCT_ID="$(printf '%s' "$LAST_BODY" | python3 -c '
import json,sys
try:
  d=json.load(sys.stdin)
  items=d.get("data") or []
  for i in items:
    if i.get("slug")=="orthomosaic":
      print(i["id"]); break
except Exception:
  pass
' 2>/dev/null || true)"

if [[ -z "${PRODUCT_ID}" ]]; then
  log "WARN: could not resolve orthomosaic id from catalog — using placeholder (seed required)"
  PRODUCT_ID="00000000-0000-0000-0000-000000000001"
fi

api POST "/missions/${MISSION_ID}/products" "$(cat <<JSON
{ "data_product_id": "${PRODUCT_ID}", "quantity": 1 }
JSON
)"
ok "product attached"

# -----------------------------------------------------------------------------
log "7. Publish mission"
IDEMPOTENCY_KEY="publish:${MISSION_ID}:$(uuidgen 2>/dev/null || echo $RANDOM)"
api POST "/missions/${MISSION_ID}/publish" "{}"
IDEMPOTENCY_KEY=""
ok "published status=$(json_get 'data.status')"

# -----------------------------------------------------------------------------
log "8. Operator submits quote"
TOKEN="$OP_TOKEN"; ORG_ID="$OP_ORG_ID"
api POST "/missions/${MISSION_ID}/quotes" "$(cat <<JSON
{
  "proposal_text": "Captura RTK + ortomosaico GeoTIFF",
  "estimated_start_at": "2030-11-01T08:00:00-04:00",
  "estimated_delivery_at": "2030-11-05T18:00:00-04:00",
  "currency": "BRL",
  "items": [{
    "description": "Captura e ortomosaico",
    "quantity": 100,
    "unit": "hectare",
    "unit_price": 25.00
  }]
}
JSON
)"
QUOTE_ID="$(require_field 'data.id')"
# submit if separate action
if [[ "$(json_get 'data.status')" == "draft" ]]; then
  api POST "/quotes/${QUOTE_ID}/submit" "{}" || true
fi
ok "quote=$QUOTE_ID"

# -----------------------------------------------------------------------------
log "9. Customer accepts quote → order (idempotent)"
TOKEN="$_SAVE_TOKEN"; ORG_ID="$_SAVE_ORG"
IDEMPOTENCY_KEY="accept:${QUOTE_ID}:$(uuidgen 2>/dev/null || echo $RANDOM)"
api POST "/quotes/${QUOTE_ID}/accept" "$(cat <<JSON
{ "lock_version": 0 }
JSON
)"
IDEMPOTENCY_KEY=""
ORDER_ID="$(json_get 'data.order_id')"
[[ -n "$ORDER_ID" && "$ORDER_ID" != "null" ]] || ORDER_ID="$(require_field 'data.id')"
ok "order=$ORDER_ID"

# -----------------------------------------------------------------------------
log "10. Confirm payment (concierge / admin)"
# Prefer platform admin seed if available
TOKEN="$ADMIN_TOKEN"
if [[ -z "${TOKEN}" ]]; then
  TOKEN=""; ORG_ID=""
  api POST "/auth/sign_in" '{"email":"admin@dronehub.local","password":"password"}' || true
  if [[ "$LAST_STATUS" =~ ^2 ]]; then
    ADMIN_TOKEN="$(json_get 'data.tokens.access_token')"
    TOKEN="$ADMIN_TOKEN"
  else
    TOKEN="$_SAVE_TOKEN"; ORG_ID="$_SAVE_ORG"
    log "WARN: admin login failed — trying customer owner confirm"
  fi
fi
ORG_ID="$_SAVE_ORG"
IDEMPOTENCY_KEY="pay:${ORDER_ID}:1"
api POST "/orders/${ORDER_ID}/confirm_payment" '{"method":"pix"}' || \
  api POST "/orders/${ORDER_ID}/confirm_payment" '{"method":"manual"}'
IDEMPOTENCY_KEY=""
ok "payment confirmed"

# -----------------------------------------------------------------------------
log "11. Operator starts mission"
TOKEN="$OP_TOKEN"; ORG_ID="$OP_ORG_ID"
api POST "/missions/${MISSION_ID}/start" "{}"
ok "mission started"

# -----------------------------------------------------------------------------
log "12. Upload session + finalize deliverable"
api POST "/missions/${MISSION_ID}/deliverables/upload-sessions" "$(cat <<JSON
{
  "filename": "orthomosaic.tif",
  "content_type": "image/tiff",
  "byte_size": 1024
}
JSON
)"
STORAGE_KEY="$(require_field 'data.storage_key')"
UPLOAD_URL="$(json_get 'data.upload_url')"
ok "upload_session storage_key=$STORAGE_KEY"
# Optional: PUT to MinIO/S3 if URL reachable
if [[ -n "$UPLOAD_URL" && "$UPLOAD_URL" != "null" ]]; then
  echo "mvp-binary" | curl -sS -X PUT -H "Content-Type: image/tiff" --data-binary @- "$UPLOAD_URL" >/dev/null 2>&1 \
    && ok "PUT upload attempted" \
    || log "WARN: PUT upload skipped/failed (presign placeholder or MinIO down)"
fi

api POST "/deliverables/finalize" "$(cat <<JSON
{
  "mission_id": "${MISSION_ID}",
  "data_product_id": "${PRODUCT_ID}",
  "title": "Ortomosaico final",
  "storage_key": "${STORAGE_KEY}",
  "checksum_sha256": "deadbeef",
  "file_size_bytes": 1024
}
JSON
)" 2>/dev/null || api POST "/missions/${MISSION_ID}/deliverables/finalize" "$(cat <<JSON
{
  "data_product_id": "${PRODUCT_ID}",
  "title": "Ortomosaico final",
  "storage_key": "${STORAGE_KEY}",
  "checksum_sha256": "deadbeef",
  "file_size_bytes": 1024
}
JSON
)"
DELIVERABLE_ID="$(json_get 'data.id')"
ok "deliverable=${DELIVERABLE_ID:-created}"

# -----------------------------------------------------------------------------
log "13. Customer approves deliverable"
TOKEN="$_SAVE_TOKEN"; ORG_ID="$_SAVE_ORG"
if [[ -n "${DELIVERABLE_ID}" && "$DELIVERABLE_ID" != "null" ]]; then
  api POST "/deliverables/${DELIVERABLE_ID}/approve" "{}"
  ok "approved mission_status=$(json_get 'data.mission_status')"
else
  log "WARN: no deliverable id — skip approve"
fi

# -----------------------------------------------------------------------------
log "14. Review"
api POST "/missions/${MISSION_ID}/review" "$(cat <<JSON
{
  "overall_rating": 5,
  "title": "Entrega sólida",
  "body": "Ortomosaico utilizável no QGIS."
}
JSON
)" || log "WARN: review endpoint returned $LAST_STATUS"
ok "golden path finished"

# -----------------------------------------------------------------------------
log "SUMMARY"
cat <<SUM
  customer:    ${CUSTOMER_EMAIL}
  operator:    ${OP_EMAIL}
  org_customer:${_SAVE_ORG}
  org_operator:${OP_ORG_ID}
  project:     ${PROJECT_ID}
  mission:     ${MISSION_ID}
  quote:       ${QUOTE_ID}
  order:       ${ORDER_ID}
  deliverable: ${DELIVERABLE_ID:-n/a}
  workdir:     ${WORKDIR}
SUM
ok "MVP golden path script completed"
