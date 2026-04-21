# Etapa 1: Construir la aplicación
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration production

# Etapa 2: Servir con Nginx (un servidor web super rápido)
FROM nginx:alpine
COPY --from=build /app/dist/impacto-visible /usr/share/nginx/html
EXPOSE 80
