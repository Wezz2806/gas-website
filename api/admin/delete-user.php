<?php
// api/admin/delete-user.php

require_once '../config.php';

// Pastikan hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan POST.'
    ], 405);
}

// Proteksi Sesi & Akses Admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Endpoint ini hanya untuk Administrator.'
    ], 403);
}

$body = getRequestBody();
$userId = isset($body['userId']) ? (int)$body['userId'] : null;

if (!$userId) {
    sendJson([
        'success' => false,
        'message' => 'ID Pengguna wajib disertakan.'
    ], 400);
}

// Cegah menghapus akun sendiri
if ($userId === (int)$_SESSION['user']['id']) {
    sendJson([
        'success' => false,
        'message' => 'Anda tidak dapat menghapus akun Administrator Anda sendiri.'
    ], 400);
}

try {
    // Cek apakah user ada
    $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE id = :id LIMIT 1");
    $stmtCheck->execute(['id' => $userId]);
    $user = $stmtCheck->fetch();
    
    if (!$user) {
        sendJson([
            'success' => false,
            'message' => 'Pengguna tidak ditemukan.'
        ], 404);
    }
    
    // Hapus user (FOREIGN KEY constraints dengan ON DELETE CASCADE akan otomatis menghapus submissions, comments, etc.)
    $stmtDelete = $pdo->prepare("DELETE FROM users WHERE id = :id");
    $stmtDelete->execute(['id' => $userId]);
    
    sendJson([
        'success' => true,
        'message' => 'Pengguna berhasil dihapus.'
    ]);

} catch (PDOException $e) {
    sendJson([
        'success' => false,
        'message' => 'Terjadi kesalahan basis data: ' . $e->getMessage()
    ], 500);
}
