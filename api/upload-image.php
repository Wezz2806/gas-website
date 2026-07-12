<?php
// api/upload-image.php

require_once 'config.php';

// Pastikan hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan POST.'
    ], 405);
}

// PROTEKSI ADMIN
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Hanya Administrator yang dapat mengunggah gambar.'
    ], 403);
}

// Cek apakah ada file yang diunggah
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    sendJson([
        'success' => false,
        'message' => 'Tidak ada file gambar yang diunggah atau terjadi kesalahan saat mengunggah.'
    ], 400);
}

$file_tmp = $_FILES['image']['tmp_name'];
$file_name = $_FILES['image']['name'];
$file_size = $_FILES['image']['size'];

// Tentukan sub-folder berdasarkan jenis modul
$type = isset($_POST['type']) ? trim($_POST['type']) : 'general';
$allowed_types = ['ecopedia', 'ecoupdate', 'ecocontact', 'test', 'general'];
if (!in_array($type, $allowed_types)) {
    $type = 'general';
}

// Validasi ekstensi file (jpg, jpeg, png, webp)
$extension = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
$allowed_extensions = ['jpg', 'jpeg', 'png', 'webp'];

if (!in_array($extension, $allowed_extensions)) {
    sendJson([
        'success' => false,
        'message' => 'Format file tidak diizinkan. Hanya gambar JPG, JPEG, PNG, dan WEBP yang diizinkan.'
    ], 400);
}

// Validasi tipe MIME file jika fungsi tersedia
if (function_exists('mime_content_type')) {
    $mime = mime_content_type($file_tmp);
    $allowed_mimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp'];
    if (!in_array($mime, $allowed_mimes)) {
        sendJson([
            'success' => false,
            'message' => 'Tipe file harus berupa gambar (JPEG/PNG/WEBP).'
        ], 400);
    }
}

// Batasi ukuran file (maksimal 5MB)
if ($file_size > 5 * 1024 * 1024) {
    sendJson([
        'success' => false,
        'message' => 'Ukuran file terlalu besar. Maksimal adalah 5MB.'
    ], 400);
}

// Tentukan direktori upload
$upload_dir = dirname(__DIR__) . '/uploads/' . $type . '/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Generate nama file unik
$new_filename = $type . '_' . time() . '_' . rand(1000, 9999) . '.' . $extension;
$target_file = $upload_dir . $new_filename;

if (move_uploaded_file($file_tmp, $target_file)) {
    // Kembalikan path relatif dari root website
    $image_url = '/uploads/' . $type . '/' . $new_filename;
    sendJson([
        'success' => true,
        'message' => 'Gambar berhasil diunggah.',
        'url' => $image_url
    ]);
} else {
    sendJson([
        'success' => false,
        'message' => 'Gagal menyimpan gambar di server.'
    ], 500);
}
