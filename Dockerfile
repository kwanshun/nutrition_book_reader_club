# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Create .env file with build-time environment variables
# These will be overridden at runtime by Cloud Run
RUN echo "NEXT_PUBLIC_SUPABASE_URL=https://bnkgdcbwkcervkmpuhqm.supabase.co" > .env.local && \
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJua2dkY2J3a2NlcnZrbXB1aHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Nzc2ODksImV4cCI6MjA3NTA1MzY4OX0.iwQmc37bIY8Fi8jiBsscLbbMeiLxUV6Pos_1kR7KVms" >> .env.local && \
    echo "GEMINI_API_KEY=AIzaSyBlBtO5T1lvxL51821bRkAUC6Mxn7iePGk" >> .env.local

# Build the Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
