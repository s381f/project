FROM node:20

COPY package*.json ./

RUN npm install

COPY src ./src
COPY .env ./.env

EXPOSE 3000
CMD [ "npm", "run", "start" ]
