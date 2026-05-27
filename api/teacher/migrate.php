<?php
// api/teacher/migrate.php

require_once '../config.php';

// Pastikan session aktif & user adalah Guru atau Admin
if (!isset($_SESSION['user']) || ($_SESSION['user']['role'] !== 'teacher' && $_SESSION['user']['role'] !== 'admin')) {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Hanya Guru/Admin yang dapat menjalankan migrasi.'
    ], 403);
}

try {
    $schemaFile = __DIR__ . '/../../database/schema.sql';
    if (!file_exists($schemaFile)) {
        throw new Exception("Berkas schema.sql tidak ditemukan di path: " . $schemaFile);
    }

    $sql = file_get_contents($schemaFile);
    
    // Pecah script SQL berdasarkan titik koma (;)
    // Ganti pemisah baris untuk kompatibilitas
    $sql = str_replace("\r\n", "\n", $sql);
    $queries = explode(";\n", $sql);

    $executedCount = 0;
    foreach ($queries as $query) {
        $trimmedQuery = trim($query);
        if (!empty($trimmedQuery)) {
            $pdo->exec($trimmedQuery);
            $executedCount++;
        }
    }

    sendJson([
        'success' => true,
        'message' => "Migrasi basis data berhasil. Berhasil mengeksekusi $executedCount query.",
    ]);

} catch (Exception $e) {
    sendJson([
        'success' => false,
        'message' => 'Terjadi kesalahan migrasi: ' . $e->getMessage()
    ], 500);
}
