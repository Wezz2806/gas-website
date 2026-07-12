<?php
// api/admin/dashboard-stats.php

require_once '../config.php';

// Pastikan hanya menerima request GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan GET.'
    ], 405);
}

// Proteksi Sesi & Akses Admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Endpoint ini hanya untuk Administrator.'
    ], 403);
}

try {
    // 1. Hitung statistik user berdasarkan role
    $stmtUsers = $pdo->query("
        SELECT 
            SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as total_students,
            SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
            COUNT(*) as total_users
        FROM users
    ");
    $userStats = $stmtUsers->fetch();

    $totalStudents = (int)($userStats['total_students'] ?? 0);
    $totalAdmins = (int)($userStats['total_admins'] ?? 0);
    $totalUsers = (int)($userStats['total_users'] ?? 0);

    // 2. Hitung jumlah pengumpulan LKM (submissions)
    $totalSubmissions = 0;
    $pendingSubmissions = 0;
    try {
        $stmtSub = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
            FROM student_submissions
        ");
        $subStats = $stmtSub->fetch();
        $totalSubmissions = (int)($subStats['total'] ?? 0);
        $pendingSubmissions = (int)($subStats['pending'] ?? 0);
    } catch (PDOException $ex) {
        // Abaikan jika tabel belum ada
    }

    // 3. Hitung jumlah video ecocreation yang diunggah
    $totalVideos = 0;
    $pendingVideos = 0;
    try {
        $stmtVid = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
            FROM eco_creation_videos
        ");
        $vidStats = $stmtVid->fetch();
        $totalVideos = (int)($vidStats['total'] ?? 0);
        $pendingVideos = (int)($vidStats['pending'] ?? 0);
    } catch (PDOException $ex) {
        // Abaikan jika tabel belum ada
    }

    // 4. Hitung jumlah pesan kontak masuk
    $totalMessages = 0;
    $unreadMessages = 0;
    try {
        $stmtMsg = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread
            FROM eco_contact_messages
        ");
        $msgStats = $stmtMsg->fetch();
        $totalMessages = (int)($msgStats['total'] ?? 0);
        $unreadMessages = (int)($msgStats['unread'] ?? 0);
    } catch (PDOException $ex) {
        // Abaikan jika tabel belum ada
    }

    // 5. Total Poin yang Didistribusikan
    $stmtPoints = $pdo->query("SELECT SUM(eco_points) as total_points FROM users");
    $totalPoints = (int)($stmtPoints->fetch()['total_points'] ?? 0);

    // 6. Jurnal Monitoring count (unique murid)
    $totalJournals = 0;
    try {
        $totalJournals = (int)$pdo->query("SELECT COUNT(DISTINCT student_id) FROM sustainability_journals")->fetchColumn();
    } catch (PDOException $ex) {}

    // 7. Surveys count (Angket)
    $totalSurveys = 0;
    try {
        $totalSurveys = (int)$pdo->query("SELECT COUNT(*) FROM student_surveys")->fetchColumn();
    } catch (PDOException $ex) {}

    // 8. Test count (submitted = 1)
    $totalTests = 0;
    try {
        $totalTests = (int)$pdo->query("SELECT COUNT(*) FROM student_tests WHERE submitted = 1")->fetchColumn();
    } catch (PDOException $ex) {}

    sendJson([
        'success' => true,
        'stats' => [
            'total_users' => $totalUsers,
            'total_students' => $totalStudents,
            'total_admins' => $totalAdmins,
            'total_submissions' => $totalSubmissions,
            'pending_submissions' => $pendingSubmissions,
            'total_videos' => $totalVideos,
            'pending_videos' => $pendingVideos,
            'total_messages' => $totalMessages,
            'unread_messages' => $unreadMessages,
            'total_points' => $totalPoints,
            'total_journals' => $totalJournals,
            'total_surveys' => $totalSurveys,
            'total_tests' => $totalTests
        ]
    ]);

} catch (PDOException $e) {
    sendJson([
        'success' => false,
        'message' => 'Terjadi kesalahan basis data: ' . $e->getMessage()
    ], 500);
}
