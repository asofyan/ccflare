# Use the official Bun image as base
FROM oven/bun:1.2.8-slim AS base
WORKDIR /app

# Install dependencies stage
FROM base AS deps
COPY . .
RUN bun install

# Build stage
FROM base AS builder
COPY --from=deps /app ./
RUN bun run build

# Production stage
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8080

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 bunuser

# Copy necessary files
COPY --from=builder --chown=bunuser:nodejs /app/package.json ./
COPY --from=builder --chown=bunuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=bunuser:nodejs /app/apps ./apps
COPY --from=builder --chown=bunuser:nodejs /app/packages ./packages
COPY --from=builder --chown=bunuser:nodejs /app/tsconfig.json ./
COPY --from=builder --chown=bunuser:nodejs /app/biome.json ./

# Create data directory for database persistence
RUN mkdir -p /app/data && chown bunuser:nodejs /app/data

# Switch to non-root user
USER bunuser

# Expose the default port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun run -e "fetch('http://localhost:${PORT}/api/stats').then(r => r.ok ? process.exit(0) : process.exit(1))" || exit 1

# Start the server
CMD ["bun", "run", "apps/server/src/server.ts"]
