<?php
// api/get-videos.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan.'], 405);
}

try {
    // Ambil semua video yang diunggah siswa, gabungkan dengan tabel user untuk mengambil nama siswa
    $stmt = $pdo->query(
        "SELECT v.id, v.student_id, v.title, v.category, v.duration, v.filename, v.original_name, 
                v.views, v.likes, v.submitted_at, u.full_name as student_name,
                (SELECT COUNT(*) FROM eco_creation_video_comments WHERE video_id = v.id) as comments_count
         FROM eco_creation_videos v
         JOIN users u ON v.student_id = u.id
         ORDER BY v.submitted_at DESC"
    );
    $videos = $stmt->fetchAll();

    sendJson(['success' => true, 'videos' => $videos]);
} catch (PDOException $e) {
    error_log('get-videos.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat mengambil data video.'], 500);
}
