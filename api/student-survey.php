<?php
// api/student-survey.php

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
        // ADMIN ONLY: get list of students who submitted surveys
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
                    SELECT u.id, u.full_name AS name, u.email, s.updated_at as last_updated, s.feedback, s.answers
                    FROM users u
                    JOIN room_members rm ON u.id = rm.user_id AND rm.room_id = :room_id
                    JOIN student_surveys s ON u.id = s.student_id
                    WHERE u.role = 'student'
                    ORDER BY last_updated DESC
                ");
                $stmt->execute(['room_id' => $roomId]);
            } else {
                $stmt = $pdo->query("
                    SELECT u.id, u.full_name AS name, u.email, s.updated_at as last_updated, s.feedback, s.answers
                    FROM users u
                    JOIN student_surveys s ON u.id = s.student_id
                    WHERE u.role = 'student'
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
                'message' => 'Gagal mengambil data survei murid: ' . $e->getMessage()
            ], 500);
        }
        exit;
    }

    // Default: Get survey data for a student
    $studentId = $currentUser['id'];
    if ($currentUser['role'] === 'admin' && isset($_GET['student_id'])) {
        $studentId = (int)$_GET['student_id'];
    }

    $roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;

    try {
        if ($roomId > 0) {
            $stmt = $pdo->prepare("SELECT * FROM student_surveys WHERE student_id = :student_id AND (room_id = :room_id OR room_id IS NULL) ORDER BY (room_id = :room_id) DESC LIMIT 1");
            $stmt->execute(['student_id' => $studentId, 'room_id' => $roomId]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM student_surveys WHERE student_id = :student_id LIMIT 1");
            $stmt->execute(['student_id' => $studentId]);
        }
        $survey = $stmt->fetch();

        if ($survey) {
            sendJson([
                'success' => true,
                'survey' => [
                    'answers' => json_decode($survey['answers'], true) ?: new stdClass(),
                    'feedback' => $survey['feedback'] ?? ''
                ]
            ]);
        } else {
            sendJson([
                'success' => true,
                'survey' => null
            ]);
        }
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengambil data survei: ' . $e->getMessage()
        ], 500);
    }
} elseif ($method === 'POST') {
    $body = getRequestBody();
    $action = isset($body['action']) ? trim($body['action']) : '';

    // ADMIN: Hapus data angket satu murid
    if ($action === 'delete_submission') {
        if ($currentUser['role'] !== 'admin') {
            sendJson(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }
        $studentId = isset($body['student_id']) ? (int)$body['student_id'] : 0;
        if ($studentId <= 0) {
            sendJson(['success' => false, 'message' => 'ID Murid tidak valid.'], 400);
        }
        try {
            $stmt = $pdo->prepare("DELETE FROM student_surveys WHERE student_id = :student_id");
            $stmt->execute(['student_id' => $studentId]);
            sendJson(['success' => true, 'message' => 'Data angket murid berhasil dihapus.']);
        } catch (PDOException $e) {
            sendJson(['success' => false, 'message' => 'Gagal menghapus data angket: ' . $e->getMessage()], 500);
        }
        exit;
    }

    // Only student role can save/update their survey response
    if ($currentUser['role'] !== 'student') {
        sendJson([
            'success' => false,
            'message' => 'Hanya murid yang dapat mengisi angket respon.'
        ], 403);
    }


    $body = getRequestBody();
    $answers = $body['answers'] ?? null;
    $feedback = $body['feedback'] ?? '';

    if (!is_array($answers)) {
        sendJson([
            'success' => false,
            'message' => 'Jawaban kuisioner tidak valid.'
        ], 400);
    }

    $roomId = isset($body['room_id']) ? (int)$body['room_id'] : 0;
    $roomIdVal = $roomId > 0 ? $roomId : null;

    try {
        $stmt = $pdo->prepare("
            INSERT INTO student_surveys (student_id, room_id, answers, feedback)
            VALUES (:student_id, :room_id, :answers, :feedback)
            ON DUPLICATE KEY UPDATE
                answers = VALUES(answers),
                feedback = VALUES(feedback),
                room_id = COALESCE(VALUES(room_id), room_id)
        ");
        $stmt->execute([
            'student_id' => $studentId,
            'room_id' => $roomIdVal,
            'answers' => $answersJson,
            'feedback' => $feedback
        ]);

        sendJson([
            'success' => true,
            'message' => 'Angket respon berhasil disimpan.'
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal menyimpan angket respon: ' . $e->getMessage()
        ], 500);
    }
} else {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan.'
    ], 405);
}
