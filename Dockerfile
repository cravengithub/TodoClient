# Tahap 1: Build
# Menggunakan image Node.js (misal: v20) untuk build Angular
FROM node:20-alpine AS build
WORKDIR /usr/src/app
# Salin package.json dan install dependencies
COPY package*.json ./
RUN npm install
# Salin sisa source code dan build aplikasi
COPY . .
# Pastikan 'build' adalah skrip di package.json Anda
RUN npm run build
# Tahap 2: Serve
# Menggunakan image Nginx (web server) yang ringan
FROM nginx:alpine
# Hapus file konfigurasi Nginx default
RUN rm /etc/nginx/conf.d/default.conf
# Salin file konfigurasi Nginx kustom kita (File 3)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Salin hasil build Angular ke direktori Nginx
# GANTI 'todoclient' jika nama proyek di angular.json Anda berbeda
COPY --from=build /usr/src/app/dist/todo-client/browser /usr/share/nginx/html
# Ekspos port 80 (default Nginx)
EXPOSE 80
