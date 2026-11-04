<?php
// api/student-survey.php

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

function getDefaultSurveyQuestionsList() {
    return [
        ['id' => 1, 'order' => 1, 'text' => "Apakah kegiatan awal pembelajaran membantu anda memahami tujuan dan permasalahan yang akan dipelajari?"],
        ['id' => 2, 'order' => 2, 'text' => "Apakah kasus permasalahan lingkungan yang disajikan menarik perhatian anda untuk belajar?"],
        ['id' => 3, 'order' => 3, 'text' => "Apakah dengan bekerja secara berkelompok membantu anda bekerja sama dengan anggota kelompok secara efektif?"],
        ['id' => 5, 'order' => 4, 'text' => "Apakah anda lebih mudah mengidentifikasi masalah yang terdapat dalam kasus?"],
        ['id' => 6, 'order' => 5, 'text' => "Apakah anda lebih mudah menemukan penyebab masalah lingkungan yang dibahas?"],
        ['id' => 7, 'order' => 6, 'text' => "Apakah data dan informasi yang tersedia pada GAS website membantu anda menganalisis kasus?"],
        ['id' => 8, 'order' => 7, 'text' => "Apakah anda dapat merancang alternatif solusi terhadap masalah yang diberikan?"],
        ['id' => 9, 'order' => 8, 'text' => "Apakah anda memilih solusi yang paling tepat berdasarkan data dan fakta?"],
        ['id' => 10, 'order' => 9, 'text' => "Apakah anda menerapkan solusi dalam bentuk tindakan nyata?"],
        ['id' => 11, 'order' => 10, 'text' => "Apakah kegiatan mengkomunasikan hasil dalam bentuk video membantu anda mengomunikasikan hasil pemecahan masalah dengan lebih baik?"],
        ['id' => 12, 'order' => 11, 'text' => "Apakah GAS website mudah digunakan selama kegiatan pembelajaran?"],
        ['id' => 13, 'order' => 12, 'text' => "Apakah tampilan GAS website menarik dan mudah dipahami?"],
        ['id' => 14, 'order' => 13, 'text' => "Apakah fitur-fitur pada GAS website membantu anda memperoleh informasi yang dibutuhkan?"],
        ['id' => 15, 'order' => 14, 'text' => "Apakah GAS website membantu anda belajar secara mandiri?"],
        ['id' => 16, 'order' => 15, 'text' => "Apakah GAS website membantu anda mengikuti setiap tahapan pembelajaran CASUAL dengan lebih baik?"],
        ['id' => 17, 'order' => 16, 'text' => "Apakah pembelajaran ini membantu anda memahami hubungan antara aktivitas manusia dan lingkungan?"],
        ['id' => 18, 'order' => 17, 'text' => "Apakah pembelajaran ini meningkatkan kepedulian anda terhadap masalah lingkungan?"],
        ['id' => 19, 'order' => 18, 'text' => "Apakah pembelajaran ini mendorong anda melakukan tindakan yang lebih ramah lingkungan dalam kehidupan sehari-hari?"],
        ['id' => 20, 'order' => 19, 'text' => "Apakah anda mengevaluasi kembali solusi berupa aksi nyata yang telah dibuat?"],
        ['id' => 21, 'order' => 20, 'text' => "Apakah anda terbantu dalam memperbaiki kesalahan dalam proses pemecahan masalah?"],
        ['id' => 22, 'order' => 21, 'text' => "Apakah pembelajaran ini meningkatkan kemampuan anda dalam memecahkan masalah secara sistematis?"],
        ['id' => 23, 'order' => 22, 'text' => "Apakah bahan ajar yang digunakan mudah dipahami?"],
        ['id' => 24, 'order' => 23, 'text' => "Apakah bahan ajar membantu anda memahami materi yang dipelajari?"],
        ['id' => 25, 'order' => 24, 'text' => "Apakah lembar kerja murid (LKM) membantu anda menyelesaikan tugas pembelajaran?"],
        ['id' => 26, 'order' => 25, 'text' => "Apakah suasana kelas selama pembelajaran membuat anda aktif berdiskusi?"],
        ['id' => 27, 'order' => 26, 'text' => "Apakah cara guru menyajikan materi membantu anda memahami pembelajaran dengan baik?"]
    ];
}

