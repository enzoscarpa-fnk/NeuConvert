# Stage 1: Build
FROM node:20-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV CI=false
RUN npm run build

# Stage 2: Production avec Nginx
FROM nginx:alpine as production-stage

# Copier le build Vite
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copier la config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
