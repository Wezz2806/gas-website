<?php
// api/get-comments.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan.'], 405);
}

try {
    // Ambil seluruh tanggapan/komentar siswa untuk evaluasi id = 1
    $stmt = $pdo->query(
        "SELECT c.id, c.student_id, c.content, c.created_at, u.full_name as author
         FROM eco_challenge_comments c
         JOIN users u ON c.student_id = u.id
         WHERE c.evaluation_id = 1
         ORDER BY c.created_at ASC"
    );
    $comments = $stmt->fetchAll();

    sendJson(['success' => true, 'comments' => $comments]);
} catch (PDOException $e) {
    error_log('get-comments.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat mengambil komentar.'], 500);
}
