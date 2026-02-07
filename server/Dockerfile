FROM oven/bun:latest

WORKDIR /app
COPY shared ./shared

WORKDIR /app/server

COPY server/package.json server/bun.lockb* ./
COPY server/ .
EXPOSE 3000
# Need to update this to run based on environment variable for development vs production
CMD ["bun", "run", "dev"]