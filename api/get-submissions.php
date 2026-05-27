<?php
// api/get-submissions.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan.'], 405);
}

$user_id = getAuthUserId();
if ($user_id === null) {
    sendJson(['success' => false, 'message' => 'Sesi tidak aktif. Silakan login terlebih dahulu.'], 401);
}

try {
    $stmt = $pdo->prepare(
        "SELECT id, meeting_id, filename, original_name, status, submitted_at 
         FROM student_submissions 
         WHERE student_id = :student_id"
    );
    $stmt->execute(['student_id' => $user_id]);
    $submissions = $stmt->fetchAll();

    // Map by meeting_id for easier consumption in React
    $mapped = [];
    foreach ($submissions as $sub) {
        $mapped[$sub['meeting_id']] = [
            'id' => (int)$sub['id'],
            'filename' => $sub['filename'],
            'original_name' => $sub['original_name'],
            'status' => $sub['status'],
            'submitted_at' => $sub['submitted_at']
        ];
    }

    sendJson(['success' => true, 'submissions' => $mapped]);
} catch (PDOException $e) {
    error_log('get-submissions.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat mengambil data LKM.'], 500);
}
