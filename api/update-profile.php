<?php
// api/update-profile.php

require_once 'config.php';

// Pastikan hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan POST.'
    ], 405);
}

// Periksa apakah data user ada di session
if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    sendJson([
        'success' => false,
        'message' => 'Sesi tidak aktif. Silakan masuk terlebih dahulu.'
    ], 401);
}

$user_id = $_SESSION['user']['id'];

// Ambil input dari $_POST (karena menggunakan multipart/form-data untuk upload file)
$full_name = trim($_POST['full_name'] ?? '');
$email = trim($_POST['email'] ?? '');
$old_password = $_POST['old_password'] ?? '';
$new_password = $_POST['new_password'] ?? '';

if (empty($full_name) || empty($email)) {
    sendJson([
        'success' => false,
        'message' => 'Nama lengkap dan email tidak boleh kosong.'
    ], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJson([
        'success' => false,
        'message' => 'Format email tidak valid.'
    ], 400);
}

try {
    // Periksa apakah email sudah digunakan oleh user lain
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email AND id != :id LIMIT 1");
    $stmt->execute(['email' => $email, 'id' => $user_id]);
    if ($stmt->fetch()) {
        sendJson([
            'success' => false,
            'message' => 'Email sudah terdaftar untuk pengguna lain.'
        ], 400);
    }

    // Tangani perubahan password jika password baru diisi
    $new_password_hash = null;
    if (!empty($new_password)) {
        if (empty($old_password)) {
            sendJson([
                'success' => false,
                'message' => 'Password lama harus diisi untuk mengubah password.'
            ], 400);
        }

        // Ambil password_hash saat ini dari database
        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $user_id]);
        $db_user = $stmt->fetch();

        if (!$db_user || !password_verify($old_password, $db_user['password_hash'])) {
            sendJson([
                'success' => false,
                'message' => 'Password lama salah.'
            ], 400);
        }

        $new_password_hash = password_hash($new_password, PASSWORD_BCRYPT);
    }

    // Tangani upload foto profil jika ada file yang diunggah atau dihapus
    $avatar_url = null;
    $has_new_avatar = false;
    $delete_avatar = isset($_POST['delete_avatar']) && $_POST['delete_avatar'] === '1';

    if ($delete_avatar) {
        // Ambil avatar lama untuk dihapus dari server
        $stmt = $pdo->prepare("SELECT avatar_url FROM users WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $user_id]);
        $old_user = $stmt->fetch();
        if ($old_user && $old_user['avatar_url']) {
            $old_file = dirname(__DIR__) . $old_user['avatar_url'];
            if (file_exists($old_file)) {
                @unlink($old_file);
            }
        }
        $avatar_url = null;
        $has_new_avatar = true;
    } else if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $file_tmp = $_FILES['avatar']['tmp_name'];
        $file_name = $_FILES['avatar']['name'];
        $file_size = $_FILES['avatar']['size'];
        
        // Validasi ekstensi file (hanya jpg/jpeg)
        $extension = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        $allowed_extensions = ['jpg', 'jpeg'];
        
        if (!in_array($extension, $allowed_extensions)) {
            sendJson([
                'success' => false,
                'message' => 'Hanya file gambar dengan ekstensi JPG atau JPEG yang diizinkan.'
            ], 400);
        }
        
        // Validasi tipe MIME file
        if (function_exists('mime_content_type')) {
            $mime = mime_content_type($file_tmp);
            if ($mime !== 'image/jpeg' && $mime !== 'image/pjpeg') {
                sendJson([
                    'success' => false,
                    'message' => 'Tipe file harus berupa gambar JPEG/JPG.'
                ], 400);
            }
        }
        
        // Batasi ukuran file (maksimal 2MB)
        if ($file_size > 2 * 1024 * 1024) {
            sendJson([
                'success' => false,
                'message' => 'Ukuran file foto profil maksimal adalah 2MB.'
            ], 400);
        }
        
        $upload_dir = dirname(__DIR__) . '/uploads/avatars/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        
        $new_filename = 'avatar_' . $user_id . '_' . time() . '.' . $extension;
        $target_file = $upload_dir . $new_filename;
        
        if (move_uploaded_file($file_tmp, $target_file)) {
            $avatar_url = '/uploads/avatars/' . $new_filename;
            $has_new_avatar = true;
        } else {
            sendJson([
                'success' => false,
                'message' => 'Gagal mengunggah foto profil ke server.'
            ], 500);
        }
    }

    // Update data pengguna di database
    if ($has_new_avatar) {
        $stmt = $pdo->prepare("UPDATE users SET full_name = :full_name, email = :email, avatar_url = :avatar_url WHERE id = :id");
        $stmt->execute([
            'full_name' => $full_name,
            'email' => $email,
            'avatar_url' => $avatar_url,
            'id' => $user_id
        ]);
    } else {
        $stmt = $pdo->prepare("UPDATE users SET full_name = :full_name, email = :email WHERE id = :id");
        $stmt->execute([
            'full_name' => $full_name,
            'email' => $email,
            'id' => $user_id
        ]);
    }

    // Update password jika ada password baru yang sah
    if ($new_password_hash !== null) {
        $stmt = $pdo->prepare("UPDATE users SET password_hash = :password_hash WHERE id = :id");
        $stmt->execute([
            'password_hash' => $new_password_hash,
            'id' => $user_id
        ]);
    }

    // Ambil data terbaru untuk disimpan di session
    $stmt = $pdo->prepare("SELECT id, full_name, email, role, avatar_url, auth_provider FROM users WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $user_id]);
    $user = $stmt->fetch();

    if ($user) {
        $session_user = [
            'id' => (int)$user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'avatar_url' => $user['avatar_url'],
            'auth_provider' => $user['auth_provider'],
        ];
        $_SESSION['user'] = $session_user;
        $token = generateAuthToken($session_user);

        sendJson([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'user' => $session_user,
            'token' => $token
        ]);
    } else {
        sendJson([
            'success' => false,
            'message' => 'Gagal sinkronisasi data sesi setelah update.'
        ], 500);
    }

} catch (PDOException $e) {
    sendJson([
        'success' => false,
        'message' => 'Terjadi kesalahan sistem saat memperbarui profil: ' . $e->getMessage()
    ], 500);
}
