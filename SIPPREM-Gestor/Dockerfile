# Parte 1: Compilación de la aplicación
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Recibir los argumentos de Vite
ARG VITE_BACKEND_URL
ARG VITE_MAP_TILE_URL

# Convertir a variables de entorno internas
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_MAP_TILE_URL=$VITE_MAP_TILE_URL

# Compilar la aplicación 
RUN npm run build

# Parte 2: Servidor web estático con Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]