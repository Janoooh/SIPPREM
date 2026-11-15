# Dockerfile: Instrucciones paso a paso para construir la imagen del servicio App Patrullero.

# 1ero : ENTORNO DE CONSTRUCCIÓN (Node.js)
FROM node:20-alpine AS build
WORKDIR /app

# Copiar solo los archivos de dependencias primero (optimiza el caché de Docker)
COPY package*.json ./
RUN npm install
# Copiar el resto de los archivos de la aplicación  
COPY . .

# VITE_BACKEND_URL es una variable de entorno que se utiliza en la aplicación Vite para definir la URL del backend.
# Se recibe el argumento desde el docker-compose
ARG VITE_BACKEND_URL
ARG VITE_MAP_TILE_URL
# Se combierte en variable de entorno para que Vite lo lea
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_MAP_TILE_URL=$VITE_MAP_TILE_URL

# Compilar la aplicación Vite (React) para producción
RUN npm run build

# 2do : SERVIDOR DE PRODUCCIÓN (Nginx)
FROM nginx:stable-alpine

# Copiar los archivos compilados desde la etapa de construcción al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Puerto interno 80 de Nginx
EXPOSE 80

# Comando de ejecución: Iniciar Nginx en primer plano (para que el contenedor no se detenga).
CMD ["nginx", "-g", "daemon off;"]