<?php
// api/edit-video.php
require_once 'config.php';

@ini_set('max_execution_time', '300');
@ini_set('max_input_time', '300');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan. Gunakan POST.'], 405);
}

// Periksa apakah upload file baru melebihi post_max_size
if (empty($_POST) && empty($_FILES) && (int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    sendJson([
        'success' => false,
        'message' => 'Ukuran file video melebihi batas kapasitas unggah server (post_max_size). Harap gunakan video dengan ukuran lebih kecil (maksimal 50MB).'
    ], 413);
}

$user_id = getAuthUserId();
if ($user_id === null) {
    sendJson(['success' => false, 'message' => 'Sesi tidak aktif atau telah berakhir. Silakan login kembali.'], 401);
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

if (empty($category)) {
    $category = 'Umum';
}

if ($video_id <= 0 || empty($title)) {
    sendJson(['success' => false, 'message' => 'Judul video wajib diisi.'], 400);
}

// Sanitasi panjang field
$title = mb_substr($title, 0, 300);
$category = mb_substr($category, 0, 100);

if (!empty($duration)) {
    $duration = substr($duration, 0, 10);
    if ($duration === 'Calculatin' || $duration === 'Calculatin...') {
        $duration = '00:00';
    }
}

try {
    // Pastikan video ini milik murid yang sedang login (atau admin)
    $user_role = $_SESSION['user']['role'] ?? '';
    if ($user_role === 'admin') {
        $stmt = $pdo->prepare("SELECT id, filename, original_name, duration FROM eco_creation_videos WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $video_id]);
    } else {
        $stmt = $pdo->prepare("SELECT id, filename, original_name, duration FROM eco_creation_videos WHERE id = :id AND student_id = :student_id LIMIT 1");
        $stmt->execute(['id' => $video_id, 'student_id' => $user_id]);
    }
    $video = $stmt->fetch();

    if (!$video) {
        sendJson(['success' => false, 'message' => 'Video tidak ditemukan atau Anda tidak memiliki akses untuk mengeditnya.'], 403);
    }

    $new_filename = $video['filename'];
    $original_name = $video['original_name'];
    $final_duration = $video['duration'];

    // Periksa jika ada file video baru diunggah untuk menggantikan yang lama
    if (isset($_FILES['video_file'])) {
        $fileError = $_FILES['video_file']['error'];
        
        if ($fileError !== UPLOAD_ERR_NO_FILE) {
            if ($fileError !== UPLOAD_ERR_OK) {
                switch ($fileError) {
                    case UPLOAD_ERR_INI_SIZE:
                        sendJson(['success' => false, 'message' => 'Ukuran file video pengganti melebihi batas server (upload_max_filesize). Maksimal 50MB.'], 413);
                        break;
                    case UPLOAD_ERR_FORM_SIZE:
                        sendJson(['success' => false, 'message' => 'Ukuran file video pengganti melebihi batas form.'], 413);
                        break;
                    case UPLOAD_ERR_PARTIAL:
                        sendJson(['success' => false, 'message' => 'File video pengganti hanya terunggah sebagian.'], 400);
                        break;
                    default:
                        sendJson(['success' => false, 'message' => 'Terjadi kesalahan saat mengunggah berkas video pengganti (Kode: ' . $fileError . ').'], 400);
                        break;
                }
            }

            $file_tmp = $_FILES['video_file']['tmp_name'];
            $orig_name = $_FILES['video_file']['name'];
            $file_size = $_FILES['video_file']['size'];

            // Validasi tipe video
            $extension = strtolower(pathinfo($orig_name, PATHINFO_EXTENSION));
            $allowed_extensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
            if (!in_array($extension, $allowed_extensions)) {
                sendJson(['success' => false, 'message' => 'Format video "' . htmlspecialchars($extension) . '" tidak didukung. Gunakan MP4, MOV, AVI, WEBM, atau MKV.'], 400);
            }

            // Batasi ukuran file (50MB)
            if ($file_size > 50 * 1024 * 1024) {
                sendJson(['success' => false, 'message' => 'Ukuran file video maksimal adalah 50MB.'], 400);
            }

            $upload_dir = dirname(__DIR__) . '/uploads/videos/';
            if (!is_dir($upload_dir)) {
                @mkdir($upload_dir, 0777, true);
            }
            @chmod($upload_dir, 0777);

            if (!is_writable($upload_dir)) {
                sendJson(['success' => false, 'message' => 'Folder penyimpanan video di server tidak dapat ditulis (read-only). Hubungi administrator.'], 500);
            }

            $temp_filename = 'video_' . $user_id . '_' . time() . '.' . $extension;
            $target_file = $upload_dir . $temp_filename;

            if (move_uploaded_file($file_tmp, $target_file)) {
                @chmod($target_file, 0666);
                // Hapus file video lama dari server jika nama filenya berbeda
                $old_file = $upload_dir . $video['filename'];
                if (file_exists($old_file) && $video['filename'] !== $temp_filename) {
                    @unlink($old_file);
                }

                $new_filename = $temp_filename;
                $original_name = $orig_name;
                $final_duration = empty($duration) ? '00:00' : $duration;
            } else {
                $lastErr = error_get_last();
                $detail = $lastErr ? ' (' . $lastErr['message'] . ')' : '';
                sendJson(['success' => false, 'message' => 'Gagal memindahkan file video baru ke folder server' . $detail . '.'], 500);
            }
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

    // Ambil nama murid pengunggah
    $stmt_user = $pdo->prepare("SELECT full_name FROM users WHERE id = :id");
    $stmt_user->execute(['id' => $user_id]);
    $user_name = $stmt_user->fetchColumn() ?: 'Murid';

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
    sendJson(['success' => false, 'message' => 'Kesalahan database saat memperbarui video: ' . $e->getMessage()], 500);
}
