<?php
// api/teacher/student-progress.php

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

// Hanya Guru/Admin yang boleh memantau kemajuan kelas
if ($user_role !== 'teacher' && $user_role !== 'admin') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Endpoint ini hanya untuk Guru.'
    ], 403);
}

if ($method === 'GET') {
    try {
        // Ambil semua mahasiswa beserta agregasi nilai dan tugas
        $query = "
            SELECT u.id, 
                   u.full_name, 
                   u.email, 
                   u.eco_points, 
                   u.streak, 
                   u.avatar_url,
                   (SELECT COUNT(*) FROM student_submissions s WHERE s.student_id = u.id) as total_submissions,
                   (SELECT AVG(s.grade) FROM student_submissions s WHERE s.student_id = u.id AND s.status = 'graded') as avg_grade
            FROM users u
            WHERE u.role = 'student'
            ORDER BY u.full_name ASC
        ";

        $stmt = $pdo->query($query);
        $students = $stmt->fetchAll();

        // Format data: bulatkan rata-rata nilai, tentukan kelulusan
        $formattedStudents = [];
        foreach ($students as $student) {
            $avgGrade = $student['avg_grade'] !== null ? round((float)$student['avg_grade'], 1) : null;
            
            // Status Kelulusan
            $passStatus = 'Belum Ada Nilai';
            if ($avgGrade !== null) {
                $passStatus = ($avgGrade >= 70) ? 'LULUS' : 'BELUM LULUS';
            }

            $formattedStudents[] = [
                'id' => (int)$student['id'],
                'full_name' => $student['full_name'],
                'email' => $student['email'],
                'eco_points' => (int)$student['eco_points'],
                'streak' => (int)$student['streak'],
                'avatar_url' => $student['avatar_url'],
                'total_submissions' => (int)$student['total_submissions'],
                'avg_grade' => $avgGrade,
                'status' => $passStatus
            ];
        }

        sendJson([
            'success' => true,
            'students' => $formattedStudents
        ]);

    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengambil data kemajuan siswa: ' . $e->getMessage()
        ], 500);
    }
} else {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan GET.'
    ], 405);
}
