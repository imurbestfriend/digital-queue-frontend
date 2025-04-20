FROM node:20-alpine AS builder
WORKDIR /app

# копируем зависимости и ставим их
COPY package*.json ./
RUN npm ci

# билдим приложение
COPY . .
COPY .env .env
RUN npm run build

# 2) Serve stage
FROM nginx:alpine
# удаляем дефолтный конфиг
RUN rm /etc/nginx/conf.d/default.conf

# копируем свой nginx.conf (лежит рядом с Dockerfile)
COPY nginx.conf /etc/nginx/conf.d/

# сам билд
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
