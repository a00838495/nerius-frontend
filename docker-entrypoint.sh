#!/bin/sh
# Render /etc/nginx/conf.d/default.conf from the template using envsubst.
# Only ${PORT} and ${BACKEND_URL} are substituted — every other $var in the
# template (nginx variables like $host, $uri) is left untouched.
set -e

: "${PORT:=80}"
: "${BACKEND_URL:?BACKEND_URL must be set (e.g. http://backend:8080 or https://nerius-backend-xxx.run.app)}"

# Derive BACKEND_HOST from BACKEND_URL (strip scheme, path, and port).
# Cloud Run upstream needs the bare host for the Host header + TLS SNI.
BACKEND_HOST="$(echo "$BACKEND_URL" | sed -E 's#^[a-z]+://##; s#/.*$##; s#:[0-9]+$##')"

export PORT BACKEND_URL BACKEND_HOST

envsubst '${PORT} ${BACKEND_URL} ${BACKEND_HOST}' \
    < /etc/nginx/templates/default.conf.template \
    > /etc/nginx/conf.d/default.conf

echo "[entrypoint] nginx :${PORT} -> proxy /api to ${BACKEND_URL} (Host: ${BACKEND_HOST})"
