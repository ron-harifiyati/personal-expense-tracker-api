FROM node:22-slim

WORKDIR /app

# Install production dependencies (sqlite3 compiles a native binding).
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
