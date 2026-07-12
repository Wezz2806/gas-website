<?php
// api/upload-video.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan. Gunakan POST.'], 405);
}

$user_id = getAuthUserId();
if ($user_id === null) {
    sendJson(['success' => false, 'message' => 'Sesi tidak aktif. Silakan login terlebih dahulu.'], 401);
}

$title = trim($_POST['title'] ?? '');
$category = trim($_POST['category'] ?? 'Umum');
$duration = trim($_POST['duration'] ?? '');

if (empty($title)) {
    sendJson(['success' => false, 'message' => 'Judul video wajib diisi.'], 400);
}

if (!isset($_FILES['video_file']) || $_FILES['video_file']['error'] !== UPLOAD_ERR_OK) {
    sendJson(['success' => false, 'message' => 'Tidak ada file video yang diunggah atau terjadi kesalahan.'], 400);
}

$file_tmp = $_FILES['video_file']['tmp_name'];
$original_name = $_FILES['video_file']['name'];
$file_size = $_FILES['video_file']['size'];

// Validasi ekstensi video
$extension = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));
$allowed_extensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

if (!in_array($extension, $allowed_extensions)) {
    sendJson(['success' => false, 'message' => 'Format video tidak didukung. Gunakan MP4, MOV, AVI, WEBM, atau MKV.'], 400);
}

// Batasi ukuran file (maksimal 50MB)
if ($file_size > 50 * 1024 * 1024) {
    sendJson(['success' => false, 'message' => 'Ukuran file video maksimal adalah 50MB.'], 400);
}

$upload_dir = dirname(__DIR__) . '/uploads/videos/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

$new_filename = 'video_' . $user_id . '_' . time() . '.' . $extension;
$target_file = $upload_dir . $new_filename;

if (move_uploaded_file($file_tmp, $target_file)) {
    try {
        // Langsung set status = 'approved' (tanpa persetujuan guru) sesuai request user
        $stmt = $pdo->prepare(
            "INSERT INTO eco_creation_videos (student_id, title, category, duration, filename, original_name, status, approved_at) 
             VALUES (:student_id, :title, :category, :duration, :filename, :original_name, 'approved', CURRENT_TIMESTAMP)"
        );
        $stmt->execute([
            'student_id' => $user_id,
            'title' => $title,
            'category' => $category,
            'duration' => empty($duration) ? '00:00' : $duration,
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
                'duration' => empty($duration) ? '00:00' : $duration,
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
        sendJson(['success' => false, 'message' => 'Kesalahan database saat menyimpan informasi video.'], 500);
    }
} else {
    sendJson(['success' => false, 'message' => 'Gagal memindahkan file video ke server. Pastikan ukuran file tidak melebihi batas upload server.'], 500);
}
