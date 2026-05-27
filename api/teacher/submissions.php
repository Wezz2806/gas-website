<?php
// api/teacher/submissions.php

require_once '../config.php';

// Pastikan session aktif
if (!isset($_SESSION['user'])) {
    sendJson([
        'success' => false,
        'message' => 'Sesi tidak aktif. Silakan login.'
    ], 401);
}

$user_role = $_SESSION['user']['role'];
$method = $_SERVER['REQUEST_METHOD'];

// Hanya Guru/Admin yang bisa mengakses daftar seluruh submission
if ($user_role !== 'teacher' && $user_role !== 'admin') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Endpoint ini hanya untuk Guru.'
    ], 403);
}

if ($method === 'GET') {
    $status_filter = $_GET['status'] ?? ''; // 'pending' atau 'graded'

    try {
        $query = "
            SELECT s.*, 
                   u.full_name as student_name, 
                   u.email as student_email,
                   m.title as meeting_title,
                   m.number as meeting_number
            FROM student_submissions s
            JOIN users u ON s.student_id = u.id
            JOIN meetings m ON s.meeting_id = m.id
        ";

        $params = [];
        if (!empty($status_filter)) {
            $query .= " WHERE s.status = :status";
            $params['status'] = $status_filter;
        }

        $query .= " ORDER BY s.submitted_at DESC";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $submissions = $stmt->fetchAll();

        sendJson([
            'success' => true,
            'submissions' => $submissions
        ]);

    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengambil data submissions: ' . $e->getMessage()
        ], 500);
    }
} else {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan GET.'
    ], 405);
}
