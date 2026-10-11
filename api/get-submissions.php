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
    $roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;
    
    $query = "SELECT id, meeting_id, filename, original_name, status, submitted_at 
              FROM student_submissions 
              WHERE student_id = :student_id";
    $params = ['student_id' => $user_id];
    
    if ($roomId > 0) {
        $query .= " AND (room_id = :room_id OR room_id IS NULL)";
        $params['room_id'] = $roomId;
    }
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
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
