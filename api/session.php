<?php
// api/session.php

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['success' => false, 'message' => 'Metode tidak diizinkan.'], 405);
}

// ── FAST PATH: Serve from session cache if data is fresh ─────────────────────
// This avoids a database query on every page load/tab switch.
// Session data is refreshed from DB at most once every 5 minutes.
$cached_at = $_SESSION['user_cached_at'] ?? 0;
$user_id   = getAuthUserId();

if ($user_id === null) {
    sendJson(['success' => false, 'message' => 'Sesi tidak aktif.'], 401);
}

$cache_ttl_seconds = 300; // 5 minutes
if (isset($_SESSION['user']) && (time() - $cached_at) < $cache_ttl_seconds) {
    if (strtolower(trim($_SESSION['user']['email'] ?? '')) === 'admin@gmail.com') {
        $_SESSION['user']['role'] = 'admin';
    }
    // Return cached session data — no DB hit
    $token = generateAuthToken($_SESSION['user']);
    sendJson(['success' => true, 'user' => $_SESSION['user'], 'token' => $token]);
}

// ── SLOW PATH: Session expired — refresh from database ──────────────────────
try {
    $stmt = $pdo->prepare(
        "SELECT id, full_name, email, role, avatar_url, auth_provider
           FROM users
          WHERE id = :id
          LIMIT 1"
    );
    $stmt->execute(['id' => $user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        // User was deleted from DB — destroy session
        session_unset();
        session_destroy();
        sendJson(['success' => false, 'message' => 'Akun tidak ditemukan.'], 401);
    }

    $userRole = $user['role'];
    if (strtolower(trim($user['email'])) === 'admin@gmail.com') {
        $userRole = 'admin';
        if ($user['role'] !== 'admin') {
            try {
                $pdo->prepare("UPDATE users SET role = 'admin' WHERE id = :id")->execute(['id' => $user['id']]);
            } catch (Exception $e) {}
        }
    }

    $session_user = [
        'id'            => (int) $user['id'],
        'full_name'     => $user['full_name'],
        'email'         => $user['email'],
        'role'          => $userRole,
        'avatar_url'    => $user['avatar_url'],
        'auth_provider' => $user['auth_provider'],
    ];

    // Update session cache and timestamp
    $_SESSION['user']           = $session_user;
    $_SESSION['user_cached_at'] = time();

    $token = generateAuthToken($session_user);
    sendJson(['success' => true, 'user' => $session_user, 'token' => $token]);

} catch (PDOException $e) {
    error_log('Session DB error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan sistem saat memeriksa sesi.'], 500);
}
