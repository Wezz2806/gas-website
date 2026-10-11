<?php
// api/room-content.php

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$userId = requireAuth();

$roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;
$type = isset($_GET['type']) ? trim($_GET['type']) : '';

if ($method === 'GET') {
    if ($roomId <= 0) {
        sendJson(['success' => false, 'message' => 'room_id wajib diberikan.'], 400);
    }

    if ($type === 'ecopedia') {
        try {
            $stmt = $pdo->prepare("
                SELECT id, room_id, title, category, cover_url, description, content, pdf_url, flip_url, sort_order
                FROM room_ecopedia
                WHERE room_id = :room_id
                ORDER BY sort_order ASC, id ASC
            ");
            $stmt->execute(['room_id' => $roomId]);
            $books = $stmt->fetchAll();

            // Jika belum ada materi khusus di kelas ini, ambil dari template default
            if (empty($books)) {
                $stmtDef = $pdo->query("SELECT id, title, category, cover_url, description, content, pdf_url, flip_url FROM ecopedia_books ORDER BY id ASC");
                $books = $stmtDef->fetchAll();
            }

            sendJson(['success' => true, 'books' => $books]);
        } catch (PDOException $e) {
            error_log('room ecopedia error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal mengambil materi buku kelas.'], 500);
        }
    }

    if ($type === 'meetings') {
        try {
            $stmt = $pdo->prepare("
                SELECT id, room_id, meeting_code, number, title, description, icon, status, embed_url, download_url
                FROM room_meetings
                WHERE room_id = :room_id
                ORDER BY number ASC
            ");
            $stmt->execute(['room_id' => $roomId]);
            $meetings = $stmt->fetchAll();

            // Jika belum ada pertemuan khusus, ambil dari template default
            if (empty($meetings)) {
                $stmtDef = $pdo->query("SELECT id as meeting_code, id, number, title, description, icon, status, embed_url, download_url FROM ecolab_meetings ORDER BY number ASC");
                $meetings = $stmtDef->fetchAll();
            }

            sendJson(['success' => true, 'meetings' => $meetings]);
        } catch (PDOException $e) {
            error_log('room meetings error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal mengambil pertemuan kelas.'], 500);
        }
    }
} elseif ($method === 'POST') {
    // Admin only
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        sendJson(['success' => false, 'message' => 'Akses ditolak.'], 403);
    }

    $body = getRequestBody();
    $action = isset($body['action']) ? trim($body['action']) : '';
    $roomId = isset($body['room_id']) ? (int)$body['room_id'] : 0;

    if ($roomId <= 0) {
        sendJson(['success' => false, 'message' => 'ID kelas wajib diisi.'], 400);
    }

    // ── ECOPEDIA CRUD ──
    if ($action === 'save_ecopedia') {
        $id = isset($body['id']) ? (int)$body['id'] : 0;
        $title = isset($body['title']) ? trim($body['title']) : '';
        $category = isset($body['category']) ? trim($body['category']) : 'Umum';
        $coverUrl = isset($body['cover_url']) ? trim($body['cover_url']) : '';
        $description = isset($body['description']) ? trim($body['description']) : '';
        $content = isset($body['content']) ? trim($body['content']) : '';
        $pdfUrl = isset($body['pdf_url']) ? trim($body['pdf_url']) : '#';
        $flipUrl = isset($body['flip_url']) ? trim($body['flip_url']) : '';
        $sortOrder = isset($body['sort_order']) ? (int)$body['sort_order'] : 0;

        if (empty($title)) {
            sendJson(['success' => false, 'message' => 'Judul buku wajib diisi.'], 400);
        }

        try {
            if ($id > 0) {
                $stmt = $pdo->prepare("
                    UPDATE room_ecopedia
                    SET title = :title, category = :category, cover_url = :cover_url,
                        description = :description, content = :content, pdf_url = :pdf_url,
                        flip_url = :flip_url, sort_order = :sort_order
                    WHERE id = :id AND room_id = :room_id
                ");
                $stmt->execute([
                    'title' => $title, 'category' => $category, 'cover_url' => $coverUrl,
                    'description' => $description, 'content' => $content, 'pdf_url' => $pdfUrl,
                    'flip_url' => $flipUrl, 'sort_order' => $sortOrder,
                    'id' => $id, 'room_id' => $roomId
                ]);
            } else {
                $stmt = $pdo->prepare("
                    INSERT INTO room_ecopedia (room_id, title, category, cover_url, description, content, pdf_url, flip_url, sort_order)
                    VALUES (:room_id, :title, :category, :cover_url, :description, :content, :pdf_url, :flip_url, :sort_order)
                ");
                $stmt->execute([
                    'room_id' => $roomId, 'title' => $title, 'category' => $category,
                    'cover_url' => $coverUrl, 'description' => $description,
                    'content' => $content, 'pdf_url' => $pdfUrl, 'flip_url' => $flipUrl,
                    'sort_order' => $sortOrder
                ]);
            }

            sendJson(['success' => true, 'message' => 'Materi EcoPedia kelas berhasil disimpan.']);
        } catch (PDOException $e) {
            error_log('save_ecopedia error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal menyimpan materi.'], 500);
        }
    }

    if ($action === 'delete_ecopedia') {
        $id = isset($body['id']) ? (int)$body['id'] : 0;
        try {
            $stmt = $pdo->prepare("DELETE FROM room_ecopedia WHERE id = :id AND room_id = :room_id");
            $stmt->execute(['id' => $id, 'room_id' => $roomId]);
            sendJson(['success' => true, 'message' => 'Materi berhasil dihapus.']);
        } catch (PDOException $e) {
            error_log('delete_ecopedia error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal menghapus materi.'], 500);
        }
    }

    // ── MEETINGS CRUD ──
    if ($action === 'save_meeting') {
        $id = isset($body['id']) ? (int)$body['id'] : 0;
        $meetingCode = isset($body['meeting_code']) ? trim($body['meeting_code']) : 'm1';
        $number = isset($body['number']) ? (int)$body['number'] : 1;
        $title = isset($body['title']) ? trim($body['title']) : '';
        $description = isset($body['description']) ? trim($body['description']) : '';
        $icon = isset($body['icon']) ? trim($body['icon']) : 'science';
        $status = isset($body['status']) ? trim($body['status']) : 'scheduled';
        $embedUrl = isset($body['embed_url']) ? trim($body['embed_url']) : '';
        $downloadUrl = isset($body['download_url']) ? trim($body['download_url']) : '';

        if (empty($title)) {
            sendJson(['success' => false, 'message' => 'Judul pertemuan wajib diisi.'], 400);
        }

        try {
            if ($id > 0) {
                $stmt = $pdo->prepare("
                    UPDATE room_meetings
                    SET meeting_code = :meeting_code, number = :number, title = :title,
                        description = :description, icon = :icon, status = :status,
                        embed_url = :embed_url, download_url = :download_url
                    WHERE id = :id AND room_id = :room_id
                ");
                $stmt->execute([
                    'meeting_code' => $meetingCode, 'number' => $number, 'title' => $title,
                    'description' => $description, 'icon' => $icon, 'status' => $status,
                    'embed_url' => $embedUrl, 'download_url' => $downloadUrl,
                    'id' => $id, 'room_id' => $roomId
                ]);
            } else {
                $stmt = $pdo->prepare("
                    INSERT INTO room_meetings (room_id, meeting_code, number, title, description, icon, status, embed_url, download_url)
                    VALUES (:room_id, :meeting_code, :number, :title, :description, :icon, :status, :embed_url, :download_url)
                ");
                $stmt->execute([
                    'room_id' => $roomId, 'meeting_code' => $meetingCode, 'number' => $number,
                    'title' => $title, 'description' => $description, 'icon' => $icon,
                    'status' => $status, 'embed_url' => $embedUrl, 'download_url' => $downloadUrl
                ]);
            }

            sendJson(['success' => true, 'message' => 'Pertemuan EcoLab kelas berhasil disimpan.']);
        } catch (PDOException $e) {
            error_log('save_meeting error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal menyimpan pertemuan.'], 500);
        }
    }

    if ($action === 'delete_meeting') {
        $id = isset($body['id']) ? (int)$body['id'] : 0;
        try {
            $stmt = $pdo->prepare("DELETE FROM room_meetings WHERE id = :id AND room_id = :room_id");
            $stmt->execute(['id' => $id, 'room_id' => $roomId]);
            sendJson(['success' => true, 'message' => 'Pertemuan berhasil dihapus.']);
        } catch (PDOException $e) {
            error_log('delete_meeting error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal menghapus pertemuan.'], 500);
        }
    }
}

sendJson(['success' => false, 'message' => 'Aksi tidak dikenal.'], 400);
