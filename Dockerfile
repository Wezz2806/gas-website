FROM php:8.2-apache

# Install dependencies sistem yang dibutuhkan pdo_mysql
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# Install ekstensi PHP - pdo_mysql adalah yang paling penting
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mysqli \
        gd \
        mbstring \
        fileinfo

# Verifikasi pdo_mysql terinstall
RUN php -m | grep pdo_mysql

# Aktifkan mod_rewrite Apache
RUN a2enmod rewrite

# Konfigurasi Apache document root dan permissions
RUN echo '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/gas-website.conf \
    && a2enconf gas-website

# Copy semua file project ke web root
COPY . /var/www/html/

# Buat folder uploads dan set permissions
RUN mkdir -p /var/www/html/uploads && \
    chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html && \
    chmod -R 775 /var/www/html/uploads

EXPOSE 80
