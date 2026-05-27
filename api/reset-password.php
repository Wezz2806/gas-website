<?php
// api/reset-password.php

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
$otp_code = trim($body['otp_code'] ?? '');
$new_password = $body['new_password'] ?? '';

// Validasi input
if (empty($email) || empty($otp_code) || empty($new_password)) {
    sendJson([
        'success' => false,
        'message' => 'Email, kode OTP, dan password baru wajib diisi.'
    ], 400);
}

if (strlen($new_password) < 8) {
    sendJson([
        'success' => false,
        'message' => 'Password baru harus minimal 8 karakter.'
    ], 400);
}

try {
    // 1. Cari OTP yang valid di tabel password_resets
    $stmt = $pdo->prepare("
        SELECT id, expires_at 
        FROM password_resets 
        WHERE email = :email 
          AND otp_code = :otp_code 
          AND used = 0 
        LIMIT 1
    ");
    $stmt->execute([
        'email' => $email,
        'otp_code' => $otp_code
    ]);
    $reset_req = $stmt->fetch();

    if (!$reset_req) {
        sendJson([
            'success' => false,
            'message' => 'Kode OTP salah atau tidak ditemukan.'
        ], 400);
    }

    // 2. Periksa apakah OTP telah kedaluwarsa
    $expires_time = strtotime($reset_req['expires_at']);
    if (time() > $expires_time) {
        sendJson([
            'success' => false,
            'message' => 'Kode OTP telah kedaluwarsa. Silakan ajukan lupa password kembali.'
        ], 400);
    }

    // 3. Update password user di tabel users
    $new_password_hash = password_hash($new_password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("UPDATE users SET password_hash = :password_hash WHERE email = :email");
    $stmt->execute([
        'password_hash' => $new_password_hash,
        'email' => $email
    ]);

    // 4. Tandai OTP sebagai sudah digunakan (used = 1)
    $stmt = $pdo->prepare("UPDATE password_resets SET used = 1 WHERE id = :id");
    $stmt->execute(['id' => $reset_req['id']]);

    sendJson([
        'success' => true,
        'message' => 'Sandi Anda berhasil diatur ulang! Silakan masuk menggunakan sandi baru Anda.'
    ]);

} catch (PDOException $e) {
    sendJson([
        'success' => false,
        'message' => 'Terjadi kesalahan sistem saat mereset password: ' . $e->getMessage()
    ], 500);
}
