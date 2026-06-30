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
    // Set timeout dan User Agent agar tidak diblokir oleh situs berita
    $options = [
        'http' => [
            'method' => 'GET',
            'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36\r\nAccept-Language: id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7\r\n",
            'timeout' => 5 // 5 detik timeout
        ]
    ];
    $context = stream_context_create($options);
    $html = @file_get_contents($url, false, $context);

    if ($html === false) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengambil konten dari URL. Situs mungkin memblokir akses otomatis.'
        ], 500);
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
