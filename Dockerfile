FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY . .
RUN npm install --development
RUN npm run build
CMD [ "node", "dist/index.js" ]
