<?php
// api/delete-video.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan. Gunakan POST.'], 405);
}

$user_id = getAuthUserId();
if ($user_id === null) {
    sendJson(['success' => false, 'message' => 'Sesi tidak aktif. Silakan login terlebih dahulu.'], 401);
}

$data = getRequestBody();
$video_id = (int)($data['video_id'] ?? 0);

if ($video_id <= 0) {
    sendJson(['success' => false, 'message' => 'ID Video tidak valid.'], 400);
}

try {
    // Pastikan video ini milik siswa yang sedang login
    $stmt = $pdo->prepare("SELECT id, filename FROM eco_creation_videos WHERE id = :id AND student_id = :student_id LIMIT 1");
    $stmt->execute(['id' => $video_id, 'student_id' => $user_id]);
    $video = $stmt->fetch();

    if (!$video) {
        sendJson(['success' => false, 'message' => 'Video tidak ditemukan atau Anda tidak memiliki akses untuk menghapusnya.'], 403);
    }

    // Hapus file fisik dari disk
    $file_path = dirname(__DIR__) . '/uploads/videos/' . $video['filename'];
    if (file_exists($file_path)) {
        @unlink($file_path);
    }

    // Hapus baris di database
    $stmt = $pdo->prepare("DELETE FROM eco_creation_videos WHERE id = :id");
    $stmt->execute(['id' => $video_id]);

    sendJson(['success' => true, 'message' => 'Video berhasil dihapus dari galeri EcoCreation.']);
} catch (PDOException $e) {
    error_log('delete-video.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat menghapus video.'], 500);
}
