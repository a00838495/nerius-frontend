# =============================================================================
# Stage 1 — build the Vite/React bundle
# =============================================================================
# Debian slim (not alpine) to avoid the well-known ETXTBSY race between
# BuildKit's overlay FS and esbuild's postinstall script under musl.
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install deps with cache-friendly layering.
COPY package.json package-lock.json* ./

# Two-step install: first fetch packages without running install scripts, then
# rebuild. This forces BuildKit to flush the binaries to disk before any of
# them is exec'd, which is what triggers ETXTBSY when done in a single step.
RUN if [ -f package-lock.json ]; then \
        npm ci --no-audit --no-fund --ignore-scripts; \
    else \
        npm install --no-audit --no-fund --ignore-scripts; \
    fi \
 && npm rebuild

# Build
COPY . .
RUN npm run build


# =============================================================================
# Stage 2 — nginx serves dist/ and reverse-proxies /api to BACKEND_URL
# =============================================================================
FROM nginx:alpine

# Templating tool is already in the base image (envsubst from gettext).
# Copy our config template and entrypoint.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.d/40-render-config.sh
RUN chmod +x /docker-entrypoint.d/40-render-config.sh

# Copy the built static assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Defaults — both are overridden by the platform (Cloud Run / Dockploy)
ENV BACKEND_URL=http://backend:8080
ENV PORT=80

# Cloud Run injects $PORT; Dockploy lets you map any host port to this.
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --spider "http://127.0.0.1:${PORT}/" || exit 1

# nginx:alpine's default ENTRYPOINT runs everything in /docker-entrypoint.d/
# and then exec's nginx -g 'daemon off;'. Our 40-render-config.sh produces
# /etc/nginx/conf.d/default.conf from the template.
