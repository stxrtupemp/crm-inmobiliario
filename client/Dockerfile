# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Inject build-time env (VITE_* variables must be available at build time)
ARG VITE_API_URL=/api
ARG VITE_PUBLIC_URL=https://crminmobiliario.es

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PUBLIC_URL=$VITE_PUBLIC_URL

RUN npx vite build

# ── Production stage — nginx ───────────────────────────────────────────────────
FROM nginx:1.26-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Store nginx config as a template — API_SERVER is substituted at container start
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# API_SERVER is the backend Railway URL (no trailing slash)
ENV API_SERVER=https://crm-inmobiliario-production-834e.up.railway.app

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

# Inject API_SERVER into nginx config at startup, then launch nginx
CMD ["/bin/sh", "-c", "envsubst '$API_SERVER' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
