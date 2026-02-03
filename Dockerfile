FROM node:20-alpine

WORKDIR /app

# Build the Next.js app inside ./student-app

# Copy package files first
COPY student-app/package.json student-app/package-lock.json ./

# Copy Prisma schema/migrations early so Prisma client generation works during install
COPY student-app/prisma ./prisma
COPY student-app/prisma.config.ts ./prisma.config.ts

# Install dependencies
RUN npm ci

# Copy rest of the project
COPY student-app/ ./

# Ensure Prisma client is generated for runtime
RUN npx prisma generate

# Build Next.js app
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
