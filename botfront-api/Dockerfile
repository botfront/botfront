FROM node:8-alpine
ENV PROJECT_HOME=/app

WORKDIR ${PROJECT_HOME}

COPY package*.json ./
RUN npm install --unsafe-perm
COPY . ${PROJECT_HOME}
EXPOSE 8080
CMD [ "npm", "start" ]