<?php
// api/forgot-password.php

require_once 'config.php';
require_once 'mailer.php';

// Pastikan hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan POST.'
    ], 405);
}

$body = getRequestBody();
$email = trim($body['email'] ?? '');

if (empty($email)) {
    sendJson([
        'success' => false,
        'message' => 'Email wajib diisi.'
    ], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJson([
        'success' => false,
        'message' => 'Format email tidak valid.'
    ], 400);
}

try {
    // 1. Cek apakah email terdaftar di database
    $stmt = $pdo->prepare("SELECT id, full_name, auth_provider FROM users WHERE email = :email LIMIT 1");
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        // Demi alasan keamanan (User Enumeration Prevention), jangan beri tahu secara eksplisit jika email tidak ditemukan.
        // Cukup beri respon sukses pura-pura seolah-olah dikirim, atau untuk UX yang lebih ramah di GAS, berikan pesan sukses generik.
        // Di sini kita beri info sukses generik demi menjaga keamanan sistem.
        sendJson([
            'success' => true,
            'message' => 'Jika email Anda terdaftar, kode OTP verifikasi telah dikirim ke kotak masuk Anda.'
        ]);
    }

    // 2. Jika user terdaftar via Google OAuth, tolak reset password manual
    if ($user['auth_provider'] === 'google') {
        sendJson([
            'success' => false,
            'message' => 'Akun Anda terdaftar menggunakan Google. Silakan masuk menggunakan tombol Sign-In Google.'
        ], 400);
    }

    // 3. Generate 6-digit OTP code secara acak
    $otp_code = sprintf("%06d", mt_rand(100000, 999999));
    
    // Masa berlaku 15 menit dari sekarang
    $expires_at = date('Y-m-d H:i:s', time() + (15 * 60));

    // 4. Batalkan OTP lama yang belum terpakai untuk email ini agar hanya 1 OTP yang aktif
    $stmt = $pdo->prepare("UPDATE password_resets SET used = 1 WHERE email = :email AND used = 0");
    $stmt->execute(['email' => $email]);

    // 5. Simpan OTP baru ke tabel password_resets
    $stmt = $pdo->prepare("
        INSERT INTO password_resets (email, otp_code, expires_at, used) 
        VALUES (:email, :otp_code, :expires_at, 0)
    ");
    $stmt->execute([
        'email' => $email,
        'otp_code' => $otp_code,
        'expires_at' => $expires_at
    ]);

    // 6. Kirim email OTP
    $email_sent = sendOtpEmail($email, $otp_code, $user['full_name']);

    if ($email_sent) {
        sendJson([
            'success' => true,
            'message' => 'Kode OTP verifikasi telah dikirim ke email Anda. Silakan periksa kotak masuk atau spam.'
        ]);
    } else {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengirimkan email OTP. Silakan hubungi admin atau coba sesaat lagi.'
        ], 500);
    }

} catch (PDOException $e) {
    sendJson([
        'success' => false,
        'message' => 'Terjadi kesalahan sistem saat memproses lupa password: ' . $e->getMessage()
    ], 500);
}
