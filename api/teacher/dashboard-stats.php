<?php
// api/teacher/dashboard-stats.php

require_once '../config.php';

// Pastikan hanya menerima request GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan GET.'
    ], 405);
}

// Proteksi Sesi & Akses Guru
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Endpoint ini hanya untuk Guru.'
    ], 403);
}

try {
    // 1. Hitung total siswa terdaftar
    $stmtStudents = $pdo->query("SELECT COUNT(*) as total FROM users WHERE role = 'student'");
    $totalStudents = (int)$stmtStudents->fetch()['total'];

    // 2. Hitung jumlah pengumpulan LKM yang pending (belum dinilai)
    // Jika tabel student_submissions belum terisi atau baru, return 0
    $totalPending = 0;
    try {
        $stmtPending = $pdo->query("SELECT COUNT(*) as total FROM student_submissions WHERE status = 'pending'");
        $totalPending = (int)$stmtPending->fetch()['total'];
    } catch (PDOException $ex) {
        // Abaikan jika tabel belum di-migrate oleh pengguna
    }

    // 3. Rata-rata poin siswa
    $stmtAvgPoints = $pdo->query("SELECT AVG(eco_points) as avg_points FROM users WHERE role = 'student'");
    $avgPoints = round((float)$stmtAvgPoints->fetch()['avg_points'], 1);

    // 4. Rata-rata streak siswa
    $stmtAvgStreak = $pdo->query("SELECT AVG(streak) as avg_streak FROM users WHERE role = 'student'");
    $avgStreak = round((float)$stmtAvgStreak->fetch()['avg_streak'], 1);

    // 5. Top 5 siswa paling aktif
    $stmtTopStudents = $pdo->query("SELECT id, full_name, email, eco_points, streak, avatar_url FROM users WHERE role = 'student' ORDER BY eco_points DESC LIMIT 5");
    $topStudents = $stmtTopStudents->fetchAll();

    // 6. Aktivitas Terkini (Submission tugas terbaru)
    $recentActivity = [];
    try {
        $stmtRecent = $pdo->query("
            SELECT s.id, s.submitted_at, s.status, u.full_name as student_name, s.meeting_id 
            FROM student_submissions s 
            JOIN users u ON s.student_id = u.id 
            ORDER BY s.submitted_at DESC 
            LIMIT 5
        ");
        $recentActivity = $stmtRecent->fetchAll();
    } catch (PDOException $ex) {
        // Abaikan jika tabel belum di-migrate
    }

    sendJson([
        'success' => true,
        'stats' => [
            'total_students' => $totalStudents,
            'total_pending_submissions' => $totalPending,
            'average_points' => $avgPoints,
            'average_streak' => $avgStreak
        ],
        'top_students' => $topStudents,
        'recent_activity' => $recentActivity
    ]);

} catch (PDOException $e) {
    sendJson([
        'success' => false,
        'message' => 'Terjadi kesalahan basis data: ' . $e->getMessage()
    ], 500);
}
