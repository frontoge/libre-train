FROM oven/bun:latest

WORKDIR /app
COPY shared ./shared

WORKDIR /app/server

COPY server/package.json server/bun.lockb* ./
COPY server/ .
EXPOSE 3000
CMD ["bun", "run", "dev"]