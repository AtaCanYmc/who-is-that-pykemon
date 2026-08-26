# ==========================================
# Stage 1: Build Frontend App
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Accept API URL build argument (defaults to empty string for relative /api or direct URL)
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==========================================
# Stage 2: Serve with Nginx
# ==========================================
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
