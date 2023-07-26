FROM node:current-alpine AS base

WORKDIR /app/frontend
EXPOSE 8080

COPY ./scripts /app

FROM base AS development
CMD ["sh", "/app/start_dev.sh"]

FROM base AS production
RUN npm install -g http-server
CMD ["sh", "/app/start_prod.sh"]
