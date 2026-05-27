<?php
// api/edit-video.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan. Gunakan POST.'], 405);
}

$user_id = getAuthUserId();
if ($user_id === null) {
    sendJson(['success' => false, 'message' => 'Sesi tidak aktif. Silakan login terlebih dahulu.'], 401);
}

// Baca field dari $_POST (untuk form multipart) dan fallback ke JSON body
$video_id = (int)($_POST['video_id'] ?? 0);
$title = trim($_POST['title'] ?? '');
$category = trim($_POST['category'] ?? '');
$duration = trim($_POST['duration'] ?? '');

if ($video_id <= 0) {
    $data = getRequestBody();
    $video_id = (int)($data['video_id'] ?? 0);
    $title = trim($data['title'] ?? $title);
    $category = trim($data['category'] ?? $category);
}

if ($video_id <= 0 || empty($title) || empty($category)) {
    sendJson(['success' => false, 'message' => 'Judul dan kategori wajib diisi.'], 400);
}

try {
    // Pastikan video ini milik siswa yang sedang login
    $stmt = $pdo->prepare("SELECT id, filename, original_name, duration FROM eco_creation_videos WHERE id = :id AND student_id = :student_id LIMIT 1");
    $stmt->execute(['id' => $video_id, 'student_id' => $user_id]);
    $video = $stmt->fetch();

    if (!$video) {
        sendJson(['success' => false, 'message' => 'Video tidak ditemukan atau Anda tidak memiliki akses untuk mengeditnya.'], 403);
    }

    $new_filename = $video['filename'];
    $original_name = $video['original_name'];
    $final_duration = $video['duration'];

    // Periksa jika ada file video baru diunggah untuk menggantikan yang lama
    if (isset($_FILES['video_file']) && $_FILES['video_file']['error'] === UPLOAD_ERR_OK) {
        $file_tmp = $_FILES['video_file']['tmp_name'];
        $orig_name = $_FILES['video_file']['name'];
        $file_size = $_FILES['video_file']['size'];

        // Validasi tipe video
        $extension = strtolower(pathinfo($orig_name, PATHINFO_EXTENSION));
        $allowed_extensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
        if (!in_array($extension, $allowed_extensions)) {
            sendJson(['success' => false, 'message' => 'Format video tidak didukung. Gunakan MP4, MOV, AVI, WEBM, atau MKV.'], 400);
        }

        // Batasi ukuran file (100MB)
        if ($file_size > 100 * 1024 * 1024) {
            sendJson(['success' => false, 'message' => 'Ukuran file video maksimal adalah 100MB.'], 400);
        }

        $upload_dir = dirname(__DIR__) . '/uploads/videos/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }

        $temp_filename = 'video_' . $user_id . '_' . time() . '.' . $extension;
        $target_file = $upload_dir . $temp_filename;

        if (move_uploaded_file($file_tmp, $target_file)) {
            // Hapus file video lama dari server
            $old_file = $upload_dir . $video['filename'];
            if (file_exists($old_file)) {
                @unlink($old_file);
            }

            $new_filename = $temp_filename;
            $original_name = $orig_name;
            $final_duration = empty($duration) ? '00:00' : $duration;
        } else {
            sendJson(['success' => false, 'message' => 'Gagal memindahkan file video baru ke server.'], 500);
        }
    }

    // Update database
    $stmt = $pdo->prepare("
        UPDATE eco_creation_videos 
        SET title = :title, category = :category, filename = :filename, original_name = :original_name, duration = :duration 
        WHERE id = :id
    ");
    $stmt->execute([
        'title' => $title,
        'category' => $category,
        'filename' => $new_filename,
        'original_name' => $original_name,
        'duration' => $final_duration,
        'id' => $video_id
    ]);

    // Ambil nama mahasiswa pengunggah
    $stmt_user = $pdo->prepare("SELECT full_name FROM users WHERE id = :id");
    $stmt_user->execute(['id' => $user_id]);
    $user_name = $stmt_user->fetchColumn() ?: 'Siswa';

    sendJson([
        'success' => true, 
        'message' => 'Video berhasil diperbarui.',
        'video' => [
            'id' => $video_id,
            'student_id' => $user_id,
            'student_name' => $user_name,
            'title' => $title,
            'category' => $category,
            'duration' => $final_duration,
            'filename' => $new_filename,
            'original_name' => $original_name
        ]
    ]);
} catch (PDOException $e) {
    error_log('edit-video.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat memperbarui video.'], 500);
}
