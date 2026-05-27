<?php
// api/teacher/grade-submission.php

require_once '../config.php';

// Pastikan hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan POST.'
    ], 405);
}

// Proteksi Sesi & Akses Guru
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Tindakan ini hanya boleh dilakukan oleh Guru.'
    ], 403);
}

$data = getRequestBody();
$submission_id = $data['submission_id'] ?? null;
$grade = isset($data['grade']) ? (int)$data['grade'] : null;
$comment = $data['teacher_comment'] ?? '';

if (empty($submission_id) || $grade === null) {
    sendJson([
        'success' => false,
        'message' => 'ID Pengumpulan (submission_id) dan Nilai (grade) wajib diisi.'
    ], 400);
}

if ($grade < 0 || $grade > 100) {
    sendJson([
        'success' => false,
        'message' => 'Nilai harus berkisar antara 0 hingga 100.'
    ], 400);
}

try {
    // 1. Ambil data submission lama untuk mendapatkan student_id dan mengecek status penilaiannya
    $checkStmt = $pdo->prepare("SELECT student_id, status FROM student_submissions WHERE id = :id");
    $checkStmt->execute(['id' => $submission_id]);
    $submission = $checkStmt->fetch();

    if (!$submission) {
        sendJson([
            'success' => false,
            'message' => 'Data pengumpulan tugas tidak ditemukan.'
        ], 404);
    }

    $student_id = $submission['student_id'];
    $is_already_graded = ($submission['status'] === 'graded');

    // 2. Mulai transaksi SQL agar update data dan penambahan poin berjalan atomik
    $pdo->beginTransaction();

    // 3. Update nilai dan komentar di student_submissions
    $gradeStmt = $pdo->prepare("
        UPDATE student_submissions 
        SET grade = :grade, 
            teacher_comment = :comment, 
            status = 'graded', 
            graded_at = CURRENT_TIMESTAMP 
        WHERE id = :id
    ");
    $gradeStmt->execute([
        'grade' => $grade,
        'comment' => $comment,
        'id' => $submission_id
    ]);

    // 4. Hitung bonus poin dan update poin siswa hanya jika belum pernah dinilai sebelumnya
    // Ini mencegah siswa menduplikasi klaim bonus poin dengan mengedit nilai berkali-kali
    $bonus_points = 0;
    if (!$is_already_graded) {
        if ($grade >= 90) {
            $bonus_points = 50;
        } else if ($grade >= 80) {
            $bonus_points = 30;
        } else if ($grade >= 70) {
            $bonus_points = 10;
        }

        if ($bonus_points > 0) {
            $pointsStmt = $pdo->prepare("UPDATE users SET eco_points = eco_points + :bonus WHERE id = :student_id");
            $pointsStmt->execute([
                'bonus' => $bonus_points,
                'student_id' => $student_id
            ]);
        }
    }

    $pdo->commit();

    sendJson([
        'success' => true,
        'message' => 'Nilai dan masukan tugas berhasil disimpan.' . ($bonus_points > 0 ? " Siswa mendapatkan bonus +$bonus_points Eco-Points!" : "")
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendJson([
        'success' => false,
        'message' => 'Gagal menyimpan nilai: ' . $e->getMessage()
    ], 500);
}
