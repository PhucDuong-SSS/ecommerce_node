FROM node:20

EXPOSE 9000

WORKDIR /app

RUN npm i npm@latest -g

COPY package.json package-lock.json ./

RUN npm install

COPY ..

CMD ["node", "server.js"]