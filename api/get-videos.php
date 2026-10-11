<?php
// api/get-videos.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan.'], 405);
}

try {
    $roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;
    
    $query = "SELECT v.id, v.student_id, v.room_id, v.title, v.category, v.duration, v.filename, v.original_name, 
                v.views, v.likes, v.submitted_at, u.full_name as student_name,
                (SELECT COUNT(*) FROM eco_creation_video_comments WHERE video_id = v.id) as comments_count
         FROM eco_creation_videos v
         JOIN users u ON v.student_id = u.id";
    
    if ($roomId > 0) {
        $query .= " WHERE (v.room_id = :room_id OR v.room_id IS NULL)";
    }
    $query .= " ORDER BY v.submitted_at DESC";

    $stmt = $pdo->prepare($query);
    if ($roomId > 0) {
        $stmt->execute(['room_id' => $roomId]);
    } else {
        $stmt->execute();
    }
    $videos = $stmt->fetchAll();

    sendJson(['success' => true, 'videos' => $videos]);
} catch (PDOException $e) {
    error_log('get-videos.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat mengambil data video.'], 500);
}
