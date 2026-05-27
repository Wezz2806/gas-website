<?php
// api/edit-video-comment.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan.'], 405);
}

$user_id = getAuthUserId();
if ($user_id === null) {
    sendJson(['success' => false, 'message' => 'Sesi tidak aktif. Silakan login terlebih dahulu.'], 401);
}

$data = getRequestBody();
$comment_id = (int)($data['comment_id'] ?? 0);
$content = trim($data['content'] ?? '');

if ($comment_id <= 0) {
    sendJson(['success' => false, 'message' => 'ID Komentar tidak valid.'], 400);
}
if (empty($content)) {
    sendJson(['success' => false, 'message' => 'Komentar tidak boleh kosong.'], 400);
}

try {
    // Ensure the comment belongs to this student
    $stmt = $pdo->prepare("SELECT student_id FROM eco_creation_video_comments WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $comment_id]);
    $comment = $stmt->fetch();

    if (!$comment) {
        sendJson(['success' => false, 'message' => 'Komentar tidak ditemukan.'], 404);
    }

    if ($comment['student_id'] !== $user_id) {
        sendJson(['success' => false, 'message' => 'Anda tidak memiliki hak akses untuk mengubah komentar ini.'], 403);
    }

    $stmt_upd = $pdo->prepare("UPDATE eco_creation_video_comments SET content = :content WHERE id = :id");
    $stmt_upd->execute(['content' => $content, 'id' => $comment_id]);

    sendJson(['success' => true, 'message' => 'Komentar berhasil diubah.']);
} catch (PDOException $e) {
    error_log('edit-video-comment.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat mengubah komentar video.'], 500);
}
