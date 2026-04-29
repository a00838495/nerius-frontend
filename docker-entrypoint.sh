#!/bin/sh
# Render /etc/nginx/conf.d/default.conf from the template using envsubst.
# Only ${PORT} and ${BACKEND_URL} are substituted — every other $var in the
# template (nginx variables like $host, $uri) is left untouched.
set -e

: "${PORT:=80}"
: "${BACKEND_URL:?BACKEND_URL must be set (e.g. http://backend:8080 or https://nerius-backend-xxx.run.app)}"

export PORT BACKEND_URL

envsubst '${PORT} ${BACKEND_URL}' \
    < /etc/nginx/templates/default.conf.template \
    > /etc/nginx/conf.d/default.conf

echo "[entrypoint] nginx will listen on :${PORT} and proxy /api -> ${BACKEND_URL}"
