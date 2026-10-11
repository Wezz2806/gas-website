<?php
// api/google-auth.php

require_once 'config.php';

// Pastikan autoloader Composer terpasang untuk Google API Client
$autoload_path = __DIR__ . '/../vendor/autoload.php';
if (file_exists($autoload_path)) {
    require_once $autoload_path;
} else {
    sendJson([
        'success' => false,
        'message' => 'Dependensi Google API Client (vendor) tidak ditemukan. Hubungi administrator.'
    ], 500);
}

// Pastikan hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan POST.'
    ], 405);
}

$body = getRequestBody();
$id_token = $body['id_token'] ?? '';

if (empty($id_token)) {
    sendJson([
        'success' => false,
        'message' => 'ID Token Google wajib disertakan.'
    ], 400);
}

// Ambil Google Client ID dari .env jika dikonfigurasi
$google_client_id = '';
$env_file = __DIR__ . '/../.env';
if (file_exists($env_file)) {
    $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2);
        if (trim($key) === 'GOOGLE_CLIENT_ID') {
            $google_client_id = trim($value, " \t\n\r\0\x0B\"'");
        }
    }
}

try {
    // Inisialisasi Google Client
    $client = new Google_Client();
    
    // Jika Client ID tidak diset di .env, kita coba parse secara fallback atau berikan error konfigurasi rill
    if (empty($google_client_id)) {
        // PERHATIAN: Di sistem development lokal, untuk kemudahan testing awal
        // Jika belum diset di .env, kita informasikan ke developer agar dikonfigurasi.
        sendJson([
            'success' => false,
            'message' => 'Konfigurasi GOOGLE_CLIENT_ID belum diset di file .env. Silakan konfigurasikan terlebih dahulu.'
        ], 500);
    }

    $client->setClientId($google_client_id);
    
    // Verifikasi Token ID Google secara resmi
    $payload = $client->verifyIdToken($id_token);
    
    if (!$payload) {
        sendJson([
            'success' => false,
            'message' => 'Verifikasi Google ID Token gagal. Token tidak valid.'
        ], 401);
    }

    // Ekstrak data profil dari Google payload
    $google_id = $payload['sub']; // Google User ID unik
    $email = $payload['email'];
    $full_name = $payload['name'];
    $avatar_url = $payload['picture'] ?? null;

    // 1. Cek apakah user dengan google_id ini sudah terdaftar
    $stmt = $pdo->prepare("SELECT * FROM users WHERE google_id = :google_id LIMIT 1");
    $stmt->execute(['google_id' => $google_id]);
    $user = $stmt->fetch();

    if ($user) {
        // User ditemukan -> Lakukan Login otomatis
        loginUserSession($user);
    }

    // 2. Cek apakah email sudah terdaftar via local password (auth_provider = 'local')
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
    $stmt->execute(['email' => $email]);
    $existing_user = $stmt->fetch();

    if ($existing_user) {
        if ($existing_user['auth_provider'] === 'local') {
            // Hubungkan akun lokal dengan Google OAuth secara otomatis demi kenyamanan user,
            // atau tolak untuk keamanan. Di sini kita hubungkan akunnya dengan menambahkan google_id
            // agar user bisa login dengan kedua metode secara fleksibel!
            $stmt = $pdo->prepare("UPDATE users SET google_id = :google_id, auth_provider = 'google', avatar_url = :avatar_url WHERE id = :id");
            $stmt->execute([
                'google_id' => $google_id,
                'avatar_url' => $avatar_url ? $avatar_url : $existing_user['avatar_url'],
                'id' => $existing_user['id']
            ]);

            // Ambil data user terupdate
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
            $stmt->execute(['id' => $existing_user['id']]);
            $updated_user = $stmt->fetch();
            
            loginUserSession($updated_user);
        }
    }

    // 3. User baru -> Lakukan Registrasi otomatis & Login
    $stmt = $pdo->prepare("
        INSERT INTO users (full_name, email, password_hash, role, avatar_url, auth_provider, google_id) 
        VALUES (:full_name, :email, NULL, 'student', :avatar_url, 'google', :google_id)
    ");
    $stmt->execute([
        'full_name' => $full_name,
        'email' => $email,
        'avatar_url' => $avatar_url,
        'google_id' => $google_id
    ]);

    // Ambil user baru yang barusan di-insert
    $new_user_id = $pdo->lastInsertId();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $new_user_id]);
    $new_user = $stmt->fetch();

    loginUserSession($new_user);

} catch (Exception $e) {
    sendJson([
        'success' => false,
        'message' => 'Terjadi kesalahan sistem saat memproses Google Login: ' . $e->getMessage()
    ], 500);
}

/**
 * Menyimpan data user terverifikasi ke dalam session dan mengirim respon JSON sukses.
 * 
 * @param array $user
 */
function loginUserSession($user) {
    // session_regenerate_id(true); // dinonaktifkan di cross-origin production untuk mencegah hilangnya SameSite cookie params

    $session_user = [
        'id' => (int)$user['id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'avatar_url' => $user['avatar_url'],
        'auth_provider' => $user['auth_provider'],
    ];
    
    $_SESSION['user'] = $session_user;

    sendJson([
        'success' => true,
        'message' => 'Masuk dengan Google berhasil!',
        'user' => $session_user
    ]);
}
