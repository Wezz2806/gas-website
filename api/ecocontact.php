<?php
// api/ecocontact.php

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM ecocontact_members ORDER BY sort_order ASC, id ASC");
        $members = $stmt->fetchAll();
        sendJson([
            'success' => true,
            'members' => $members
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengambil data kontak: ' . $e->getMessage()
        ], 500);
    }
} elseif ($method === 'POST') {
    // PROTEKSI ADMIN
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        sendJson([
            'success' => false,
            'message' => 'Akses ditolak. Hanya Administrator yang dapat mengedit EcoContact.'
        ], 403);
    }

    $body = getRequestBody();
    $action = isset($body['action']) ? $body['action'] : '';

    // Aksi hapus kontak
    if ($action === 'delete') {
        $id = isset($body['id']) ? (int)$body['id'] : null;
        if (!$id) {
            sendJson([
                'success' => false,
                'message' => 'ID kontak wajib disertakan untuk menghapus.'
            ], 400);
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM ecocontact_members WHERE id = :id");
            $stmt->execute(['id' => $id]);
            sendJson([
                'success' => true,
                'message' => 'Kontak berhasil dihapus.'
            ]);
        } catch (PDOException $e) {
            sendJson([
                'success' => false,
                'message' => 'Gagal menghapus kontak: ' . $e->getMessage()
            ], 500);
        }
    } else {
        // Tambah atau Edit kontak
        $id = isset($body['id']) ? (int)$body['id'] : null;
        $name = isset($body['name']) ? trim($body['name']) : '';
        $role = isset($body['role']) ? trim($body['role']) : '';
        $program = isset($body['program']) ? trim($body['program']) : '';
        $instansi = isset($body['instansi']) ? trim($body['instansi']) : '';
        $email = isset($body['email']) ? trim($body['email']) : '';
        $phone = isset($body['phone']) ? trim($body['phone']) : '';
        $office_hours = isset($body['office_hours']) ? trim($body['office_hours']) : '';
        $avatar = isset($body['avatar']) ? trim($body['avatar']) : '';
        $sort_order = isset($body['sort_order']) ? (int)$body['sort_order'] : 0;

        if (empty($name) || empty($role) || empty($instansi)) {
            sendJson([
                'success' => false,
                'message' => 'Nama lengkap, peran/posisi, dan nama instansi wajib diisi.'
            ], 400);
        }

        try {
            if ($id) {
                // Update kontak
                $stmt = $pdo->prepare("
                    UPDATE ecocontact_members 
                    SET name = :name, role = :role, program = :program, instansi = :instansi, 
                        email = :email, phone = :phone, office_hours = :office_hours, avatar = :avatar, sort_order = :sort_order
                    WHERE id = :id
                ");
                $stmt->execute([
                    'name' => $name,
                    'role' => $role,
                    'program' => $program,
                    'instansi' => $instansi,
                    'email' => $email,
                    'phone' => $phone,
                    'office_hours' => $office_hours,
                    'avatar' => $avatar,
                    'sort_order' => $sort_order,
                    'id' => $id
                ]);
                sendJson([
                    'success' => true,
                    'message' => 'Data kontak tim berhasil diperbarui.'
                ]);
            } else {
                // Tambah kontak baru
                $stmt = $pdo->prepare("
                    INSERT INTO ecocontact_members (name, role, program, instansi, email, phone, office_hours, avatar, sort_order)
                    VALUES (:name, :role, :program, :instansi, :email, :phone, :office_hours, :avatar, :sort_order)
                ");
                $stmt->execute([
                    'name' => $name,
                    'role' => $role,
                    'program' => $program,
                    'instansi' => $instansi,
                    'email' => $email,
                    'phone' => $phone,
                    'office_hours' => $office_hours,
                    'avatar' => $avatar,
                    'sort_order' => $sort_order
                ]);
                sendJson([
                    'success' => true,
                    'message' => 'Kontak tim baru berhasil ditambahkan.'
                ]);
            }
        } catch (PDOException $e) {
            sendJson([
                'success' => false,
                'message' => 'Gagal memproses data kontak: ' . $e->getMessage()
            ], 500);
        }
    }
} elseif ($method === 'DELETE') {
    // PROTEKSI ADMIN
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        sendJson([
            'success' => false,
            'message' => 'Akses ditolak.'
        ], 403);
    }

    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if (!$id) {
        sendJson([
            'success' => false,
            'message' => 'ID kontak tidak valid.'
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM ecocontact_members WHERE id = :id");
        $stmt->execute(['id' => $id]);
        sendJson([
            'success' => true,
            'message' => 'Kontak berhasil dihapus.'
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal menghapus kontak: ' . $e->getMessage()
        ], 500);
    }
} else {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan.'
    ], 405);
}
