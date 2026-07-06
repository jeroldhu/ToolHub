# ---- Build Stage ----
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# 依赖缓存层
COPY package.json package-lock.json ./
RUN npm ci

# 编译
COPY . .
RUN npm run build

# ---- Runtime Stage ----
FROM python:3.12-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8000/ || exit 1

EXPOSE 8000
CMD ["python3", "-m", "http.server", "8000", "--directory", "/usr/share/nginx/html"]
