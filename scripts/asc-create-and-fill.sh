#!/usr/bin/env bash
# Create the Qualcarro App Store Connect record (needs Apple ID + 2FA),
# fill listing fields, upload the signed IPA. Does not submit for review.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

NAME="Qual carro?"
BUNDLE_ID="app.qualcarro"
SKU="QUALCARRO-IOS"
LOCALE="pt-BR"
VERSION="1.0.0"
APPLE_ID="erik.theuer@gmail.com"
IPA="$ROOT/.asc/artifacts/Qualcarro.ipa"
META="$ROOT/metadata"
SHOTS="$ROOT/screenshots/store"

if [[ ! -f "$IPA" ]]; then
  echo "missing IPA: $IPA" >&2
  exit 1
fi

resolve_app_id() {
  asc apps list --output json | python3 -c "
import json,sys
raw=sys.stdin.read()
dec=json.JSONDecoder()
idx=0
items=[]
while idx < len(raw):
    while idx < len(raw) and raw[idx].isspace():
        idx += 1
    if idx >= len(raw):
        break
    obj, end = dec.raw_decode(raw, idx)
    idx = end
    chunk = obj if isinstance(obj, list) else obj.get('data', obj.get('apps', []))
    if isinstance(chunk, list):
        items.extend(chunk)
    elif isinstance(obj, dict) and obj.get('id'):
        items.append(obj)
for i in items:
    a = i.get('attributes', i)
    if a.get('bundleId') == '${BUNDLE_ID}' or i.get('bundleId') == '${BUNDLE_ID}':
        print(i.get('id') or a.get('id') or '')
        break
"
}

APP_ID="$(resolve_app_id || true)"
if [[ -z "${APP_ID}" ]]; then
  echo "No App Store Connect record for ${BUNDLE_ID}."
  echo "Creating it. Enter your Apple ID password and 2FA in this window."
  asc web apps create \
    --name "$NAME" \
    --bundle-id "$BUNDLE_ID" \
    --sku "$SKU" \
    --primary-locale "$LOCALE" \
    --apple-id "$APPLE_ID" \
    --platform IOS \
    --version "$VERSION" \
    --output json --pretty
  APP_ID="$(resolve_app_id || true)"
fi

if [[ -z "${APP_ID}" ]]; then
  echo "App record still missing after create." >&2
  exit 1
fi

echo "APP_ID=${APP_ID}"
mkdir -p "$ROOT/.asc"
printf '%s\n' "$APP_ID" > "$ROOT/.asc/app-id"

python3 - <<PY
from pathlib import Path
p = Path("$ROOT/eas.json")
import json
d = json.loads(p.read_text())
d.setdefault("submit", {}).setdefault("production", {}).setdefault("ios", {})["ascAppId"] = "$APP_ID"
p.write_text(json.dumps(d, indent=2) + "\n")
PY

asc metadata validate --dir "$META" --output table

asc app-setup info set \
  --app "$APP_ID" \
  --primary-locale "$LOCALE" \
  --locale "$LOCALE" \
  --name "$NAME" \
  --subtitle "Carro certo no metrô de SP" \
  --privacy-policy-url "https://etheuer.github.io/qual-carro/legal/privacidade.html" \
  --content-rights DOES_NOT_USE_THIRD_PARTY_CONTENT \
  --output table

asc app-setup categories set \
  --app "$APP_ID" \
  --primary NAVIGATION \
  --secondary TRAVEL \
  --output table

asc app-setup pricing set --app "$APP_ID" --free --output table || true

if ! asc pricing availability view --app "$APP_ID" --output json >/dev/null 2>&1; then
  asc pricing availability create \
    --app "$APP_ID" \
    --territory "BRA,USA" \
    --available true \
    --available-in-new-territories true \
    --output table || true
fi
asc app-setup availability edit --app "$APP_ID" --all-territories --available true --output table || true

asc metadata apply \
  --app "$APP_ID" \
  --version "$VERSION" \
  --platform IOS \
  --dir "$META" \
  --output table

VERSION_ID="$(asc versions list --app "$APP_ID" --output json | python3 -c "
import json,sys
d=json.load(sys.stdin)
items=d if isinstance(d,list) else d.get('data',[])
want='$VERSION'
for i in items:
    a=i.get('attributes',i)
    if a.get('versionString')==want:
        print(i.get('id')); break
else:
    if items:
        print(items[0].get('id',''))
")"

if [[ -n "${VERSION_ID}" ]]; then
  asc versions update --version-id "$VERSION_ID" --copyright "2026 Erik Theuer" --release-type AFTER_APPROVAL --output table
  asc age-rating edit --app "$APP_ID" --all-none --output table || true
  NOTES="$(python3 - <<'PY'
print("""Qual carro? is a São Paulo metro boarding guide. There is no login. Enter a destination (optional origin), pick line/direction and intent (stairs / street exit / transfer). Painted cars are the suggested boarding zone. Car 1 is the front of the train in that direction.

Data is not an official Metrô map. Seeded transfers are only stations the public record constrains (Sé middle; Paraíso / Ana Rosa / Consolação–Paulista / Luz “any car”). Other platforms stay unknown until riders report Frente/Meio/Trás. A cell publishes at 5 votes and ≥70% agreement; the app then hides the ask.

Reports go to https://qual-carro-reports.sunny-mangosteen.workers.dev/reports (anonymous device id + cell + zone). No GPS.

ITSAppUsesNonExemptEncryption is false. Contact: erik.theuer@gmail.com""")
PY
)"
  if ! asc review details-for-version --version-id "$VERSION_ID" --output json >/dev/null 2>&1; then
    asc review details-create \
      --version-id "$VERSION_ID" \
      --contact-first-name Erik \
      --contact-last-name Theuer \
      --contact-email erik.theuer@gmail.com \
      --contact-phone "+5511981995909" \
      --demo-account-required=false \
      --notes "$NOTES" \
      --output table
  else
    DETAIL_ID="$(asc review details-for-version --version-id "$VERSION_ID" --output json | python3 -c "import json,sys; d=json.load(sys.stdin); data=d.get('data',d); print(data.get('id',''))")"
    if [[ -n "${DETAIL_ID}" ]]; then
      asc review details-update \
        --id "$DETAIL_ID" \
        --contact-first-name Erik \
        --contact-last-name Theuer \
        --contact-email erik.theuer@gmail.com \
        --contact-phone "+5511981995909" \
        --notes "$NOTES" \
        --output table
    fi
  fi

  LOC_ID="$(asc localizations list --version "$VERSION_ID" --output json | python3 -c "
import json,sys
d=json.load(sys.stdin)
items=d if isinstance(d,list) else d.get('data',[])
for i in items:
    a=i.get('attributes',i)
    if a.get('locale')=='pt-BR':
        print(i.get('id')); break
")"
  if [[ -n "${LOC_ID}" ]]; then
    asc screenshots upload \
      --version-localization "$LOC_ID" \
      --path "$SHOTS" \
      --device-type IPHONE_69 \
      --skip-existing \
      --output table
  fi
fi

echo "Uploading IPA (no submit)."
asc builds upload --app "$APP_ID" --ipa "$IPA" --wait --output table

echo
echo "Done. App $APP_ID, version $VERSION uploaded. Not submitted for review."
echo "Still needs: App Privacy questionnaire + Publish in App Store Connect (web session)."
echo "Then: asc validate --app $APP_ID --version $VERSION --platform IOS"
