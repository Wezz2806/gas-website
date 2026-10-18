<?php
// api/register.php

require_once 'config.php';

// Pastikan hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan POST.'
    ], 405);
}

$body = getRequestBody();

$full_name = trim($body['full_name'] ?? '');
$email = trim($body['email'] ?? '');
$password = $body['password'] ?? '';
$role = trim($body['role'] ?? 'student');

// Validasi input wajib
if (empty($full_name) || empty($email) || empty($password)) {
    sendJson([
        'success' => false,
        'message' => 'Nama lengkap, email, dan password wajib diisi.'
    ], 400);
}

// Validasi format email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJson([
        'success' => false,
        'message' => 'Format email tidak valid.'
    ], 400);
}

// Validasi panjang password
if (strlen($password) < 8) {
    sendJson([
        'success' => false,
        'message' => 'Password harus minimal 8 karakter.'
    ], 400);
}

// Validasi role
$allowed_roles = ['student', 'admin'];
if (!in_array($role, $allowed_roles)) {
    $role = 'student';
}
if (strtolower(trim($email)) === 'admin@gmail.com') {
    $role = 'admin';
}

try {
    // Cek apakah email sudah terdaftar
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $stmt->execute(['email' => $email]);
    if ($stmt->fetch()) {
        sendJson([
            'success' => false,
            'message' => 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.'
        ], 409); // Conflict
    }

    // Hash password menggunakan bcrypt
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    // Insert user baru ke database
    $stmt = $pdo->prepare("
        INSERT INTO users (full_name, email, password_hash, role, auth_provider) 
        VALUES (:full_name, :email, :password_hash, :role, 'local')
    ");
    
    $stmt->execute([
        'full_name' => $full_name,
        'email' => $email,
        'password_hash' => $password_hash,
        'role' => $role
    ]);

    sendJson([
        'success' => true,
        'message' => 'Pendaftaran berhasil! Silakan masuk dengan akun Anda.'
    ], 201); // Created

} catch (PDOException $e) {
    sendJson([
        'success' => false,
        'message' => 'Terjadi kesalahan sistem saat melakukan pendaftaran: ' . $e->getMessage()
    ], 500);
}
