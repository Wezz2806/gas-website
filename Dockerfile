FROM php:8.2-apache

# Install pdo_mysql - hanya yang dibutuhkan untuk koneksi database
RUN apt-get update -y && \
    apt-get install -y libmariadb-dev && \
    docker-php-ext-install pdo_mysql && \
    rm -rf /var/lib/apt/lists/*

# Aktifkan mod_rewrite
RUN a2enmod rewrite

# Izinkan .htaccess override
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Copy file project
COPY . /var/www/html/

# Buat folder uploads
RUN mkdir -p /var/www/html/uploads && \
    chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

EXPOSE 80
