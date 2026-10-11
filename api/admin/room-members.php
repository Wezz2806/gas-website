<?php
// api/admin/room-members.php

require_once '../config.php';

// Proteksi Sesi & Akses Admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Endpoint ini hanya untuk Administrator.'
    ], 403);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;
    if ($roomId <= 0) {
        sendJson(['success' => false, 'message' => 'ID kelas wajib diberikan.'], 400);
    }

    try {
        $stmt = $pdo->prepare("
            SELECT u.id, u.full_name, u.email, u.avatar_url, rm.joined_at
            FROM users u
            JOIN room_members rm ON u.id = rm.user_id
            WHERE rm.room_id = :room_id
            ORDER BY rm.joined_at DESC
        ");
        $stmt->execute(['room_id' => $roomId]);
        $members = $stmt->fetchAll();

        sendJson([
            'success' => true,
            'members' => $members
        ]);
    } catch (PDOException $e) {
        error_log('get room members error: ' . $e->getMessage());
        sendJson(['success' => false, 'message' => 'Gagal mengambil data murid.'], 500);
    }
} elseif ($method === 'POST') {
    $body = getRequestBody();
    $action = isset($body['action']) ? trim($body['action']) : '';
    $roomId = isset($body['room_id']) ? (int)$body['room_id'] : 0;
    $userId = isset($body['user_id']) ? (int)$body['user_id'] : 0;

    if ($roomId <= 0 || $userId <= 0) {
        sendJson(['success' => false, 'message' => 'ID kelas dan ID user wajib diisi.'], 400);
    }

    if ($action === 'remove') {
        try {
            $stmt = $pdo->prepare("DELETE FROM room_members WHERE room_id = :room_id AND user_id = :user_id");
            $stmt->execute(['room_id' => $roomId, 'user_id' => $userId]);

            sendJson([
                'success' => true,
                'message' => 'Murid berhasil dikeluarkan dari kelas.'
            ]);
        } catch (PDOException $e) {
            error_log('remove room member error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal mengeluarkan murid.'], 500);
        }
    }
}

sendJson(['success' => false, 'message' => 'Aksi tidak valid.'], 400);
