#!/usr/bin/env bash
# Run from a repo checkout after the documented contributor/bootstrap setup.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${TWIN_PYTHON:=python}"

if [[ ! -f apps/web/package-lock.json || ! -d apps/web/node_modules ]]; then
  echo >&2 'Install Node 24 and run npm --prefix apps/web ci --ignore-scripts first.'
  exit 2
fi
"$TWIN_PYTHON" -m unittest discover -s tests -v
"$TWIN_PYTHON" -m datacenter_twin simulate --preset generator_failure --format markdown > /dev/null
npm --prefix apps/web run format:check
npm --prefix apps/web run build
"$TWIN_PYTHON" scripts/fetch_study_runtime.py
"$TWIN_PYTHON" scripts/prepare_browser_demo.py
npm --prefix apps/web run test:engine
npm --prefix apps/web run build:demo
npm --prefix apps/web run test:demo
if [[ "${AUDIT_HOSTED_SITE:-0}" == '1' ]]; then
  "$TWIN_PYTHON" scripts/audit_public_site.py --strict-seo --out outputs/audit/public-site.json
fi
echo 'Local audit gates passed. Deployment, field-vitals measurement and merge remain separate steps.'
