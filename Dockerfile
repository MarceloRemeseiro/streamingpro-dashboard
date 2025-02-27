FROM node:18-alpine

# Instalar clientes de bases de datos
RUN apk add --no-cache \
    postgresql-client \
    mongodb-tools

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias y generar cliente Prisma
RUN npm install
RUN npx prisma generate

COPY . .

EXPOSE 1001

CMD ["npm", "run", "start"] 