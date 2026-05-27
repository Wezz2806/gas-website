<?php
// api/edit-comment.php
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

if ($comment_id <= 0 || empty($content)) {
    sendJson(['success' => false, 'message' => 'Komentar tidak boleh kosong.'], 400);
}

try {
    // Pastikan komentar ini milik siswa yang sedang login
    $stmt = $pdo->prepare("SELECT id FROM eco_challenge_comments WHERE id = :id AND student_id = :student_id LIMIT 1");
    $stmt->execute(['id' => $comment_id, 'student_id' => $user_id]);
    if (!$stmt->fetch()) {
        sendJson(['success' => false, 'message' => 'Komentar tidak ditemukan atau Anda tidak memiliki akses untuk mengeditnya.'], 403);
    }

    $stmt = $pdo->prepare("UPDATE eco_challenge_comments SET content = :content WHERE id = :id");
    $stmt->execute(['content' => $content, 'id' => $comment_id]);

    sendJson(['success' => true, 'message' => 'Komentar berhasil diubah.']);
} catch (PDOException $e) {
    error_log('edit-comment.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat mengubah komentar.'], 500);
}
