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

    if ($roomId <= 0 && $action !== 'reset_ecochallenge_default' && $action !== 'apply_ecochallenge_to_all') {
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

    // ── ECOPEDIA BATCH (DEFAULT & TERAPKAN SEMUA KELAS) ──
    if ($action === 'reset_ecopedia_default') {
        try {
            $pdo->beginTransaction();
            $del = $pdo->prepare("DELETE FROM room_ecopedia WHERE room_id = :room_id");
            $del->execute(['room_id' => $roomId]);

            $ins = $pdo->prepare("
                INSERT INTO room_ecopedia (room_id, title, category, cover_url, description, content, pdf_url, flip_url, sort_order)
                SELECT :room_id, title, category, cover_url, description, content, pdf_url, flip_url, 0
                FROM ecopedia_books
                ORDER BY id ASC
            ");
            $ins->execute(['room_id' => $roomId]);
            $pdo->commit();

            sendJson(['success' => true, 'message' => 'Materi EcoPedia berhasil dikembalikan ke default kelas.']);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('reset_ecopedia_default error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal mengembalikan ke default: ' . $e->getMessage()], 500);
        }
    }

    if ($action === 'apply_ecopedia_to_all') {
        try {
            // Ambil daftar buku dari kelas sumber
            $stmt = $pdo->prepare("SELECT title, category, cover_url, description, content, pdf_url, flip_url, sort_order FROM room_ecopedia WHERE room_id = :room_id ORDER BY sort_order ASC, id ASC");
            $stmt->execute(['room_id' => $roomId]);
            $sourceBooks = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($sourceBooks)) {
                $stmtDef = $pdo->query("SELECT title, category, cover_url, description, content, pdf_url, flip_url, 0 as sort_order FROM ecopedia_books ORDER BY id ASC");
                $sourceBooks = $stmtDef->fetchAll(PDO::FETCH_ASSOC);
            }

            $allRooms = $pdo->query("SELECT id FROM rooms WHERE id != $roomId")->fetchAll(PDO::FETCH_COLUMN);

            $pdo->beginTransaction();
            if (!empty($allRooms)) {
                $inClause = implode(',', array_map('intval', $allRooms));
                $pdo->exec("DELETE FROM room_ecopedia WHERE room_id IN ($inClause)");

                $insStmt = $pdo->prepare("
                    INSERT INTO room_ecopedia (room_id, title, category, cover_url, description, content, pdf_url, flip_url, sort_order)
                    VALUES (:room_id, :title, :category, :cover_url, :description, :content, :pdf_url, :flip_url, :sort_order)
                ");

                foreach ($allRooms as $targetRoomId) {
                    foreach ($sourceBooks as $idx => $b) {
                        $insStmt->execute([
                            'room_id' => $targetRoomId,
                            'title' => $b['title'],
                            'category' => $b['category'] ?? 'Umum',
                            'cover_url' => $b['cover_url'] ?? '',
                            'description' => $b['description'] ?? '',
                            'content' => $b['content'] ?? '',
                            'pdf_url' => $b['pdf_url'] ?? '#',
                            'flip_url' => $b['flip_url'] ?? '',
                            'sort_order' => isset($b['sort_order']) ? (int)$b['sort_order'] : $idx
                        ]);
                    }
                }
            }
            $pdo->commit();

            sendJson(['success' => true, 'message' => 'Materi EcoPedia berhasil diterapkan pada semua kelas.']);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('apply_ecopedia_to_all error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal menerapkan ke semua kelas: ' . $e->getMessage()], 500);
        }
    }

    // ── MEETINGS / LKM BATCH (DEFAULT & TERAPKAN SEMUA KELAS) ──
    if ($action === 'reset_meetings_default') {
        try {
            $pdo->beginTransaction();
            $del = $pdo->prepare("DELETE FROM room_meetings WHERE room_id = :room_id");
            $del->execute(['room_id' => $roomId]);

            $ins = $pdo->prepare("
                INSERT INTO room_meetings (room_id, meeting_code, number, title, description, icon, status, embed_url, download_url)
                SELECT :room_id, id, number, title, description, icon, status, embed_url, download_url
                FROM ecolab_meetings
                ORDER BY number ASC
            ");
            $ins->execute(['room_id' => $roomId]);
            $pdo->commit();

            sendJson(['success' => true, 'message' => 'Modul pertemuan LKM berhasil dikembalikan ke default kelas.']);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('reset_meetings_default error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal mengembalikan ke default: ' . $e->getMessage()], 500);
        }
    }

    if ($action === 'apply_meetings_to_all') {
        try {
            $stmt = $pdo->prepare("SELECT meeting_code, number, title, description, icon, status, embed_url, download_url FROM room_meetings WHERE room_id = :room_id ORDER BY number ASC, id ASC");
            $stmt->execute(['room_id' => $roomId]);
            $sourceMeetings = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($sourceMeetings)) {
                $stmtDef = $pdo->query("SELECT id as meeting_code, number, title, description, icon, status, embed_url, download_url FROM ecolab_meetings ORDER BY number ASC");
                $sourceMeetings = $stmtDef->fetchAll(PDO::FETCH_ASSOC);
            }

            $allRooms = $pdo->query("SELECT id FROM rooms WHERE id != $roomId")->fetchAll(PDO::FETCH_COLUMN);

            $pdo->beginTransaction();
            if (!empty($allRooms)) {
                $inClause = implode(',', array_map('intval', $allRooms));
                $pdo->exec("DELETE FROM room_meetings WHERE room_id IN ($inClause)");

                $insStmt = $pdo->prepare("
                    INSERT INTO room_meetings (room_id, meeting_code, number, title, description, icon, status, embed_url, download_url)
                    VALUES (:room_id, :meeting_code, :number, :title, :description, :icon, :status, :embed_url, :download_url)
                ");

                foreach ($allRooms as $targetRoomId) {
                    foreach ($sourceMeetings as $m) {
                        $insStmt->execute([
                            'room_id' => $targetRoomId,
                            'meeting_code' => $m['meeting_code'] ?? ('m' . ($m['number'] ?? 1)),
                            'number' => $m['number'] ?? 1,
                            'title' => $m['title'] ?? '',
                            'description' => $m['description'] ?? '',
                            'icon' => $m['icon'] ?? 'science',
                            'status' => $m['status'] ?? 'scheduled',
                            'embed_url' => $m['embed_url'] ?? '',
                            'download_url' => $m['download_url'] ?? ''
                        ]);
                    }
                }
            }
            $pdo->commit();

            sendJson(['success' => true, 'message' => 'Modul pertemuan LKM berhasil diterapkan pada semua kelas.']);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('apply_meetings_to_all error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal menerapkan ke semua kelas: ' . $e->getMessage()], 500);
        }
    }

    // ── ECOCHALLENGE BATCH (DEFAULT & TERAPKAN SEMUA KELAS) ──
    if ($action === 'reset_ecochallenge_default') {
        try {
            $pdo->beginTransaction();
            if ($roomId > 0) {
                $pdo->prepare("DELETE FROM room_test_cases WHERE room_id = :room_id")->execute(['room_id' => $roomId]);
                $pdo->prepare("DELETE FROM room_survey_questions WHERE room_id = :room_id")->execute(['room_id' => $roomId]);

                $pdo->prepare("
                    INSERT INTO room_test_cases (room_id, case_number, title, content_json, questions_json)
                    SELECT :room_id, id, title, content_json, questions_json FROM test_cases ORDER BY id ASC
                ")->execute(['room_id' => $roomId]);

                $pdo->prepare("
                    INSERT INTO room_survey_questions (room_id, question_order, text, is_active)
                    SELECT :room_id, question_order, text, is_active FROM survey_questions WHERE is_active = 1 ORDER BY question_order ASC
                ")->execute(['room_id' => $roomId]);
            } else {
                // Global mode: delete all room custom overrides
                $pdo->exec("DELETE FROM room_test_cases");
                $pdo->exec("DELETE FROM room_survey_questions");
            }
            $pdo->commit();

            sendJson(['success' => true, 'message' => 'Modul EcoChallenge berhasil dikembalikan ke default kelas.']);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('reset_ecochallenge_default error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal mengembalikan ke default: ' . $e->getMessage()], 500);
        }
    }

    if ($action === 'apply_ecochallenge_to_all') {
        try {
            // Source cases
            $sourceCases = [];
            if ($roomId > 0) {
                $cStmt = $pdo->prepare("SELECT case_number, title, content_json, questions_json FROM room_test_cases WHERE room_id = :room_id ORDER BY case_number ASC");
                $cStmt->execute(['room_id' => $roomId]);
                $sourceCases = $cStmt->fetchAll(PDO::FETCH_ASSOC);
            }
            if (empty($sourceCases)) {
                $sourceCases = $pdo->query("SELECT id as case_number, title, content_json, questions_json FROM test_cases ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
            }

            // Source questions
            $sourceQuestions = [];
            if ($roomId > 0) {
                $qStmt = $pdo->prepare("SELECT question_order, text, is_active FROM room_survey_questions WHERE room_id = :room_id AND is_active = 1 ORDER BY question_order ASC");
                $qStmt->execute(['room_id' => $roomId]);
                $sourceQuestions = $qStmt->fetchAll(PDO::FETCH_ASSOC);
            }
            if (empty($sourceQuestions)) {
                $sourceQuestions = $pdo->query("SELECT question_order, text, is_active FROM survey_questions WHERE is_active = 1 ORDER BY question_order ASC")->fetchAll(PDO::FETCH_ASSOC);
            }

            $allRooms = $roomId > 0 
                ? $pdo->query("SELECT id FROM rooms WHERE id != $roomId")->fetchAll(PDO::FETCH_COLUMN)
                : $pdo->query("SELECT id FROM rooms")->fetchAll(PDO::FETCH_COLUMN);

            $pdo->beginTransaction();
            if (!empty($allRooms)) {
                $inClause = implode(',', array_map('intval', $allRooms));
                $pdo->exec("DELETE FROM room_test_cases WHERE room_id IN ($inClause)");
                $pdo->exec("DELETE FROM room_survey_questions WHERE room_id IN ($inClause)");

                $insCase = $pdo->prepare("INSERT INTO room_test_cases (room_id, case_number, title, content_json, questions_json) VALUES (?, ?, ?, ?, ?)");
                $insQ = $pdo->prepare("INSERT INTO room_survey_questions (room_id, question_order, text, is_active) VALUES (?, ?, ?, ?)");

                foreach ($allRooms as $targetRoomId) {
                    foreach ($sourceCases as $c) {
                        $insCase->execute([
                            $targetRoomId,
                            $c['case_number'],
                            $c['title'],
                            $c['content_json'],
                            $c['questions_json']
                        ]);
                    }
                    foreach ($sourceQuestions as $q) {
                        $insQ->execute([
                            $targetRoomId,
                            $q['question_order'],
                            $q['text'],
                            $q['is_active'] ?? 1
                        ]);
                    }
                }
            }
            $pdo->commit();

            sendJson(['success' => true, 'message' => 'Modul EcoChallenge berhasil diterapkan pada semua kelas.']);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log('apply_ecochallenge_to_all error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal menerapkan ke semua kelas: ' . $e->getMessage()], 500);
        }
    }
}

sendJson(['success' => false, 'message' => 'Aksi tidak dikenal.'], 400);
