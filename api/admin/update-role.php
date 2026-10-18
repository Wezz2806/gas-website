<?php
// api/admin/update-role.php

require_once '../config.php';

// Pastikan hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan POST.'
    ], 405);
}

// Proteksi Sesi & Akses Admin
requireAdmin();

$body = getRequestBody();
$userId = isset($body['userId']) ? (int)$body['userId'] : null;
$newRole = isset($body['role']) ? trim($body['role']) : '';

if (!$userId || empty($newRole) || !in_array($newRole, ['student', 'admin'])) {
    sendJson([
        'success' => false,
        'message' => 'Data input tidak valid. Pastikan userId dan role diisi dengan benar.'
    ], 400);
}

// Cegah mengganti role akun sendiri
if ($userId === (int)$_SESSION['user']['id']) {
    sendJson([
        'success' => false,
        'message' => 'Anda tidak dapat mengubah role akun Anda sendiri untuk mencegah terkunci.'
    ], 400);
}

try {
    // Cek apakah user ada
    $stmtCheck = $pdo->prepare("SELECT id, email, role FROM users WHERE id = :id LIMIT 1");
    $stmtCheck->execute(['id' => $userId]);
    $user = $stmtCheck->fetch();
    
    if (!$user) {
        sendJson([
            'success' => false,
            'message' => 'Pengguna tidak ditemukan.'
        ], 404);
    }

    if (strtolower(trim($user['email'])) === 'admin@gmail.com' && $newRole !== 'admin') {
        sendJson([
            'success' => false,
            'message' => 'Akun admin@gmail.com adalah akun Administrator utama dan tidak dapat diubah ke student.'
        ], 400);
    }
    
    // Update role
    $stmtUpdate = $pdo->prepare("UPDATE users SET role = :role WHERE id = :id");
    $stmtUpdate->execute([
        'role' => $newRole,
        'id' => $userId
    ]);
    
    sendJson([
        'success' => true,
        'message' => 'Role pengguna berhasil diperbarui.'
    ]);

} catch (PDOException $e) {
    sendJson([
        'success' => false,
        'message' => 'Terjadi kesalahan basis data: ' . $e->getMessage()
    ], 500);
}
