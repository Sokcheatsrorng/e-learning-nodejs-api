# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# ---- Production stage ----
FROM node:20-alpine AS production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

# Copy everything needed from builder (node_modules + source)
COPY --from=builder /app .

# Ensure uploaded files dir (if using local disk storage) is writable
RUN mkdir -p /app/uploads && chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 3040

# Basic healthcheck hitting your swagger docs or a dedicated /health route
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('https://e-learning.cheat.casa/api-docs', res => process.exit(res.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "index.js"]