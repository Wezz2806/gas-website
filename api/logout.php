<?php
// api/logout.php

require_once 'config.php';

// Pastikan hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan POST.'
    ], 405);
}

// Bersihkan data session di server
$_SESSION = [];

// Hancurkan cookie session di browser
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(), 
        '', 
        time() - 42000,
        $params["path"], 
        $params["domain"],
        $params["secure"], 
        $params["httponly"]
    );
}

// Hancurkan session
session_destroy();

sendJson([
    'success' => true,
    'message' => 'Berhasil keluar. Sesi telah dihapus.'
]);
