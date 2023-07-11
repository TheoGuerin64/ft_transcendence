FROM node:current-alpine

RUN npm install -g @nestjs/cli

WORKDIR /app

COPY start.sh /app

CMD ["sh", "start.sh"]
