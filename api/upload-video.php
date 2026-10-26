<?php
// api/upload-video.php
require_once 'config.php';

// Atur timeout eksekusi skrip untuk upload video berukuran besar
@ini_set('max_execution_time', '300');
@ini_set('max_input_time', '300');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan. Gunakan POST.'], 405);
}

// 1. Periksa apakah ukuran payload POST melebihi batas post_max_size server
// Ketika melebihi post_max_size, PHP otomatis mengosongkan $_POST dan $_FILES!
if (empty($_POST) && empty($_FILES) && (int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    sendJson([
        'success' => false,
        'message' => 'Ukuran file video melebihi batas kapasitas unggah server (post_max_size). Harap pilih video dengan ukuran lebih kecil (maksimal 50MB) atau kompresi video terlebih dahulu.'
    ], 413);
}

$user_id = getAuthUserId();
if ($user_id === null) {
    sendJson(['success' => false, 'message' => 'Sesi tidak aktif atau telah berakhir. Silakan login kembali.'], 401);
}

// Pastikan user benar-benar ada di database untuk mencegah foreign key failure
try {
    $stmtUserCheck = $pdo->prepare("SELECT id FROM users WHERE id = :id LIMIT 1");
    $stmtUserCheck->execute(['id' => $user_id]);
    if (!$stmtUserCheck->fetchColumn()) {
        sendJson(['success' => false, 'message' => 'Akun pengguna tidak ditemukan dalam database. Silakan logout dan login kembali.'], 401);
    }
} catch (PDOException $e) {
    error_log('upload-video.php user check error: ' . $e->getMessage());
}

$title = trim($_POST['title'] ?? '');
$category = trim($_POST['category'] ?? 'Umum');
if (empty($category)) {
    $category = 'Umum';
}
$duration = trim($_POST['duration'] ?? '');

if (empty($title)) {
    sendJson(['success' => false, 'message' => 'Judul video wajib diisi.'], 400);
}

// 2. Periksa apakah ada file video yang dikirim dan tangani error code bawaan PHP
if (!isset($_FILES['video_file'])) {
    sendJson(['success' => false, 'message' => 'Tidak ada file video yang dipilih atau berkas tidak diterima server.'], 400);
}

$fileError = $_FILES['video_file']['error'];
if ($fileError !== UPLOAD_ERR_OK) {
    switch ($fileError) {
        case UPLOAD_ERR_INI_SIZE:
            sendJson(['success' => false, 'message' => 'Ukuran video melebihi batas konfigurasi server (upload_max_filesize). Maksimal ukuran berkas adalah 50MB.'], 413);
            break;
        case UPLOAD_ERR_FORM_SIZE:
            sendJson(['success' => false, 'message' => 'Ukuran video melebihi batas form HTML yang diizinkan.'], 413);
            break;
        case UPLOAD_ERR_PARTIAL:
            sendJson(['success' => false, 'message' => 'File video hanya terunggah sebagian (koneksi terputus). Silakan coba lagi.'], 400);
            break;
        case UPLOAD_ERR_NO_FILE:
            sendJson(['success' => false, 'message' => 'Tidak ada berkas video yang dipilih untuk diunggah.'], 400);
            break;
        case UPLOAD_ERR_NO_TMP_DIR:
            sendJson(['success' => false, 'message' => 'Folder temporary server tidak ditemukan. Hubungi administrator.'], 500);
            break;
        case UPLOAD_ERR_CANT_WRITE:
            sendJson(['success' => false, 'message' => 'Server gagal menulis file video ke disk. Ruang penyimpanan mungkin penuh.'], 500);
            break;
        case UPLOAD_ERR_EXTENSION:
            sendJson(['success' => false, 'message' => 'Unggahan video dihentikan oleh konfigurasi ekstensi PHP server.'], 500);
            break;
        default:
            sendJson(['success' => false, 'message' => 'Terjadi kesalahan saat mengunggah berkas video (Kode PHP: ' . $fileError . ').'], 400);
            break;
    }
}

$file_tmp = $_FILES['video_file']['tmp_name'];
$original_name = $_FILES['video_file']['name'];
$file_size = $_FILES['video_file']['size'];

// Validasi ekstensi video
$extension = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));
$allowed_extensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

if (!in_array($extension, $allowed_extensions)) {
    sendJson(['success' => false, 'message' => 'Format video "' . htmlspecialchars($extension) . '" tidak didukung. Gunakan format MP4, MOV, AVI, WEBM, atau MKV.'], 400);
}

// Batasi ukuran file (maksimal 50MB)
if ($file_size > 50 * 1024 * 1024) {
    sendJson(['success' => false, 'message' => 'Ukuran file video (' . round($file_size / (1024 * 1024), 1) . 'MB) melebihi batas maksimal 50MB.'], 400);
}

