<?php
// api/login.php

require_once 'config.php';

// Pastikan hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan POST.'
    ], 405);
}

$body = getRequestBody();

$email = trim($body['email'] ?? '');
$password = $body['password'] ?? '';

// Validasi input wajib
if (empty($email) || empty($password)) {
    sendJson([
        'success' => false,
        'message' => 'Email dan password wajib diisi.'
    ], 400);
}

try {
    // Cari user berdasarkan email
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    // Jika user tidak ditemukan
    if (!$user) {
        sendJson([
            'success' => false,
            'message' => 'Email atau password salah.'
        ], 401); // Unauthorized
    }

    // Jika user terdaftar menggunakan Google OAuth
    if ($user['auth_provider'] === 'google') {
        sendJson([
            'success' => false,
            'message' => 'Akun ini terdaftar melalui Google. Silakan masuk menggunakan Google.'
        ], 400);
    }

    // Verifikasi password hash
    if (!password_verify($password, $user['password_hash'])) {
        sendJson([
            'success' => false,
            'message' => 'Email atau password salah.'
        ], 401);
    }

    // session_regenerate_id(true); // dinonaktifkan di cross-origin production untuk mencegah hilangnya SameSite cookie params

    // Simpan data user ke PHP Session
    $session_user = [
        'id' => (int)$user['id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'avatar_url' => $user['avatar_url'],
        'eco_points' => (int)$user['eco_points'],
        'streak' => (int)$user['streak'],
        'auth_provider' => $user['auth_provider'],
        'last_checkin' => $user['last_checkin']
    ];
    
    $_SESSION['user'] = $session_user;

    sendJson([
        'success' => true,
        'message' => 'Masuk berhasil! Selamat datang kembali.',
        'user' => $session_user
    ]);

} catch (PDOException $e) {
    sendJson([
        'success' => false,
        'message' => 'Terjadi kesalahan sistem saat masuk: ' . $e->getMessage()
    ], 500);
}
