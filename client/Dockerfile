# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# VITE_API_URL must be set at build time — set this variable in Railway service settings
# e.g. VITE_API_URL=https://crm-inmobiliario-production-834e.up.railway.app/api
ARG VITE_API_URL=https://crm-inmobiliario-production-834e.up.railway.app/api
ARG VITE_PUBLIC_URL=https://crminmobiliario.es

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PUBLIC_URL=$VITE_PUBLIC_URL

RUN npx vite build

# ── Production stage — nginx ───────────────────────────────────────────────────
FROM nginx:1.26-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
