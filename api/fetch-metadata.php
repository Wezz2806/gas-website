<?php
// api/fetch-metadata.php

require_once 'config.php';

// Pastikan hanya menerima request GET atau POST
$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET' && $method !== 'POST') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan.'
    ], 405);
}

// PROTEKSI ADMIN
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Hanya Administrator yang dapat mengakses fitur ini.'
    ], 403);
}

// Ambil URL yang ingin di-parse
$url = '';
if ($method === 'GET') {
    $url = isset($_GET['url']) ? trim($_GET['url']) : '';
} else {
    $body = getRequestBody();
    $url = isset($body['url']) ? trim($body['url']) : '';
}

if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
    sendJson([
        'success' => false,
        'message' => 'URL portal berita tidak valid atau kosong.'
    ], 400);
}

try {
    $html = false;
    $httpCode = 0;

    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36");
        $headers = [
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language: id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "Cache-Control: no-cache",
            "Pragma: no-cache"
        ];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
    } else {
        // Fallback ke file_get_contents
        $options = [
            'http' => [
                'method' => 'GET',
                'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36\r\nAccept-Language: id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7\r\n",
                'timeout' => 10,
                'ignore_errors' => true
            ]
        ];
        $context = stream_context_create($options);
        $html = @file_get_contents($url, false, $context);
        
        if (isset($http_response_header) && is_array($http_response_header)) {
            preg_match('{HTTP\/\S*\s(\d+)}', $http_response_header[0], $match);
            $httpCode = isset($match[1]) ? (int)$match[1] : 0;
        }
    }

    if ($html === false || empty($html)) {
        sendJson([
            'success' => false,
            'message' => 'Gagal menghubungi server tujuan. Harap periksa kembali koneksi internet Anda.'
        ], 502);
    }

    if ($httpCode === 404) {
        sendJson([
            'success' => false,
            'message' => 'Halaman tidak ditemukan (Error 404). Silakan periksa kembali apakah URL yang Anda masukkan sudah benar.'
        ], 404);
    }

    if ($httpCode === 403) {
        sendJson([
            'success' => false,
            'message' => 'Akses ditolak oleh situs tujuan (Error 403). Situs tersebut memblokir pengambilan data otomatis.'
        ], 403);
    }

    if ($httpCode >= 400) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengambil data dari URL. Situs merespon dengan kode error HTTP ' . $httpCode . '.'
        ], 502);
    }

    // Suppress warning DOMDocument untuk HTML5 tag yang tidak valid
    libxml_use_internal_errors(true);
    $doc = new DOMDocument();
    $doc->loadHTML('<?xml encoding="UTF-8">' . $html);
    libxml_clear_errors();

    $title = '';
    $cover_url = '';
    $description = '';
    $author = '';

    // 1. Ambil Title
    // Cek tag <title>
    $titleTags = $doc->getElementsByTagName('title');
    if ($titleTags->length > 0) {
        $title = trim($titleTags->item(0)->textContent);
    }

    // 2. Ambil Meta Tags (Open Graph & Standard)
    $metas = $doc->getElementsByTagName('meta');
    for ($i = 0; $i < $metas->length; $i++) {
        $meta = $metas->item($i);
        $property = $meta->getAttribute('property');
        $name = $meta->getAttribute('name');
        $content = $meta->getAttribute('content');

        // Parse Title
        if ($property === 'og:title' || $name === 'twitter:title') {
            if (!empty($content)) $title = trim($content);
        }
        // Parse Cover / Image
        elseif ($property === 'og:image' || $name === 'twitter:image') {
            if (!empty($content)) $cover_url = trim($content);
        }
        // Parse Description
        elseif ($property === 'og:description' || $name === 'description' || $name === 'twitter:description') {
            if (!empty($content)) $description = trim($content);
        }
        // Parse Author / Publisher
        elseif ($name === 'author' || $property === 'og:site_name' || $property === 'article:author') {
            if (!empty($content)) $author = trim($content);
        }
    }

    // Pembersihan data tambahan
    if (empty($author)) {
        // Fallback: Ambil domain name sebagai nama penulis/penerbit berita
        $parsedUrl = parse_url($url);
        $author = isset($parsedUrl['host']) ? str_replace('www.', '', $parsedUrl['host']) : 'Portal Berita';
    }

    // Pastikan link gambar cover absolut
    if (!empty($cover_url) && strpos($cover_url, '//') === 0) {
        $cover_url = 'https:' . $cover_url;
    } elseif (!empty($cover_url) && strpos($cover_url, 'http') !== 0) {
        // Relative path, gabungkan dengan host origin
        $parsedUrl = parse_url($url);
        $base = $parsedUrl['scheme'] . '://' . $parsedUrl['host'];
        $cover_url = $base . '/' . ltrim($cover_url, '/');
    }

    sendJson([
        'success' => true,
        'title' => $title,
        'coverUrl' => $cover_url,
        'description' => $description,
        'author' => $author
    ]);

} catch (Exception $e) {
    sendJson([
        'success' => false,
        'message' => 'Terjadi kesalahan pemrosesan metadata: ' . $e->getMessage()
    ], 500);
}
