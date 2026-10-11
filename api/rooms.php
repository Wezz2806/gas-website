<?php
// api/rooms.php

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$userId = requireAuth();

$action = isset($_GET['action']) ? trim($_GET['action']) : '';

if ($method === 'GET') {
    if ($action === 'my_rooms' || $action === '') {
        try {
            // Ambil daftar kelas yang telah diikuti user
            // Jika admin, ambil semua kelas
            $isAdmin = isset($_SESSION['user']) && $_SESSION['user']['role'] === 'admin';
            
            if ($isAdmin) {
                $stmt = $pdo->query("
                    SELECT r.*, 
                           u.full_name as creator_name,
                           (SELECT COUNT(*) FROM room_members rm WHERE rm.room_id = r.id) as members_count,
                           1 as is_member
                    FROM rooms r
                    LEFT JOIN users u ON r.created_by = u.id
                    ORDER BY r.created_at DESC
                ");
                $rooms = $stmt->fetchAll();
            } else {
                $stmt = $pdo->prepare("
                    SELECT r.*, 
                           u.full_name as creator_name,
                           (SELECT COUNT(*) FROM room_members rm2 WHERE rm2.room_id = r.id) as members_count,
                           1 as is_member,
                           rm.joined_at
                    FROM rooms r
                    JOIN room_members rm ON r.id = rm.room_id AND rm.user_id = :user_id
                    LEFT JOIN users u ON r.created_by = u.id
                    WHERE r.is_active = 1
                    ORDER BY rm.joined_at DESC
                ");
                $stmt->execute(['user_id' => $userId]);
                $rooms = $stmt->fetchAll();
            }

            sendJson([
                'success' => true,
                'rooms' => $rooms
            ]);
        } catch (PDOException $e) {
            error_log('my_rooms error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal mengambil daftar kelas.'], 500);
        }
    }

    if ($action === 'detail') {
        $roomId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($roomId <= 0) {
            sendJson(['success' => false, 'message' => 'ID kelas tidak valid.'], 400);
        }

        try {
            $stmt = $pdo->prepare("
                SELECT r.*, 
                       u.full_name as creator_name,
                       (SELECT COUNT(*) FROM room_members rm WHERE rm.room_id = r.id) as members_count,
                       EXISTS(SELECT 1 FROM room_members rm2 WHERE rm2.room_id = r.id AND rm2.user_id = :user_id) as is_member
                FROM rooms r
                LEFT JOIN users u ON r.created_by = u.id
                WHERE r.id = :room_id
            ");
            $stmt->execute(['room_id' => $roomId, 'user_id' => $userId]);
            $room = $stmt->fetch();

            if (!$room) {
                sendJson(['success' => false, 'message' => 'Kelas tidak ditemukan.'], 404);
            }

            // Jika bukan admin dan belum join, tidak diizinkan lihat detail
            $isAdmin = isset($_SESSION['user']) && $_SESSION['user']['role'] === 'admin';
            if (!$isAdmin && !$room['is_member']) {
                sendJson(['success' => false, 'message' => 'Anda belum bergabung dengan kelas ini.'], 403);
            }

            sendJson([
                'success' => true,
                'room' => $room
            ]);
        } catch (PDOException $e) {
            error_log('room detail error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal mengambil detail kelas.'], 500);
        }
    }

    if ($action === 'leaderboard') {
        $roomId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($roomId <= 0) {
            sendJson(['success' => false, 'message' => 'ID kelas tidak valid.'], 400);
        }

        try {
            // Ambil data murid di kelas ini berurutan berdasarkan eco_points
            $stmt = $pdo->prepare("
                SELECT u.id, u.full_name, u.avatar_url, u.eco_points, u.streak
                FROM users u
                JOIN room_members rm ON u.id = rm.user_id
                WHERE rm.room_id = :room_id AND u.role = 'student'
                ORDER BY u.eco_points DESC, u.streak DESC
                LIMIT 50
            ");
            $stmt->execute(['room_id' => $roomId]);
            $leaderboard = $stmt->fetchAll();

            sendJson([
                'success' => true,
                'leaderboard' => $leaderboard
            ]);
        } catch (PDOException $e) {
            error_log('room leaderboard error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal mengambil papan peringkat.'], 500);
        }
    }
} elseif ($method === 'POST') {
    $body = getRequestBody();
    $postAction = isset($body['action']) ? trim($body['action']) : $action;

    if ($postAction === 'join') {
        $roomKey = isset($body['room_key']) ? trim($body['room_key']) : '';
        if (empty($roomKey)) {
            sendJson(['success' => false, 'message' => 'Kunci kelas wajib diisi.'], 400);
        }

        try {
            // Cari room berdasarkan room_key (case-insensitive)
            $stmt = $pdo->prepare("SELECT * FROM rooms WHERE UPPER(room_key) = UPPER(:room_key) AND is_active = 1 LIMIT 1");
            $stmt->execute(['room_key' => $roomKey]);
            $room = $stmt->fetch();

            if (!$room) {
                sendJson(['success' => false, 'message' => 'Kunci kelas tidak valid atau kelas tidak aktif.'], 404);
            }

            // Cek apakah sudah bergabung
            $checkMember = $pdo->prepare("SELECT id FROM room_members WHERE room_id = :room_id AND user_id = :user_id");
            $checkMember->execute(['room_id' => $room['id'], 'user_id' => $userId]);
            if ($checkMember->fetch()) {
                sendJson([
                    'success' => true,
                    'message' => 'Anda sudah terdaftar di kelas ini.',
                    'room' => $room
                ]);
            }

            // Gabung ke kelas
            $insert = $pdo->prepare("INSERT INTO room_members (room_id, user_id) VALUES (:room_id, :user_id)");
            $insert->execute(['room_id' => $room['id'], 'user_id' => $userId]);

            sendJson([
                'success' => true,
                'message' => 'Berhasil bergabung dengan kelas ' . $room['name'] . '!',
                'room' => $room
            ]);
        } catch (PDOException $e) {
            error_log('join room error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal bergabung ke kelas.'], 500);
        }
    }

    if ($postAction === 'leave') {
        $roomId = isset($body['room_id']) ? (int)$body['room_id'] : 0;
        if ($roomId <= 0) {
            sendJson(['success' => false, 'message' => 'ID kelas tidak valid.'], 400);
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM room_members WHERE room_id = :room_id AND user_id = :user_id");
            $stmt->execute(['room_id' => $roomId, 'user_id' => $userId]);

            sendJson([
                'success' => true,
                'message' => 'Anda telah keluar dari kelas.'
            ]);
        } catch (PDOException $e) {
            error_log('leave room error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal keluar dari kelas.'], 500);
        }
    }
}

sendJson(['success' => false, 'message' => 'Aksi tidak dikenal.'], 400);
