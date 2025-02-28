FROM node:18-alpine

# Instalar clientes de bases de datos y dependencias necesarias
RUN apk add --no-cache \
    postgresql-client \
    mongodb-tools \
    openssl

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Generar cliente Prisma
RUN npx prisma generate

# Copiar el resto de archivos
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 1001

# Comando para iniciar la aplicación usando el servidor standalone
CMD ["node", ".next/standalone/server.js"] 