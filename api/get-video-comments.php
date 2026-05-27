<?php
// api/get-video-comments.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan.'], 405);
}

$video_id = (int)($_GET['video_id'] ?? 0);
if ($video_id <= 0) {
    sendJson(['success' => false, 'message' => 'ID Video tidak valid.'], 400);
}

try {
    $stmt = $pdo->prepare(
        "SELECT c.id, c.video_id, c.student_id, c.content, c.created_at, u.full_name as author, u.avatar_url
         FROM eco_creation_video_comments c
         JOIN users u ON c.student_id = u.id
         WHERE c.video_id = :video_id
         ORDER BY c.created_at DESC"
    );
    $stmt->execute(['video_id' => $video_id]);
    $comments = $stmt->fetchAll();

    sendJson(['success' => true, 'comments' => $comments]);
} catch (PDOException $e) {
    error_log('get-video-comments.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat mengambil komentar video.'], 500);
}
