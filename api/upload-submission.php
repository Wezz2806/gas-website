<?php
// api/upload-submission.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan. Gunakan POST.'], 405);
}

$user_id = getAuthUserId();
if ($user_id === null) {
    sendJson(['success' => false, 'message' => 'Sesi tidak aktif. Silakan login terlebih dahulu.'], 401);
}

$meeting_id = trim($_POST['meeting_id'] ?? '');
if (empty($meeting_id)) {
    sendJson(['success' => false, 'message' => 'ID Pertemuan (meeting_id) wajib diisi.'], 400);
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    sendJson(['success' => false, 'message' => 'Tidak ada file yang diunggah atau terjadi kesalahan saat unggah.'], 400);
}

$file_tmp = $_FILES['file']['tmp_name'];
$original_name = $_FILES['file']['name'];
$file_size = $_FILES['file']['size'];

// Validasi ekstensi file
$extension = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));
$allowed_extensions = ['pdf', 'docx', 'doc', 'pptx'];

if (!in_array($extension, $allowed_extensions)) {
    sendJson(['success' => false, 'message' => 'Hanya file dengan ekstensi PDF, DOCX, DOC, atau PPTX yang diizinkan.'], 400);
}

// Batasi ukuran file (maksimal 10MB)
if ($file_size > 10 * 1024 * 1024) {
    sendJson(['success' => false, 'message' => 'Ukuran file maksimal adalah 10MB.'], 400);
}

$upload_dir = dirname(__DIR__) . '/uploads/submissions/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

$new_filename = 'submission_' . $user_id . '_' . $meeting_id . '_' . time() . '.' . $extension;
$target_file = $upload_dir . $new_filename;

if (move_uploaded_file($file_tmp, $target_file)) {
    try {
        $roomId = isset($_POST['room_id']) ? (int)$_POST['room_id'] : null;
        if ($roomId <= 0) {
            $roomId = null;
        }

        // Check if user already submitted for this meeting and room
        if ($roomId !== null) {
            $stmt = $pdo->prepare("SELECT id, filename FROM student_submissions WHERE student_id = :student_id AND meeting_id = :meeting_id AND room_id = :room_id LIMIT 1");
            $stmt->execute(['student_id' => $user_id, 'meeting_id' => $meeting_id, 'room_id' => $roomId]);
        } else {
            $stmt = $pdo->prepare("SELECT id, filename FROM student_submissions WHERE student_id = :student_id AND meeting_id = :meeting_id LIMIT 1");
            $stmt->execute(['student_id' => $user_id, 'meeting_id' => $meeting_id]);
        }
        $existing = $stmt->fetch();

        if ($existing) {
            // Delete old file if exists
            $old_file = $upload_dir . $existing['filename'];
            if (file_exists($old_file)) {
                @unlink($old_file);
            }

            // Update
            $stmt = $pdo->prepare(
                "UPDATE student_submissions 
                 SET filename = :filename, original_name = :original_name, room_id = :room_id, status = 'pending', submitted_at = CURRENT_TIMESTAMP
                 WHERE id = :id"
            );
            $stmt->execute([
                'filename' => $new_filename,
                'original_name' => $original_name,
                'room_id' => $roomId,
                'id' => $existing['id']
            ]);
        } else {
            // Insert
            $stmt = $pdo->prepare(
                "INSERT INTO student_submissions (student_id, room_id, meeting_id, filename, original_name, status) 
                 VALUES (:student_id, :room_id, :meeting_id, :filename, :original_name, 'pending')"
            );
            $stmt->execute([
                'student_id' => $user_id,
                'room_id' => $roomId,
                'meeting_id' => $meeting_id,
                'filename' => $new_filename,
                'original_name' => $original_name
            ]);
        }

        sendJson([
            'success' => true,
            'message' => 'File LKM berhasil diunggah dan disimpan ke database.',
            'submission' => [
                'meeting_id' => $meeting_id,
                'filename' => $new_filename,
                'original_name' => $original_name,
                'status' => 'pending'
            ]
        ]);
    } catch (PDOException $e) {
        error_log('upload-submission.php DB error: ' . $e->getMessage());
        // Clean up uploaded file if DB operation fails
        if (file_exists($target_file)) {
            @unlink($target_file);
        }
        sendJson(['success' => false, 'message' => 'Kesalahan database saat menyimpan pengumpulan LKM.'], 500);
    }
} else {
    sendJson(['success' => false, 'message' => 'Gagal memindahkan file ke direktori tujuan di server.'], 500);
}
