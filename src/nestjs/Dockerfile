FROM node:current-alpine AS base

WORKDIR /app/backend
EXPOSE 3000

RUN npm install -g @nestjs/cli

COPY ./scripts /app

FROM base AS development
CMD ["sh", "/app/start_dev.sh"]

FROM base AS production
CMD ["sh", "/app/start_prod.sh"]
