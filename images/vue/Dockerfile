FROM node:current-alpine AS base
WORKDIR /app/ft_transcendence
EXPOSE 8080
COPY scripts/env.sh /app/env.sh
CMD ["sh", "/app/start.sh"]

FROM base AS development
COPY scripts/start_dev.sh /app/start.sh

FROM base AS production
RUN npm install -g http-server
COPY scripts/start_prod.sh /app/start.sh
