FROM node:20-alpine

WORKDIR /app

COPY package.json tsconfig.json tsconfig.build.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
