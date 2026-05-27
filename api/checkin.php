<?php
// api/checkin.php

require_once 'config.php';

// Pastikan user sudah login
$user_id = requireAuth();

try {
    // 1. Ambil data user saat ini dari database
    $stmt = $pdo->prepare("SELECT streak, last_checkin FROM users WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        sendJson([
            'success' => false,
            'message' => 'Pengguna tidak ditemukan.'
        ], 404);
    }

    // Self-healing: jika kolom last_checkin belum ada (kasus kegagalan query), coba buat kolomnya
    // Tapi karena query di atas sukses, berarti kolomnya ada. Jika kolom tidak ada, block catch di bawah akan menangani dan menambahkannya.
} catch (PDOException $e) {
    // Jika kolom last_checkin belum ada, kita tambahkan kolom tersebut
    if (strpos($e->getMessage(), 'Unknown column') !== false || strpos($e->getMessage(), 'last_checkin') !== false) {
        try {
            $pdo->exec("ALTER TABLE users ADD COLUMN last_checkin DATE DEFAULT NULL");
            // Coba query ulang setelah kolom ditambahkan
            $stmt = $pdo->prepare("SELECT streak, last_checkin FROM users WHERE id = :id LIMIT 1");
            $stmt->execute(['id' => $user_id]);
            $user = $stmt->fetch();
        } catch (PDOException $ex) {
            sendJson([
                'success' => false,
                'message' => 'Kesalahan database saat memperbarui skema: ' . $ex->getMessage()
            ], 500);
        }
    } else {
        sendJson([
            'success' => false,
            'message' => 'Kesalahan database: ' . $e->getMessage()
        ], 500);
    }
}

// 2. Cek apakah sudah check-in hari ini
$today = date('Y-m-d');
$has_checked_in = ($user['last_checkin'] === $today);

// Jika request adalah POST (untuk melakukan check-in)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($has_checked_in) {
        sendJson([
            'success' => false,
            'message' => 'Anda sudah melakukan presensi hari ini.'
        ], 400);
    }

    try {
        // Update streak dan last_checkin di database
        $new_streak = (int)$user['streak'] + 1;
        $update_stmt = $pdo->prepare("UPDATE users SET streak = :streak, last_checkin = :last_checkin WHERE id = :id");
        $update_stmt->execute([
            'streak' => $new_streak,
            'last_checkin' => $today,
            'id' => $user_id
        ]);

        // Perbarui data user di session
        if (isset($_SESSION['user'])) {
            $_SESSION['user']['streak'] = $new_streak;
        }

        sendJson([
            'success' => true,
            'message' => 'Presensi berhasil dicatat! Kehadiran Anda bertambah.',
            'streak' => $new_streak,
            'last_checkin' => $today
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mencatat presensi: ' . $e->getMessage()
        ], 500);
    }
}

// Jika request adalah GET (hanya untuk cek status presensi hari ini)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    sendJson([
        'success' => true,
        'hasCheckedInToday' => $has_checked_in,
        'streak' => (int)$user['streak']
    ]);
}

sendJson([
    'success' => false,
    'message' => 'Metode request tidak diizinkan.'
], 405);
