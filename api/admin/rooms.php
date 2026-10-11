<?php
// api/admin/rooms.php

require_once '../config.php';

// Proteksi Sesi & Akses Admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Endpoint ini hanya untuk Administrator.'
    ], 403);
}

$method = $_SERVER['REQUEST_METHOD'];
$adminId = (int)$_SESSION['user']['id'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("
            SELECT r.*, 
                   u.full_name as creator_name,
                   (SELECT COUNT(*) FROM room_members rm WHERE rm.room_id = r.id) as members_count,
                   (SELECT COUNT(*) FROM room_ecopedia re WHERE re.room_id = r.id) as materials_count,
                   (SELECT COUNT(*) FROM room_meetings rmt WHERE rmt.room_id = r.id) as meetings_count
            FROM rooms r
            LEFT JOIN users u ON r.created_by = u.id
            ORDER BY r.created_at DESC
        ");
        $rooms = $stmt->fetchAll();

        sendJson([
            'success' => true,
            'rooms' => $rooms
        ]);
    } catch (PDOException $e) {
        error_log('admin get rooms error: ' . $e->getMessage());
        sendJson(['success' => false, 'message' => 'Gagal mengambil data kelas.'], 500);
    }
} elseif ($method === 'POST') {
    $body = getRequestBody();
    $action = isset($body['action']) ? trim($body['action']) : 'create';

    if ($action === 'create') {
        $name = isset($body['name']) ? trim($body['name']) : '';
        $description = isset($body['description']) ? trim($body['description']) : '';
        $roomKey = isset($body['room_key']) ? trim($body['room_key']) : '';
        $coverImage = isset($body['cover_image']) ? trim($body['cover_image']) : '';
        $gamification = isset($body['gamification_enabled']) ? (int)$body['gamification_enabled'] : 0;

        if (empty($name) || empty($roomKey)) {
            sendJson(['success' => false, 'message' => 'Nama kelas dan kunci kelas wajib diisi.'], 400);
        }

        // Cek keunikan kunci kelas
        $checkKey = $pdo->prepare("SELECT id FROM rooms WHERE UPPER(room_key) = UPPER(:key)");
        $checkKey->execute(['key' => $roomKey]);
        if ($checkKey->fetch()) {
            sendJson(['success' => false, 'message' => 'Kunci kelas tersebut sudah digunakan. Silakan gunakan kunci lain.'], 400);
        }

        if (empty($coverImage)) {
            $coverImage = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';
        }

        try {
            $stmt = $pdo->prepare("
                INSERT INTO rooms (name, description, room_key, cover_image, created_by, gamification_enabled, is_active)
                VALUES (:name, :description, :room_key, :cover_image, :created_by, :gamification_enabled, 1)
            ");
            $stmt->execute([
                'name' => $name,
                'description' => $description,
                'room_key' => $roomKey,
                'cover_image' => $coverImage,
                'created_by' => $adminId,
                'gamification_enabled' => $gamification ? 1 : 0
            ]);
            $newRoomId = (int)$pdo->lastInsertId();

            // Salin template materi & pertemuan default ke kelas baru
            $pdo->exec("
                INSERT INTO room_meetings (room_id, meeting_code, number, title, description, icon, status, embed_url, download_url)
                SELECT $newRoomId, id, number, title, description, icon, status, embed_url, download_url
                FROM ecolab_meetings
            ");

            $pdo->exec("
                INSERT INTO room_ecopedia (room_id, title, category, cover_url, description, content, pdf_url, flip_url, sort_order)
                SELECT $newRoomId, title, category, cover_url, description, content, pdf_url, flip_url, 0
                FROM ecopedia_books
            ");

            sendJson([
                'success' => true,
                'message' => 'Kelas berhasil dibuat.',
                'room_id' => $newRoomId
            ]);
        } catch (PDOException $e) {
            error_log('create room error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal membuat kelas: ' . $e->getMessage()], 500);
        }
    } elseif ($action === 'update') {
        $id = isset($body['id']) ? (int)$body['id'] : 0;
        $name = isset($body['name']) ? trim($body['name']) : '';
        $description = isset($body['description']) ? trim($body['description']) : '';
        $roomKey = isset($body['room_key']) ? trim($body['room_key']) : '';
        $coverImage = isset($body['cover_image']) ? trim($body['cover_image']) : '';
        $gamification = isset($body['gamification_enabled']) ? (int)$body['gamification_enabled'] : 0;
        $isActive = isset($body['is_active']) ? (int)$body['is_active'] : 1;

        if ($id <= 0 || empty($name) || empty($roomKey)) {
            sendJson(['success' => false, 'message' => 'ID, nama kelas, dan kunci kelas wajib diisi.'], 400);
        }

        // Cek keunikan kunci kelas untuk room lain
        $checkKey = $pdo->prepare("SELECT id FROM rooms WHERE UPPER(room_key) = UPPER(:key) AND id != :id");
        $checkKey->execute(['key' => $roomKey, 'id' => $id]);
        if ($checkKey->fetch()) {
            sendJson(['success' => false, 'message' => 'Kunci kelas tersebut sudah digunakan di kelas lain.'], 400);
        }

        try {
            $stmt = $pdo->prepare("
                UPDATE rooms 
                SET name = :name,
                    description = :description,
                    room_key = :room_key,
                    cover_image = :cover_image,
                    gamification_enabled = :gamification_enabled,
                    is_active = :is_active
                WHERE id = :id
            ");
            $stmt->execute([
                'name' => $name,
                'description' => $description,
                'room_key' => $roomKey,
                'cover_image' => $coverImage,
                'gamification_enabled' => $gamification ? 1 : 0,
                'is_active' => $isActive ? 1 : 0,
                'id' => $id
            ]);

            sendJson([
                'success' => true,
                'message' => 'Kelas berhasil diperbarui.'
            ]);
        } catch (PDOException $e) {
            error_log('update room error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal memperbarui kelas.'], 500);
        }
    } elseif ($action === 'delete') {
        $id = isset($body['id']) ? (int)$body['id'] : 0;
        if ($id <= 0) {
            sendJson(['success' => false, 'message' => 'ID kelas wajib diisi.'], 400);
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM rooms WHERE id = :id");
            $stmt->execute(['id' => $id]);

            sendJson([
                'success' => true,
                'message' => 'Kelas berhasil dihapus.'
            ]);
        } catch (PDOException $e) {
            error_log('delete room error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal menghapus kelas.'], 500);
        }
    }
}

sendJson(['success' => false, 'message' => 'Aksi tidak valid.'], 400);
