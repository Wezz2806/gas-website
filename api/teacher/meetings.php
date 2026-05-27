<?php
// api/teacher/meetings.php

require_once '../config.php';

// Pastikan session aktif
if (!isset($_SESSION['user'])) {
    sendJson([
        'success' => false,
        'message' => 'Sesi tidak aktif. Silakan login.'
    ], 401);
}

$user_role = $_SESSION['user']['role'];
$user_id = $_SESSION['user']['id'];
$method = $_SERVER['REQUEST_METHOD'];

// Handle GET (Bisa diakses guru dan siswa)
if ($method === 'GET') {
    try {
        // Cek apakah tabel meetings kosong, jika kosong auto-populate dengan default
        $countStmt = $pdo->query("SELECT COUNT(*) FROM meetings");
        $count = $countStmt->fetchColumn();

        if ($count == 0) {
            $defaultMeetings = [
                ['meeting_1', 1, 'Pengenalan Ekoenzim', 'Pengenalan dasar konsep kimia organik fermentasi sirkular.', 'groups', 'completed', $user_id],
                ['meeting_2', 2, 'Penyusunan Reaktor Fermentasi', 'Langkah pencampuran molase (gula merah), limbah kulit buah, dan air dengan rasio 1:3:10.', 'science', 'ongoing', $user_id],
                ['meeting_3', 3, 'Uji Kualitas Organoleptik', 'Pengamatan aroma asam segar, warna kecoklatan, dan pembentukan jamur Oospora.', 'biotech', 'scheduled', $user_id],
                ['meeting_4', 4, 'Penyaringan & Pengemasan Produk', 'Proses pemisahan cairan enzim dari ampas organik kasar serta analisis pH akhir.', 'inventory', 'scheduled', $user_id]
            ];

            $insertStmt = $pdo->prepare("INSERT INTO meetings (id, number, title, description, icon, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
            foreach ($defaultMeetings as $m) {
                $insertStmt->execute($m);
            }
        }

        // Fetch meetings beserta hitungan LKM siswa dan materi guru
        $query = "
            SELECT m.*, 
                   (SELECT COUNT(*) FROM student_submissions s WHERE s.meeting_id = m.id) as submissions_count,
                   (SELECT COUNT(*) FROM student_submissions s WHERE s.meeting_id = m.id AND s.status = 'pending') as pending_count,
                   (SELECT filename FROM teacher_materials t WHERE t.meeting_id = m.id LIMIT 1) as material_file,
                   (SELECT original_name FROM teacher_materials t WHERE t.meeting_id = m.id LIMIT 1) as material_original_name
            FROM meetings m
            ORDER BY m.number ASC
        ";
        $stmt = $pdo->query($query);
        $meetings = $stmt->fetchAll();

        sendJson([
            'success' => true,
            'meetings' => $meetings
        ]);

    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengambil data meeting: ' . $e->getMessage()
        ], 500);
    }
}

// Proteksi Tambahan untuk POST/PUT/DELETE: Hanya Guru/Admin
if ($user_role !== 'teacher' && $user_role !== 'admin') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Tindakan ini hanya boleh dilakukan oleh Guru.'
    ], 403);
}

// Handle POST: Tambah Meeting Baru
if ($method === 'POST') {
    $data = getRequestBody();

    if (empty($data['id']) || empty($data['title']) || empty($data['number'])) {
        sendJson([
            'success' => false,
            'message' => 'ID, Nomor Pertemuan, dan Judul wajib diisi.'
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO meetings (id, number, title, description, icon, status, created_by) 
            VALUES (:id, :number, :title, :description, :icon, :status, :created_by)
        ");
        $stmt->execute([
            'id' => $data['id'],
            'number' => (int)$data['number'],
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'icon' => $data['icon'] ?? 'science',
            'status' => $data['status'] ?? 'scheduled',
            'created_by' => $user_id
        ]);

        sendJson([
            'success' => true,
            'message' => 'Pertemuan baru berhasil ditambahkan.'
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal menambahkan pertemuan: ' . $e->getMessage()
        ], 500);
    }
}

// Handle PUT: Update Status / Data Meeting
if ($method === 'PUT') {
    $data = getRequestBody();

    if (empty($data['id'])) {
        sendJson([
            'success' => false,
            'message' => 'ID Pertemuan tidak boleh kosong.'
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE meetings 
            SET number = :number, 
                title = :title, 
                description = :description, 
                icon = :icon, 
                status = :status 
            WHERE id = :id
        ");
        $stmt->execute([
            'id' => $data['id'],
            'number' => (int)$data['number'],
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'icon' => $data['icon'] ?? 'science',
            'status' => $data['status'] ?? 'scheduled'
        ]);

        sendJson([
            'success' => true,
            'message' => 'Pertemuan berhasil diperbarui.'
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal memperbarui pertemuan: ' . $e->getMessage()
        ], 500);
    }
}

// Handle DELETE: Hapus Meeting
if ($method === 'DELETE') {
    $data = getRequestBody();

    if (empty($data['id'])) {
        sendJson([
            'success' => false,
            'message' => 'ID Pertemuan tidak boleh kosong.'
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM meetings WHERE id = :id");
        $stmt->execute(['id' => $data['id']]);

        sendJson([
            'success' => true,
            'message' => 'Pertemuan berhasil dihapus.'
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal menghapus pertemuan: ' . $e->getMessage()
        ], 500);
    }
}
