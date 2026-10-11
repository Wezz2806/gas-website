<?php
// api/sustainability-journal.php

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Authentication protection
if (!isset($_SESSION['user'])) {
    sendJson([
        'success' => false,
        'message' => 'Silakan login terlebih dahulu.'
    ], 401);
}

$currentUser = $_SESSION['user'];

if ($method === 'GET') {
    $action = isset($_GET['action']) ? trim($_GET['action']) : '';

    if ($action === 'get_students') {
        // ADMIN ONLY: get list of students who submitted journals
        if ($currentUser['role'] !== 'admin') {
            sendJson([
                'success' => false,
                'message' => 'Akses ditolak.'
            ], 403);
        }

        try {
            $roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;
            if ($roomId > 0) {
                $stmt = $pdo->prepare("
                    SELECT u.id, u.full_name AS name, u.email, MAX(j.updated_at) as last_updated
                    FROM users u
                    JOIN room_members rm ON u.id = rm.user_id AND rm.room_id = :room_id
                    JOIN sustainability_journals j ON u.id = j.student_id
                    WHERE u.role = 'student'
                    GROUP BY u.id, u.full_name, u.email
                    ORDER BY last_updated DESC
                ");
                $stmt->execute(['room_id' => $roomId]);
            } else {
                $stmt = $pdo->query("
                    SELECT u.id, u.full_name AS name, u.email, MAX(j.updated_at) as last_updated
                    FROM users u
                    JOIN sustainability_journals j ON u.id = j.student_id
                    WHERE u.role = 'student'
                    GROUP BY u.id, u.full_name, u.email
                    ORDER BY last_updated DESC
                ");
            }
            $students = $stmt->fetchAll();
            sendJson([
                'success' => true,
                'students' => $students
            ]);
        } catch (PDOException $e) {
            sendJson([
                'success' => false,
                'message' => 'Gagal mengambil data murid: ' . $e->getMessage()
            ], 500);
        }
        exit;
    }

    // Default: Get journal data for a student
    $studentId = $currentUser['id'];
    if ($currentUser['role'] === 'admin' && isset($_GET['student_id'])) {
        $studentId = (int)$_GET['student_id'];
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM sustainability_journals WHERE student_id = :student_id ORDER BY row_index ASC");
        $stmt->execute(['student_id' => $studentId]);
        $rows = $stmt->fetchAll();

        // Standardize returning 12 rows
        $journal = [];
        for ($i = 0; $i < 12; $i++) {
            $found = null;
            foreach ($rows as $r) {
                if ((int)$r['row_index'] === $i) {
                    $found = $r;
                    break;
                }
            }
            if ($found) {
                $journal[] = [
                    'row_index' => (int)$found['row_index'],
                    'tanggal' => $found['tanggal'] ?? '',
                    'warna' => $found['warna'] ?? '',
                    'aroma' => $found['aroma'] ?? '',
                    'gas' => $found['gas'] ?? '',
                    'alasan' => $found['alasan'] ?? '',
                    'solusi' => $found['solusi'] ?? ''
                ];
            } else {
                $journal[] = [
                    'row_index' => $i,
                    'tanggal' => '',
                    'warna' => '',
                    'aroma' => '',
                    'gas' => '',
                    'alasan' => '',
                    'solusi' => ''
                ];
            }
        }

        sendJson([
            'success' => true,
            'journal' => $journal
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengambil data jurnal: ' . $e->getMessage()
        ], 500);
    }
} elseif ($method === 'POST') {
    // Only student role can save/update their own journal
    if ($currentUser['role'] !== 'student') {
        sendJson([
            'success' => false,
            'message' => 'Hanya murid yang dapat mengisi jurnal monitoring.'
        ], 403);
    }

    $body = getRequestBody();
    $journalData = $body['journal'] ?? [];

    if (!is_array($journalData)) {
        sendJson([
            'success' => false,
            'message' => 'Format data jurnal tidak valid.'
        ], 400);
    }

    $studentId = $currentUser['id'];

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("
            INSERT INTO sustainability_journals (student_id, row_index, tanggal, warna, aroma, gas, alasan, solusi)
            VALUES (:student_id, :row_index, :tanggal, :warna, :aroma, :gas, :alasan, :solusi)
            ON DUPLICATE KEY UPDATE
                tanggal = VALUES(tanggal),
                warna = VALUES(warna),
                aroma = VALUES(aroma),
                gas = VALUES(gas),
                alasan = VALUES(alasan),
                solusi = VALUES(solusi)
        ");

        foreach ($journalData as $row) {
            $rowIndex = (int)($row['row_index'] ?? 0);
            if ($rowIndex < 0 || $rowIndex > 11) {
                continue;
            }

            $stmt->execute([
                'student_id' => $studentId,
                'row_index' => $rowIndex,
                'tanggal' => $row['tanggal'] ?? '',
                'warna' => $row['warna'] ?? '',
                'aroma' => $row['aroma'] ?? '',
                'gas' => $row['gas'] ?? '',
                'alasan' => $row['alasan'] ?? '',
                'solusi' => $row['solusi'] ?? ''
            ]);
        }
        $pdo->commit();

        sendJson([
            'success' => true,
            'message' => 'Jurnal monitoring keberlanjutan berhasil disimpan.'
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        sendJson([
            'success' => false,
            'message' => 'Gagal menyimpan jurnal: ' . $e->getMessage()
        ], 500);
    }
} else {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan.'
    ], 405);
}
