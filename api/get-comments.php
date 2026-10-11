<?php
// api/get-comments.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan.'], 405);
}

try {
    $roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;

    $query = "SELECT c.id, c.student_id, c.room_id, c.content, c.created_at, u.full_name as author
              FROM eco_challenge_comments c
              JOIN users u ON c.student_id = u.id";
    
    if ($roomId > 0) {
        $query .= " WHERE (c.room_id = :room_id OR c.room_id IS NULL)";
    }
    $query .= " ORDER BY c.created_at ASC";

    $stmt = $pdo->prepare($query);
    if ($roomId > 0) {
        $stmt->execute(['room_id' => $roomId]);
    } else {
        $stmt->execute();
    }
    $comments = $stmt->fetchAll();

    sendJson(['success' => true, 'comments' => $comments]);
} catch (PDOException $e) {
    error_log('get-comments.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat mengambil komentar.'], 500);
}
