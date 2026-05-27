<?php
// api/add-video-comment.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan.'], 405);
}

$user_id = getAuthUserId();
if ($user_id === null) {
    sendJson(['success' => false, 'message' => 'Sesi tidak aktif. Silakan login terlebih dahulu.'], 401);
}

$data = getRequestBody();
$video_id = (int)($data['video_id'] ?? 0);
$content = trim($data['content'] ?? '');

if ($video_id <= 0) {
    sendJson(['success' => false, 'message' => 'ID Video tidak valid.'], 400);
}
if (empty($content)) {
    sendJson(['success' => false, 'message' => 'Komentar tidak boleh kosong.'], 400);
}

try {
    // Ensure the video exists
    $stmt_check = $pdo->prepare("SELECT id FROM eco_creation_videos WHERE id = :id LIMIT 1");
    $stmt_check->execute(['id' => $video_id]);
    if (!$stmt_check->fetch()) {
        sendJson(['success' => false, 'message' => 'Video tidak ditemukan.'], 404);
    }

    // Insert comment
    $stmt = $pdo->prepare(
        "INSERT INTO eco_creation_video_comments (video_id, student_id, content) 
         VALUES (:video_id, :student_id, :content)"
    );
    $stmt->execute([
        'video_id' => $video_id,
        'student_id' => $user_id,
        'content' => $content
    ]);

    $inserted_id = $pdo->lastInsertId();

    $stmt_user = $pdo->prepare("SELECT full_name, avatar_url FROM users WHERE id = :id");
    $stmt_user->execute(['id' => $user_id]);
    $user_info = $stmt_user->fetch();
    $author = $user_info['full_name'] ?? 'Siswa';
    $avatar_url = $user_info['avatar_url'] ?? null;

    sendJson([
        'success' => true,
        'message' => 'Komentar video berhasil dikirim.',
        'comment' => [
            'id' => (int)$inserted_id,
            'video_id' => $video_id,
            'student_id' => $user_id,
            'author' => $author,
            'avatar_url' => $avatar_url,
            'content' => $content,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
} catch (PDOException $e) {
    error_log('add-video-comment.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat mengirim komentar video.'], 500);
}
