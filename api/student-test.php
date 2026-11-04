<?php
// api/student-test.php

require_once 'config.php';
require_once 'docx-parser.php';

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
        // ADMIN ONLY: get list of students who submitted or started tests
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
                    SELECT u.id, u.full_name AS name, u.email, p.updated_at as last_updated, p.current_step, p.submitted, p.grade
                    FROM users u
                    JOIN room_members rm ON u.id = rm.user_id AND rm.room_id = :room_id
                    JOIN student_tests p ON u.id = p.student_id
                    WHERE u.role = 'student'
                    ORDER BY last_updated DESC
                ");
                $stmt->execute(['room_id' => $roomId]);
            } else {
                $stmt = $pdo->query("
                    SELECT u.id, u.full_name AS name, u.email, p.updated_at as last_updated, p.current_step, p.submitted, p.grade
                    FROM users u
                    JOIN student_tests p ON u.id = p.student_id
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
                'message' => 'Gagal mengambil data test murid: ' . $e->getMessage()
            ], 500);
        }
        exit;
    }

    if ($action === 'get_cases') {
        // Anyone logged in can fetch cases
        $roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;
        try {
            $cases = [];
            if ($roomId > 0) {
                try {
                    $stmt = $pdo->prepare("SELECT * FROM room_test_cases WHERE room_id = :room_id ORDER BY case_number ASC, id ASC");
                    $stmt->execute(['room_id' => $roomId]);
                    foreach ($stmt->fetchAll() as $row) {
                        $cases[] = [
                            'id' => (int)($row['case_number'] ?? $row['id']),
                            'title' => $row['title'],
                            'elements' => json_decode($row['content_json'], true) ?: [],
                            'questions' => json_decode($row['questions_json'], true) ?: []
                        ];
                    }
                } catch (PDOException $ex) {
                    // Ignore if table doesn't exist
                }
            }

            if (empty($cases)) {
                $stmt = $pdo->query("SELECT * FROM test_cases ORDER BY id ASC");
                foreach ($stmt->fetchAll() as $row) {
                    $cases[] = [
                        'id' => (int)$row['id'],
                        'title' => $row['title'],
                        'elements' => json_decode($row['content_json'], true) ?: [],
                        'questions' => json_decode($row['questions_json'], true) ?: []
                    ];
                }
            }

            sendJson([
                'success' => true,
                'cases' => $cases
            ]);
        } catch (PDOException $e) {
            sendJson([
                'success' => false,
                'message' => 'Gagal mengambil soal kasus: ' . $e->getMessage()
            ], 500);
        }
        exit;
    }

    // Default: Get test data for a student
    $studentId = $currentUser['id'];
    if ($currentUser['role'] === 'admin' && isset($_GET['student_id'])) {
        $studentId = (int)$_GET['student_id'];
    }

    $roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;

    try {
        if ($roomId > 0) {
            $stmt = $pdo->prepare("SELECT * FROM student_tests WHERE student_id = :student_id AND (room_id = :room_id OR room_id IS NULL) ORDER BY room_id DESC LIMIT 1");
            $stmt->execute(['student_id' => $studentId, 'room_id' => $roomId]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM student_tests WHERE student_id = :student_id LIMIT 1");
            $stmt->execute(['student_id' => $studentId]);
        }
        $test = $stmt->fetch();

        if ($test) {
            $testData = [
                'answers' => json_decode($test['answers'], true) ?: new stdClass(),
                'current_step' => (int)$test['current_step'],
                'submitted' => (int)$test['submitted'],
                'updated_at' => $test['updated_at']
            ];
            if ($currentUser['role'] === 'admin') {
                $testData['grade'] = $test['grade'] !== null ? (int)$test['grade'] : null;
            }
            sendJson([
                'success' => true,
                'test' => $testData
            ]);
        } else {
            sendJson([
                'success' => true,
                'test' => null
            ]);
        }
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengambil data test: ' . $e->getMessage()
        ], 500);
    }
} elseif ($method === 'POST') {
    // Check if it is an admin action
    $action = isset($_GET['action']) ? trim($_GET['action']) : '';

    if ($action === 'grade_test') {
        if ($currentUser['role'] !== 'admin') {
            sendJson([
                'success' => false,
                'message' => 'Hanya admin yang dapat memberi nilai.'
            ], 403);
        }

        $body = getRequestBody();
        $studentId = isset($body['student_id']) ? (int)$body['student_id'] : 0;
        $grade = isset($body['grade']) && $body['grade'] !== '' ? (int)$body['grade'] : null;

        if ($studentId <= 0) {
            sendJson([
                'success' => false,
                'message' => 'ID Murid tidak valid.'
            ], 400);
        }

        try {
            $stmt = $pdo->prepare("
                UPDATE student_tests 
                SET grade = :grade 
                WHERE student_id = :student_id
            ");
            $stmt->execute([
                'grade' => $grade,
                'student_id' => $studentId
            ]);
            sendJson([
                'success' => true,
                'message' => 'Nilai evaluasi berhasil disimpan.'
            ]);
        } catch (PDOException $e) {
            sendJson([
                'success' => false,
                'message' => 'Gagal menyimpan nilai evaluasi: ' . $e->getMessage()
            ], 500);
        }
        exit;
    }

    if ($action === 'delete_submission') {
        if ($currentUser['role'] !== 'admin') {
            sendJson(['success' => false, 'message' => 'Hanya admin yang dapat menghapus data test murid.'], 403);
        }
        $body = getRequestBody();
        $studentId = isset($body['student_id']) ? (int)$body['student_id'] : 0;
        if ($studentId <= 0) {
            sendJson(['success' => false, 'message' => 'ID Murid tidak valid.'], 400);
        }
        try {
            $stmt = $pdo->prepare("DELETE FROM student_tests WHERE student_id = :student_id");
            $stmt->execute(['student_id' => $studentId]);
            sendJson(['success' => true, 'message' => 'Data test murid berhasil dihapus.']);
        } catch (PDOException $e) {
            sendJson(['success' => false, 'message' => 'Gagal menghapus data test: ' . $e->getMessage()], 500);
        }
        exit;
    }

    if ($action === 'parse_docx') {
        if ($currentUser['role'] !== 'admin') {
            sendJson([
                'success' => false,
                'message' => 'Hanya admin yang dapat mengupload dokumen soal.'
            ], 403);
        }

        if (!isset($_FILES['docx_file']) || $_FILES['docx_file']['error'] !== UPLOAD_ERR_OK) {
            sendJson([
                'success' => false,
                'message' => 'Dokumen DOCX tidak diupload atau terjadi error saat upload.'
            ], 400);
        }

        $tmpName = $_FILES['docx_file']['tmp_name'];
        $uploadDir = __DIR__ . '/../uploads/test';
        $webPathPrefix = '/uploads/test';

        // Copy the uploaded file for diagnostics/inspection
        @copy($tmpName, $uploadDir . '/last_uploaded.docx');

        try {
            $parsedData = parseDocx($tmpName, $uploadDir, $webPathPrefix);
            sendJson([
                'success' => true,
                'parsed' => $parsedData
            ]);
        } catch (Exception $e) {
            sendJson([
                'success' => false,
                'message' => 'Gagal memproses dokumen: ' . $e->getMessage()
            ], 500);
        }
        exit;
    }

    if ($action === 'save_case_data') {
        if ($currentUser['role'] !== 'admin') {
            sendJson([
                'success' => false,
                'message' => 'Hanya admin yang dapat mengubah soal kasus.'
            ], 403);
        }

        $body = getRequestBody();
        $caseId = isset($body['case_id']) ? (int)$body['case_id'] : 0;
        $title = isset($body['title']) ? trim($body['title']) : '';
        $elements = $body['elements'] ?? [];
        $questions = $body['questions'] ?? [];
        $roomId = isset($body['room_id']) ? (int)$body['room_id'] : 0;

        if ($caseId < 1 || empty($title)) {
            sendJson([
                'success' => false,
                'message' => 'ID Kasus dan Judul Kasus wajib diisi.'
            ], 400);
        }

        try {
            if ($roomId > 0) {
                // Ensure room_test_cases has initial cases for this room
                $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM room_test_cases WHERE room_id = :room_id");
                $checkStmt->execute(['room_id' => $roomId]);
                if ((int)$checkStmt->fetchColumn() === 0) {
                    $pdo->prepare("
                        INSERT INTO room_test_cases (room_id, case_number, title, content_json, questions_json)
                        SELECT :room_id, id, title, content_json, questions_json FROM test_cases ORDER BY id ASC
                    ")->execute(['room_id' => $roomId]);
                }

                $existStmt = $pdo->prepare("SELECT id FROM room_test_cases WHERE room_id = :room_id AND case_number = :case_number");
                $existStmt->execute(['room_id' => $roomId, 'case_number' => $caseId]);
                $existingId = $existStmt->fetchColumn();

                if ($existingId) {
                    $stmt = $pdo->prepare("
                        UPDATE room_test_cases
                        SET title = :title, content_json = :content_json, questions_json = :questions_json
                        WHERE id = :id
                    ");
                    $stmt->execute([
                        'title' => $title,
                        'content_json' => json_encode($elements, JSON_UNESCAPED_UNICODE),
                        'questions_json' => json_encode($questions, JSON_UNESCAPED_UNICODE),
                        'id' => $existingId
                    ]);
                } else {
                    $stmt = $pdo->prepare("
                        INSERT INTO room_test_cases (room_id, case_number, title, content_json, questions_json)
                        VALUES (:room_id, :case_number, :title, :content_json, :questions_json)
                    ");
                    $stmt->execute([
                        'room_id' => $roomId,
                        'case_number' => $caseId,
                        'title' => $title,
                        'content_json' => json_encode($elements, JSON_UNESCAPED_UNICODE),
                        'questions_json' => json_encode($questions, JSON_UNESCAPED_UNICODE)
                    ]);
                }
            } else {
                $stmt = $pdo->prepare("
                    INSERT INTO test_cases (id, title, content_json, questions_json)
                    VALUES (:id, :title, :content_json, :questions_json)
                    ON DUPLICATE KEY UPDATE
                        title = VALUES(title),
                        content_json = VALUES(content_json),
                        questions_json = VALUES(questions_json)
                ");
                $stmt->execute([
                    'id' => $caseId,
                    'title' => $title,
                    'content_json' => json_encode($elements, JSON_UNESCAPED_UNICODE),
                    'questions_json' => json_encode($questions, JSON_UNESCAPED_UNICODE)
                ]);
            }

            sendJson([
                'success' => true,
                'message' => "Kasus $caseId berhasil disimpan."
            ]);
        } catch (PDOException $e) {
            sendJson([
                'success' => false,
                'message' => 'Gagal menyimpan kasus: ' . $e->getMessage()
            ], 500);
        }
        exit;
    }

    if ($action === 'delete_case') {
        if ($currentUser['role'] !== 'admin') {
            sendJson([
                'success' => false,
                'message' => 'Hanya admin yang dapat menghapus kasus.'
            ], 403);
        }

        $body = getRequestBody();
        $caseId = isset($body['case_id']) ? (int)$body['case_id'] : 0;
        $roomId = isset($body['room_id']) ? (int)$body['room_id'] : 0;

        if ($caseId < 1) {
            sendJson([
                'success' => false,
                'message' => 'ID Kasus tidak valid.'
            ], 400);
        }

        try {
            $pdo->beginTransaction();

            if ($roomId > 0) {
                $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM room_test_cases WHERE room_id = :room_id");
                $checkStmt->execute(['room_id' => $roomId]);
                if ((int)$checkStmt->fetchColumn() === 0) {
                    $pdo->prepare("
                        INSERT INTO room_test_cases (room_id, case_number, title, content_json, questions_json)
                        SELECT :room_id, id, title, content_json, questions_json FROM test_cases ORDER BY id ASC
                    ")->execute(['room_id' => $roomId]);
                }

                $stmt = $pdo->prepare("DELETE FROM room_test_cases WHERE room_id = :room_id AND case_number = :case_number");
                $stmt->execute(['room_id' => $roomId, 'case_number' => $caseId]);

                $remStmt = $pdo->prepare("SELECT id FROM room_test_cases WHERE room_id = :room_id ORDER BY case_number ASC, id ASC");
                $remStmt->execute(['room_id' => $roomId]);
                $remaining = $remStmt->fetchAll(PDO::FETCH_ASSOC);

                $upStmt = $pdo->prepare("UPDATE room_test_cases SET case_number = :num WHERE id = :id");
                foreach ($remaining as $idx => $case) {
                    $upStmt->execute(['num' => $idx + 1, 'id' => $case['id']]);
                }
            } else {
                $stmt = $pdo->prepare("DELETE FROM test_cases WHERE id = :id");
                $stmt->execute(['id' => $caseId]);

                // Fetch all remaining cases ordered by current id ASC
                $remaining = $pdo->query("SELECT * FROM test_cases ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);

                // Temporarily offset their IDs to avoid duplicate key conflicts during update
                $pdo->exec("UPDATE test_cases SET id = id + 10000");

                // Update the IDs to be 1-based sequential indices (1, 2, 3, ...)
                $updateStmt = $pdo->prepare("UPDATE test_cases SET id = :new_id WHERE id = :old_id");
                foreach ($remaining as $idx => $case) {
                    $oldId = (int)$case['id'] + 10000;
                    $newId = $idx + 1;
                    $updateStmt->execute([
                        'new_id' => $newId,
                        'old_id' => $oldId
                    ]);
                }
            }

            $pdo->commit();
            sendJson([
                'success' => true,
                'message' => 'Kasus berhasil dihapus dan urutan kasus telah diperbarui secara berurutan.'
            ]);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            sendJson([
                'success' => false,
                'message' => 'Gagal menghapus dan mengatur ulang urutan kasus: ' . $e->getMessage()
            ], 500);
        }
        exit;
    }

    // Default student save/submit response
    if ($currentUser['role'] !== 'student') {
        sendJson([
            'success' => false,
            'message' => 'Hanya murid yang dapat mengerjakan test.'
        ], 403);
    }

    $body = getRequestBody();
    $answers = $body['answers'] ?? null;
    $currentStep = isset($body['current_step']) ? (int)$body['current_step'] : 1;
    $submitted = isset($body['submitted']) ? (int)$body['submitted'] : 0;

    if (!is_array($answers)) {
        sendJson([
            'success' => false,
            'message' => 'Jawaban test tidak valid.'
        ], 400);
    }

    $studentId = $currentUser['id'];
    $answersJson = json_encode($answers);

    $roomId = isset($body['room_id']) ? (int)$body['room_id'] : 0;
    $roomIdVal = $roomId > 0 ? $roomId : null;

    try {
        // Double check if already submitted. Once submitted, lock it.
        if ($roomIdVal !== null) {
            $checkStmt = $pdo->prepare("SELECT submitted FROM student_tests WHERE student_id = :student_id AND room_id = :room_id");
            $checkStmt->execute(['student_id' => $studentId, 'room_id' => $roomIdVal]);
        } else {
            $checkStmt = $pdo->prepare("SELECT submitted FROM student_tests WHERE student_id = :student_id");
            $checkStmt->execute(['student_id' => $studentId]);
        }
        $existingSubmitted = $checkStmt->fetchColumn();

        if ($existingSubmitted == 1) {
            sendJson([
                'success' => false,
                'message' => 'Test Anda sudah dikirimkan dan tidak dapat diubah lagi.'
            ], 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO student_tests (student_id, room_id, answers, current_step, submitted)
            VALUES (:student_id, :room_id, :answers, :current_step, :submitted)
            ON DUPLICATE KEY UPDATE
                answers = VALUES(answers),
                current_step = VALUES(current_step),
                submitted = VALUES(submitted),
                room_id = COALESCE(VALUES(room_id), room_id)
        ");
        $stmt->execute([
            'student_id' => $studentId,
            'room_id' => $roomIdVal,
            'answers' => $answersJson,
            'current_step' => $currentStep,
            'submitted' => $submitted
        ]);

        sendJson([
            'success' => true,
            'message' => $submitted ? 'Test berhasil dikirimkan.' : 'Progress test berhasil disimpan.'
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal menyimpan test: ' . $e->getMessage()
        ], 500);
    }
} else {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan.'
    ], 405);
}
