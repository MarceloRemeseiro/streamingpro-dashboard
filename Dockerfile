FROM node:18-alpine

# Instalar clientes de bases de datos
RUN apk add --no-cache \
    postgresql-client \
    mariadb-client \
    mongodb-tools \
    redis

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install -g prisma
RUN npx prisma generate

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"] 