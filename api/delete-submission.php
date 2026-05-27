<?php
// api/delete-submission.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan. Gunakan POST.'], 405);
}

$user_id = getAuthUserId();
if ($user_id === null) {
    sendJson(['success' => false, 'message' => 'Sesi tidak aktif. Silakan login terlebih dahulu.'], 401);
}

$data = getRequestBody();
$meeting_id = trim($data['meeting_id'] ?? '');

if (empty($meeting_id)) {
    sendJson(['success' => false, 'message' => 'ID Pertemuan (meeting_id) wajib diisi.'], 400);
}

try {
    // Get all file info for this meeting and student
    $stmt = $pdo->prepare("SELECT id, filename FROM student_submissions WHERE student_id = :student_id AND meeting_id = :meeting_id");
    $stmt->execute(['student_id' => $user_id, 'meeting_id' => $meeting_id]);
    $submissions = $stmt->fetchAll();

    if (empty($submissions)) {
        sendJson(['success' => false, 'message' => 'Pengumpulan tidak ditemukan.'], 404);
    }

    // Delete all physical files from disk
    foreach ($submissions as $submission) {
        $file_path = dirname(__DIR__) . '/uploads/submissions/' . $submission['filename'];
        if (file_exists($file_path)) {
            @unlink($file_path);
        }
    }

    // Delete all records from DB for this meeting and student
    $stmt = $pdo->prepare("DELETE FROM student_submissions WHERE student_id = :student_id AND meeting_id = :meeting_id");
    $stmt->execute(['student_id' => $user_id, 'meeting_id' => $meeting_id]);

    sendJson(['success' => true, 'message' => 'Seluruh berkas pengumpulan berhasil dihapus dari database.']);
} catch (PDOException $e) {
    error_log('delete-submission.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat menghapus berkas pengumpulan.'], 500);
}
