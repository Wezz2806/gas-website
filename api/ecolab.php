<?php
// api/ecolab.php

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = isset($_GET['action']) ? trim($_GET['action']) : '';

    if ($action === 'get_submissions') {
        // HANYA ADMIN YANG BISA MELIHAT SUBMISSIONS MURID
        if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
            sendJson([
                'success' => false,
                'message' => 'Akses ditolak. Anda tidak memiliki wewenang.'
            ], 403);
        }

        try {
            $stmt = $pdo->query("
                SELECT ss.id, ss.meeting_id, ss.filename, ss.original_name, ss.status, ss.submitted_at, ss.grade,
                       u.full_name as student_name, u.email as student_email, em.title as meeting_title
                FROM student_submissions ss
                JOIN users u ON ss.student_id = u.id
                LEFT JOIN ecolab_meetings em ON ss.meeting_id = em.id
                ORDER BY ss.submitted_at DESC
            ");
            $submissions = $stmt->fetchAll();
            sendJson([
                'success' => true,
                'submissions' => $submissions
            ]);
        } catch (PDOException $e) {
            sendJson([
                'success' => false,
                'message' => 'Gagal mengambil data pengumpulan LKM: ' . $e->getMessage()
            ], 500);
        }
        exit;
    }

    // Default: Ambil list meetings/materi LKM untuk murid/umum
    try {
        $stmt = $pdo->query("SELECT * FROM ecolab_meetings ORDER BY number ASC");
        $meetings = $stmt->fetchAll();
        sendJson([
            'success' => true,
            'meetings' => $meetings
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengambil data materi LKM: ' . $e->getMessage()
        ], 500);
    }
} elseif ($method === 'POST') {
    // PROTEKSI ADMIN
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        sendJson([
            'success' => false,
            'message' => 'Akses ditolak. Hanya Administrator yang dapat mengubah data EcoLab.'
        ], 403);
    }

    $body = getRequestBody();
    $action = isset($body['action']) ? trim($body['action']) : '';

    // Beri Nilai / Grading LKM Murid
    if ($action === 'grade_submission') {
        $submission_id = isset($body['id']) ? (int)$body['id'] : 0;
        $grade = isset($body['grade']) && $body['grade'] !== '' ? (int)$body['grade'] : null;
        if ($submission_id <= 0) {
            sendJson([
                'success' => false,
                'message' => 'ID Pengumpulan tidak valid.'
            ], 400);
        }
        try {
            $stmt = $pdo->prepare("
                UPDATE student_submissions 
                SET grade = :grade, status = 'graded', graded_at = CURRENT_TIMESTAMP
                WHERE id = :id
            ");
            $stmt->execute([
                'grade' => $grade,
                'id' => $submission_id
            ]);
            sendJson([
                'success' => true,
                'message' => 'Nilai LKM berhasil disimpan.'
            ]);
        } catch (PDOException $e) {
            sendJson([
                'success' => false,
                'message' => 'Gagal menyimpan nilai LKM: ' . $e->getMessage()
            ], 500);
        }
        exit;
    }

    // Hapus Materi LKM
    if ($action === 'delete') {
        $id = isset($body['id']) ? trim($body['id']) : '';
        if (empty($id)) {
            sendJson([
                'success' => false,
                'message' => 'ID materi wajib diisi untuk menghapus.'
            ], 400);
        }
        try {
            $stmt = $pdo->prepare("DELETE FROM ecolab_meetings WHERE id = :id");
            $stmt->execute(['id' => $id]);
            sendJson([
                'success' => true,
                'message' => 'Materi LKM berhasil dihapus.'
            ]);
        } catch (PDOException $e) {
            sendJson([
                'success' => false,
                'message' => 'Gagal menghapus materi LKM: ' . $e->getMessage()
            ], 500);
        }
        exit;
    }

    // Aksi hapus berkas LKM yang diunggah murid
    if ($action === 'delete_submission') {
        $submission_id = isset($body['id']) ? (int)$body['id'] : 0;
        if ($submission_id <= 0) {
            sendJson([
                'success' => false,
                'message' => 'ID Pengumpulan tidak valid.'
            ], 400);
        }
        try {
            // Ambil nama file untuk dihapus secara fisik
            $stmtFile = $pdo->prepare("SELECT filename FROM student_submissions WHERE id = :id");
            $stmtFile->execute(['id' => $submission_id]);
            $sub = $stmtFile->fetch();

            if ($sub) {
                $filepath = dirname(__DIR__) . '/uploads/submissions/' . $sub['filename'];
                if (file_exists($filepath)) {
                    @unlink($filepath);
                }
                $stmtDel = $pdo->prepare("DELETE FROM student_submissions WHERE id = :id");
                $stmtDel->execute(['id' => $submission_id]);
                sendJson([
                    'success' => true,
                    'message' => 'Berkas pengumpulan murid berhasil dihapus.'
                ]);
            } else {
                sendJson([
                    'success' => false,
                    'message' => 'Data pengumpulan tidak ditemukan.'
                ], 404);
            }
        } catch (PDOException $e) {
            sendJson([
                'success' => false,
                'message' => 'Gagal menghapus berkas LKM murid: ' . $e->getMessage()
            ], 500);
        }
        exit;
    }

    // Tambah / Edit Materi LKM
    $id = isset($body['id']) ? trim($body['id']) : '';
    $number = isset($body['number']) ? (int)$body['number'] : 1;
    $title = isset($body['title']) ? trim($body['title']) : '';
    $description = isset($body['description']) ? trim($body['description']) : '';
    $icon = isset($body['icon']) ? trim($body['icon']) : 'science';
    $status = isset($body['status']) ? trim($body['status']) : 'scheduled';
    $embed_url = isset($body['embed_url']) ? trim($body['embed_url']) : '';
    $download_url = isset($body['download_url']) ? trim($body['download_url']) : '';

    if (empty($id) || empty($title) || $number <= 0) {
        sendJson([
            'success' => false,
            'message' => 'ID, nomor pertemuan (LKM), dan judul wajib diisi.'
        ], 400);
    }

    try {
        // Cek keberadaan
        $stmtCheck = $pdo->prepare("SELECT id FROM ecolab_meetings WHERE id = :id");
        $stmtCheck->execute(['id' => $id]);
        $exists = $stmtCheck->fetch();

        if ($exists) {
            $stmt = $pdo->prepare("
                UPDATE ecolab_meetings 
                SET number = :number, title = :title, description = :description, 
                    icon = :icon, status = :status, embed_url = :embed_url, download_url = :download_url
                WHERE id = :id
            ");
            $stmt->execute([
                'number' => $number,
                'title' => $title,
                'description' => $description,
                'icon' => $icon,
                'status' => $status,
                'embed_url' => $embed_url,
                'download_url' => $download_url,
                'id' => $id
            ]);
            sendJson([
                'success' => true,
                'message' => 'Materi LKM berhasil diperbarui.'
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO ecolab_meetings (id, number, title, description, icon, status, embed_url, download_url) 
                VALUES (:id, :number, :title, :description, :icon, :status, :embed_url, :download_url)
            ");
            $stmt->execute([
                'id' => $id,
                'number' => $number,
                'title' => $title,
                'description' => $description,
                'icon' => $icon,
                'status' => $status,
                'embed_url' => $embed_url,
                'download_url' => $download_url
            ]);
            sendJson([
                'success' => true,
                'message' => 'Materi LKM baru berhasil ditambahkan.'
            ]);
        }
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal memproses data materi LKM: ' . $e->getMessage()
        ], 500);
    }
} else {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan.'
    ], 405);
}
