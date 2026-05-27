<?php
// api/like-video.php
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

if ($video_id <= 0) {
    sendJson(['success' => false, 'message' => 'ID Video tidak valid.'], 400);
}

try {
    $stmt = $pdo->prepare("UPDATE eco_creation_videos SET likes = likes + 1 WHERE id = :id");
    $stmt->execute(['id' => $video_id]);
    sendJson(['success' => true, 'message' => 'Video disukai.']);
} catch (PDOException $e) {
    error_log('like-video.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat menyukai video.'], 500);
}
