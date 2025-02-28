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

# Crear directorio scripts
RUN mkdir -p /app/scripts

# Instalar dependencias
RUN npm install

# Generar cliente Prisma
RUN npx prisma generate

# Copiar el resto de archivos
COPY . .

# Exponer puerto
EXPOSE 1001

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"] 