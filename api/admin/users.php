<?php
// api/admin/users.php

require_once '../config.php';

// Pastikan hanya menerima request GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan GET.'
    ], 405);
}

// Proteksi Sesi & Akses Admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Endpoint ini hanya untuk Administrator.'
    ], 403);
}

try {
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $role = isset($_GET['role']) ? trim($_GET['role']) : '';
    
    $query = "SELECT id, full_name, email, role, avatar_url, auth_provider, last_login, created_at FROM users WHERE 1=1";
    $params = [];
    
    if ($search !== '') {
        $query .= " AND (full_name LIKE :search OR email LIKE :search)";
        $params['search'] = "%$search%";
    }
    
    if ($role !== '' && in_array($role, ['student', 'admin'])) {
        $query .= " AND role = :role";
        $params['role'] = $role;
    }
    
    $query .= " ORDER BY created_at DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $users = $stmt->fetchAll();
    
    sendJson([
        'success' => true,
        'users' => $users
    ]);

} catch (PDOException $e) {
    sendJson([
        'success' => false,
        'message' => 'Terjadi kesalahan basis data: ' . $e->getMessage()
    ], 500);
}
