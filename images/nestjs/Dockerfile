FROM node:current-alpine AS base
RUN npm install -g @nestjs/cli
WORKDIR /app/ft_transcendence
EXPOSE 3000
COPY scripts/env.sh /app/env.sh
CMD ["sh", "/app/start.sh"]

FROM base AS development
COPY scripts/start_dev.sh /app/start.sh

FROM base AS production
COPY scripts/start_prod.sh /app/start.sh
