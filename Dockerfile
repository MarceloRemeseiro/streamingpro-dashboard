FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install -g prisma
RUN npx prisma generate

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"] 