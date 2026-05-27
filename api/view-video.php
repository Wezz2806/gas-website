<?php
// api/view-video.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan.'], 405);
}

$data = getRequestBody();
$video_id = (int)($data['video_id'] ?? 0);

if ($video_id <= 0) {
    sendJson(['success' => false, 'message' => 'ID Video tidak valid.'], 400);
}

try {
    $stmt = $pdo->prepare("UPDATE eco_creation_videos SET views = views + 1 WHERE id = :id");
    $stmt->execute(['id' => $video_id]);
    sendJson(['success' => true, 'message' => 'Jumlah tayangan diperbarui.']);
} catch (PDOException $e) {
    error_log('view-video.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat memperbarui tayangan.'], 500);
}