// Sanitasi panjang field agar tidak melampaui kapasitas kolom tabel database
$title = mb_substr($title, 0, 300);
$category = mb_substr($category, 0, 100);

if (empty($duration) || $duration === 'Calculating...' || strlen($duration) > 10) {
    $duration = substr($duration, 0, 10);
    if (empty($duration) || $duration === 'Calculatin') {
        $duration = '00:00';
    }
}

$upload_dir = dirname(__DIR__) . '/uploads/videos/';
if (!is_dir($upload_dir)) {
    if (!@mkdir($upload_dir, 0777, true) && !is_dir($upload_dir)) {
        error_log('upload-video.php: Gagal membuat folder ' . $upload_dir);
    }
}
@chmod($upload_dir, 0777);

if (!is_writable($upload_dir)) {
    sendJson(['success' => false, 'message' => 'Folder penyimpanan video di server tidak memiliki izin tulis (writable). Hubungi administrator.'], 500);
}

$new_filename = 'video_' . $user_id . '_' . time() . '.' . $extension;
$target_file = $upload_dir . $new_filename;

if (move_uploaded_file($file_tmp, $target_file)) {
    @chmod($target_file, 0666);
    try {
        $roomId = isset($_POST['room_id']) ? (int)$_POST['room_id'] : null;
        if ($roomId <= 0) {
            $roomId = null;
        }

        // Pastikan kolom room_id ada di eco_creation_videos jika belum termigrasi
        try {
            $colCheck = $pdo->query("SHOW COLUMNS FROM eco_creation_videos LIKE 'room_id'")->fetch();
            if (!$colCheck) {
                $pdo->exec("ALTER TABLE eco_creation_videos ADD COLUMN room_id INT DEFAULT NULL");
            }
        } catch (Exception $colEx) {
            // Abaikan jika tidak diizinkan ALTER
        }

        // Jika room_id ada, pastikan room_id valid di tabel rooms
        if ($roomId !== null) {
            try {
                $stmtRoomCheck = $pdo->prepare("SELECT id FROM rooms WHERE id = :id LIMIT 1");
                $stmtRoomCheck->execute(['id' => $roomId]);
                if (!$stmtRoomCheck->fetchColumn()) {
                    $roomId = null; // Set null jika room tidak ada agar tidak melanggar foreign key
                }
            } catch (Exception $roomEx) {
                $roomId = null;
            }
        }

        // Langsung set status = 'approved' (tanpa persetujuan guru) sesuai request user
        $stmt = $pdo->prepare(
            "INSERT INTO eco_creation_videos (student_id, room_id, title, category, duration, filename, original_name, status, approved_at) 
             VALUES (:student_id, :room_id, :title, :category, :duration, :filename, :original_name, 'approved', CURRENT_TIMESTAMP)"
        );
        $stmt->execute([
            'student_id' => $user_id,
            'room_id' => $roomId,
            'title' => $title,
            'category' => $category,
            'duration' => $duration,
            'filename' => $new_filename,
            'original_name' => $original_name
        ]);

        $inserted_id = $pdo->lastInsertId();

        // Ambil nama murid pengunggah
        $stmt_user = $pdo->prepare("SELECT full_name FROM users WHERE id = :id");
        $stmt_user->execute(['id' => $user_id]);
        $user_name = $stmt_user->fetchColumn() ?: 'Murid';

        sendJson([
            'success' => true,
            'message' => 'Video berhasil diunggah dan langsung dipublikasikan.',
            'video' => [
                'id' => (int)$inserted_id,
                'student_id' => $user_id,
                'student_name' => $user_name,
                'title' => $title,
                'category' => $category,
                'duration' => $duration,
                'filename' => $new_filename,
                'original_name' => $original_name,
                'views' => 0,
                'likes' => 0,
                'submitted_at' => date('Y-m-d H:i:s')
            ]
        ]);
    } catch (PDOException $e) {
        error_log('upload-video.php DB error: ' . $e->getMessage());
        if (file_exists($target_file)) {
            @unlink($target_file);
        }
        sendJson(['success' => false, 'message' => 'Kesalahan database saat menyimpan informasi video: ' . $e->getMessage()], 500);
    }
} else {
    $lastErr = error_get_last();
    $detail = $lastErr ? ' (' . $lastErr['message'] . ')' : '';
    sendJson(['success' => false, 'message' => 'Gagal memindahkan file video ke server' . $detail . '. Pastikan ukuran file tidak melebihi batas upload dan folder penyimpanan memiliki izin tulis.'], 500);
}
