# Gunakan base image Bun resmi
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN bun install --frozen-lockfile

# Build kalau pakai TypeScript
RUN bun run build

# Expose port (ganti sesuai Elysia kamu)
EXPOSE 3001

# Jalankan server
CMD ["bun", "run", "start"]
