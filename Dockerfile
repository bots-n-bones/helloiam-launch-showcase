FROM nginx:stable-alpine

COPY ["10 - launch 2026-11", "/usr/share/nginx/html"]
COPY docker/index.html /usr/share/nginx/html/index.html
RUN chmod -R a+rX /usr/share/nginx/html

EXPOSE 80
