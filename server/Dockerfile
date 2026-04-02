FROM oven/bun:latest

WORKDIR /app

# 1. Copy root workspace files
COPY package.json bun.lockb* ./

# 2. Copy source code
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/

# 3. Install ALL dependencies (including devDependencies) so the build can run
#    --production would strip TS/build tools
RUN bun install

# 4. Build the server (and any dependent workspaces if needed)
WORKDIR /app/server
RUN bun run build

# 5. Production runtime (now we can prune to production deps if you want, but for simplicity we keep the image small enough)
EXPOSE 3000
CMD ["bun", "run", "start"]