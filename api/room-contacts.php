<?php
// api/room-contacts.php
// EcoContact per kelas. Anggota kelas dapat membaca; admin dapat mengelola (CRUD, urutan, salin dari kelas lain).

require_once 'config.php';

$method  = $_SERVER['REQUEST_METHOD'];
$userId  = requireAuth();
$isAdmin = isset($_SESSION['user']) && $_SESSION['user']['role'] === 'admin';

if ($method === 'GET') {
    $roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;
    if ($roomId <= 0) {
        sendJson(['success' => false, 'message' => 'room_id wajib diberikan.'], 400);
    }

    try {
        if (!$isAdmin) {
            $stmt = $pdo->prepare("SELECT 1 FROM room_members WHERE room_id = :r AND user_id = :u LIMIT 1");
            $stmt->execute(['r' => $roomId, 'u' => $userId]);
            if (!$stmt->fetchColumn()) {
                sendJson(['success' => false, 'message' => 'Anda bukan anggota kelas ini.'], 403);
            }
        }

        $stmt = $pdo->prepare("
            SELECT id, room_id, name, role, instansi, email, phone, office_hours, avatar_url, sort_order
            FROM room_contacts
            WHERE room_id = :room_id
            ORDER BY sort_order ASC, id ASC
        ");
        $stmt->execute(['room_id' => $roomId]);
        sendJson(['success' => true, 'contacts' => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        error_log('room-contacts GET error: ' . $e->getMessage());
        sendJson(['success' => false, 'message' => 'Gagal memuat kontak kelas.'], 500);
    }
}

if ($method === 'POST') {
    if (!$isAdmin) {
        sendJson(['success' => false, 'message' => 'Akses ditolak. Hanya admin yang dapat mengelola kontak.'], 403);
    }

    $body   = getRequestBody();
    $action = isset($body['action']) ? trim($body['action']) : '';
    $roomId = isset($body['room_id']) ? (int)$body['room_id'] : 0;

    if ($roomId <= 0) {
        sendJson(['success' => false, 'message' => 'ID kelas wajib diisi.'], 400);
    }

    try {
        if ($action === 'save') {
            $id        = isset($body['id']) ? (int)$body['id'] : 0;
            $name      = isset($body['name']) ? trim($body['name']) : '';
            $role      = isset($body['role']) ? trim($body['role']) : '';
            $instansi  = isset($body['instansi']) ? trim($body['instansi']) : '';
            $email     = isset($body['email']) ? trim($body['email']) : '';
            $phone     = isset($body['phone']) ? trim($body['phone']) : '';
            $hours     = isset($body['office_hours']) ? trim($body['office_hours']) : '';
            $avatar    = isset($body['avatar_url']) ? trim($body['avatar_url']) : '';
            $sortOrder = isset($body['sort_order']) ? (int)$body['sort_order'] : 0;

            if ($name === '') {
                sendJson(['success' => false, 'message' => 'Nama kontak wajib diisi.'], 400);
            }
            if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                sendJson(['success' => false, 'message' => 'Format email tidak valid.'], 400);
            }

            $params = [
                'room_id' => $roomId, 'name' => $name, 'role' => $role, 'instansi' => $instansi,
                'email' => $email, 'phone' => $phone, 'hours' => $hours, 'avatar' => $avatar,
                'sort_order' => $sortOrder
            ];

            if ($id > 0) {
                $params['id'] = $id;
                $stmt = $pdo->prepare("
                    UPDATE room_contacts
                    SET name = :name, role = :role, instansi = :instansi, email = :email, phone = :phone,
                        office_hours = :hours, avatar_url = :avatar, sort_order = :sort_order
                    WHERE id = :id AND room_id = :room_id
                ");
            } else {
                $stmt = $pdo->prepare("
                    INSERT INTO room_contacts (room_id, name, role, instansi, email, phone, office_hours, avatar_url, sort_order)
                    VALUES (:room_id, :name, :role, :instansi, :email, :phone, :hours, :avatar, :sort_order)
                ");
            }
            $stmt->execute($params);
            sendJson(['success' => true, 'message' => 'Kontak berhasil disimpan.']);
        }

        if ($action === 'delete') {
            $id = isset($body['id']) ? (int)$body['id'] : 0;
            $stmt = $pdo->prepare("DELETE FROM room_contacts WHERE id = :id AND room_id = :room_id");
            $stmt->execute(['id' => $id, 'room_id' => $roomId]);
            sendJson(['success' => true, 'message' => 'Kontak dihapus.']);
        }

        // Salin seluruh kontak dari kelas lain (menambahkan di akhir urutan)
        if ($action === 'copy_from') {
            $fromRoomId = isset($body['from_room_id']) ? (int)$body['from_room_id'] : 0;
            if ($fromRoomId <= 0 || $fromRoomId === $roomId) {
                sendJson(['success' => false, 'message' => 'Kelas sumber tidak valid.'], 400);
            }
            $maxOrder = (int)$pdo->query("SELECT COALESCE(MAX(sort_order), -1) FROM room_contacts WHERE room_id = " . $roomId)->fetchColumn();
            $stmt = $pdo->prepare("
                INSERT INTO room_contacts (room_id, name, role, instansi, email, phone, office_hours, avatar_url, sort_order)
                SELECT :room_id, name, role, instansi, email, phone, office_hours, avatar_url, sort_order + :offset
                FROM room_contacts WHERE room_id = :from_room_id
            ");
            $stmt->execute(['room_id' => $roomId, 'offset' => $maxOrder + 1, 'from_room_id' => $fromRoomId]);
            sendJson(['success' => true, 'message' => $stmt->rowCount() . ' kontak disalin.', 'copied' => $stmt->rowCount()]);
        }

        sendJson(['success' => false, 'message' => 'Aksi tidak dikenal.'], 400);
    } catch (PDOException $e) {
        error_log('room-contacts POST error: ' . $e->getMessage());
        sendJson(['success' => false, 'message' => 'Gagal memproses kontak.'], 500);
    }
}

sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan.'], 405);