// 1. PUBLIC READ: Ambil daftar butir pertanyaan angket
if ($method === 'GET' && isset($_GET['action']) && trim($_GET['action']) === 'get_questions') {
    $roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;
    try {
        $questions = [];
        if ($roomId > 0) {
            try {
                $stmt = $pdo->prepare("SELECT id, question_order, text, is_active FROM room_survey_questions WHERE room_id = :room_id AND is_active = 1 ORDER BY question_order ASC, id ASC");
                $stmt->execute(['room_id' => $roomId]);
                $questions = $stmt->fetchAll();
            } catch (PDOException $ex) {}
        }

        if (empty($questions)) {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS survey_questions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    question_order INT NOT NULL DEFAULT 1,
                    text TEXT NOT NULL,
                    is_active TINYINT(1) NOT NULL DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
            ");

            $stmt = $pdo->query("SELECT id, question_order, text, is_active FROM survey_questions WHERE is_active = 1 ORDER BY question_order ASC, id ASC");
            $questions = $stmt->fetchAll();

            if (empty($questions)) {
                $defaults = getDefaultSurveyQuestionsList();
                $ins = $pdo->prepare("INSERT INTO survey_questions (id, question_order, text) VALUES (?, ?, ?)");
                foreach ($defaults as $dq) {
                    $ins->execute([$dq['id'], $dq['order'], $dq['text']]);
                }
                $stmt = $pdo->query("SELECT id, question_order, text, is_active FROM survey_questions WHERE is_active = 1 ORDER BY question_order ASC, id ASC");
                $questions = $stmt->fetchAll();
            }
        }

        sendJson([
            'success' => true,
            'questions' => $questions
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengambil data pertanyaan angket: ' . $e->getMessage()
        ], 500);
    }
    exit;
}

