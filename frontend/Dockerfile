# ── Frontend Dockerfile ──────────────────────────────────────────────────────
# Stage 1: Build the React app
# Stage 2: Serve it with Nginx (tiny final image)
# ─────────────────────────────────────────────────────────────────────────────

# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies (cached layer if package.json unchanged)
COPY package.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ---- Production stage ----
FROM nginx:1.25-alpine

# Copy the optimised build output
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx config that enables React Router (HTML5 history API)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
