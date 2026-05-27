FROM php:8.2-cli

# Install pdo_mysql untuk koneksi database
RUN apt-get update -y && \
    apt-get install -y libmariadb-dev && \
    docker-php-ext-install pdo_mysql && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy semua file project
COPY . /app/

# Buat folder uploads
RUN mkdir -p /app/uploads && chmod -R 755 /app/uploads

# Jalankan PHP built-in server di port yang Railway tentukan dengan limit upload 100MB
CMD php -d upload_max_filesize=100M -d post_max_size=110M -d memory_limit=256M -S 0.0.0.0:${PORT:-80} -t /app