// Authentication protection for all other actions
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
            $stmt = $pdo->prepare("SELECT * FROM student_surveys WHERE student_id = :student_id AND (room_id = :room_id OR room_id IS NULL) ORDER BY room_id DESC LIMIT 1");
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

    // ADMIN: Simpan daftar butir pertanyaan angket
    if ($action === 'save_questions') {
        if ($currentUser['role'] !== 'admin') {
            sendJson(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }
        $questions = $body['questions'] ?? [];
        $roomId = isset($body['room_id']) ? (int)$body['room_id'] : 0;
        if (!is_array($questions)) {
            sendJson(['success' => false, 'message' => 'Format data pertanyaan tidak valid.'], 400);
        }

        $pdo->beginTransaction();
        try {
            $order = 1;
            if ($roomId > 0) {
                $delStmt = $pdo->prepare("DELETE FROM room_survey_questions WHERE room_id = :room_id");
                $delStmt->execute(['room_id' => $roomId]);

                $insertRoomStmt = $pdo->prepare("INSERT INTO room_survey_questions (room_id, question_order, text, is_active) VALUES (?, ?, ?, 1)");
                foreach ($questions as $q) {
                    $text = trim($q['text'] ?? '');
                    if ($text === '') continue;
                    $insertRoomStmt->execute([$roomId, $order, $text]);
                    $order++;
                }

                $pdo->commit();

                $stmt = $pdo->prepare("SELECT id, question_order, text, is_active FROM room_survey_questions WHERE room_id = :room_id AND is_active = 1 ORDER BY question_order ASC, id ASC");
                $stmt->execute(['room_id' => $roomId]);
                $savedQuestions = $stmt->fetchAll();
            } else {
                $preservedIds = [];
                $insertStmt = $pdo->prepare("INSERT INTO survey_questions (question_order, text, is_active) VALUES (?, ?, 1)");
                $updateStmt = $pdo->prepare("UPDATE survey_questions SET question_order = ?, text = ?, is_active = 1 WHERE id = ?");

                foreach ($questions as $q) {
                    $qId = isset($q['id']) ? (int)$q['id'] : 0;
                    $text = trim($q['text'] ?? '');
                    if ($text === '') continue;

                    if ($qId > 0) {
                        $updateStmt->execute([$order, $text, $qId]);
                        $preservedIds[] = $qId;
                    } else {
                        $insertStmt->execute([$order, $text]);
                        $preservedIds[] = (int)$pdo->lastInsertId();
                    }
                    $order++;
                }

                // Hapus pertanyaan yang tidak ada lagi di daftar
                if (!empty($preservedIds)) {
                    $inClause = implode(',', array_fill(0, count($preservedIds), '?'));
                    $deleteStmt = $pdo->prepare("DELETE FROM survey_questions WHERE id NOT IN ($inClause)");
                    $deleteStmt->execute($preservedIds);
                } else {
                    $pdo->exec("DELETE FROM survey_questions");
                }

                $pdo->commit();

                $stmt = $pdo->query("SELECT id, question_order, text, is_active FROM survey_questions WHERE is_active = 1 ORDER BY question_order ASC, id ASC");
                $savedQuestions = $stmt->fetchAll();
            }

            sendJson([
                'success' => true,
                'message' => 'Daftar butir pertanyaan angket respon berhasil disimpan.',
                'questions' => $savedQuestions
            ]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            sendJson(['success' => false, 'message' => 'Gagal menyimpan pertanyaan angket: ' . $e->getMessage()], 500);
        }
        exit;
    }

    // ADMIN: Reset pertanyaan angket ke butir baku awal
    if ($action === 'reset_questions') {
        if ($currentUser['role'] !== 'admin') {
            sendJson(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $roomId = isset($body['room_id']) ? (int)$body['room_id'] : 0;
        $pdo->beginTransaction();
        try {
            $defaults = getDefaultSurveyQuestionsList();
            if ($roomId > 0) {
                $delStmt = $pdo->prepare("DELETE FROM room_survey_questions WHERE room_id = :room_id");
                $delStmt->execute(['room_id' => $roomId]);

                $ins = $pdo->prepare("INSERT INTO room_survey_questions (room_id, question_order, text, is_active) VALUES (?, ?, ?, 1)");
                foreach ($defaults as $dq) {
                    $ins->execute([$roomId, $dq['order'], $dq['text']]);
                }
                $pdo->commit();

                $stmt = $pdo->prepare("SELECT id, question_order, text, is_active FROM room_survey_questions WHERE room_id = :room_id AND is_active = 1 ORDER BY question_order ASC, id ASC");
                $stmt->execute(['room_id' => $roomId]);
                $resetQuestions = $stmt->fetchAll();
            } else {
                $pdo->exec("DELETE FROM survey_questions");
                $ins = $pdo->prepare("INSERT INTO survey_questions (id, question_order, text) VALUES (?, ?, ?)");
                foreach ($defaults as $dq) {
                    $ins->execute([$dq['id'], $dq['order'], $dq['text']]);
                }
                $pdo->commit();

                $stmt = $pdo->query("SELECT id, question_order, text, is_active FROM survey_questions WHERE is_active = 1 ORDER BY question_order ASC, id ASC");
                $resetQuestions = $stmt->fetchAll();
            }

            sendJson([
                'success' => true,
                'message' => 'Pertanyaan angket berhasil direset ke butir instrumen baku.',
                'questions' => $resetQuestions
            ]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            sendJson(['success' => false, 'message' => 'Gagal mereset pertanyaan angket: ' . $e->getMessage()], 500);
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

    $studentId = (int)$currentUser['id'];
    $answersJson = json_encode($answers, JSON_UNESCAPED_UNICODE);

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
