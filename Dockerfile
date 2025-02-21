FROM node:18-alpine

# Instalar cliente PostgreSQL para pg_dump
RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install -g prisma
RUN npx prisma generate

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"] 