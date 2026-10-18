<?php
// api/room-assignments.php
// Penugasan Kelas (Assignments) per kelas.
// Admin dapat membuat/mengedit/menghapus tugas, menilai pengumpulan murid.
// Siswa dapat melihat tugas, mengunggah berkas pengumpulan, dan berdiskusi pada kolom komentar.

require_once 'config.php';

$method  = $_SERVER['REQUEST_METHOD'];
$userId  = requireAuth();
$isAdmin = isset($_SESSION['user']) && $_SESSION['user']['role'] === 'admin';

// Helper: Verifikasi keanggotaan kelas
function verifyRoomAccess(PDO $pdo, int $roomId, int $userId, bool $isAdmin): bool {
    if ($isAdmin) return true;
    $stmt = $pdo->prepare("SELECT 1 FROM room_members WHERE room_id = :r AND user_id = :u LIMIT 1");
    $stmt->execute(['r' => $roomId, 'u' => $userId]);
    return (bool)$stmt->fetchColumn();
}

// ─────────────────────────────────────────────────────────────
// GET REQUESTS
// ─────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $action = isset($_GET['action']) ? trim($_GET['action']) : 'list';

    // 1. LIST SEMUA TUGAS DALAM KELAS
    if ($action === 'list') {
        $roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;
        if ($roomId <= 0) {
            sendJson(['success' => false, 'message' => 'room_id wajib disertakan.'], 400);
        }

        if (!verifyRoomAccess($pdo, $roomId, $userId, $isAdmin)) {
            sendJson(['success' => false, 'message' => 'Anda bukan anggota kelas ini.'], 403);
        }

        try {
            // Hitung total anggota kelas
            $stmtCount = $pdo->prepare("SELECT COUNT(*) FROM room_members WHERE room_id = :r");
            $stmtCount->execute(['r' => $roomId]);
            $totalMembers = (int)$stmtCount->fetchColumn();

            // Ambil daftar tugas
            $stmt = $pdo->prepare("
                SELECT a.*, 
                       u.full_name AS creator_name,
                       (SELECT COUNT(*) FROM assignment_comments WHERE assignment_id = a.id) AS comments_count,
                       (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) AS submissions_count,
                       (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id AND status = 'graded') AS graded_count
                FROM room_assignments a
                JOIN users u ON a.created_by = u.id
                WHERE a.room_id = :room_id
                ORDER BY a.created_at DESC
            ");
            $stmt->execute(['room_id' => $roomId]);
            $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Jika murid, sertakan data pengumpulan masing-masing tugas
            if (!$isAdmin) {
                $subStmt = $pdo->prepare("
                    SELECT assignment_id, id, filename, original_name, notes, status, grade, feedback, submitted_at, graded_at
                    FROM assignment_submissions
                    WHERE student_id = :uid AND room_id = :rid
                ");
                $subStmt->execute(['uid' => $userId, 'rid' => $roomId]);
                $mySubs = [];
                while ($sub = $subStmt->fetch(PDO::FETCH_ASSOC)) {
                    $mySubs[$sub['assignment_id']] = $sub;
                }

                foreach ($assignments as &$assign) {
                    $assign['my_submission'] = $mySubs[$assign['id']] ?? null;
                }
                unset($assign);
            }

            sendJson([
                'success' => true,
                'total_members' => $totalMembers,
                'assignments' => $assignments
            ]);
        } catch (PDOException $e) {
            error_log('room-assignments list error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal mengambil daftar tugas.'], 500);
        }
        exit;
    }

    // 2. DETAIL TUGAS TUNGGAL (Termasuk komentar & submisi)
    if ($action === 'detail') {
        $assignmentId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($assignmentId <= 0) {
            sendJson(['success' => false, 'message' => 'ID tugas tidak valid.'], 400);
        }

        try {
            $stmt = $pdo->prepare("
                SELECT a.*, u.full_name AS creator_name, u.avatar_url AS creator_avatar
                FROM room_assignments a
                JOIN users u ON a.created_by = u.id
                WHERE a.id = :id
                LIMIT 1
            ");
            $stmt->execute(['id' => $assignmentId]);
            $assignment = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$assignment) {
                sendJson(['success' => false, 'message' => 'Tugas tidak ditemukan.'], 404);
            }

            if (!verifyRoomAccess($pdo, (int)$assignment['room_id'], $userId, $isAdmin)) {
                sendJson(['success' => false, 'message' => 'Akses ditolak.'], 403);
            }

            // Ambil komentar diskusi kelas (Class Comments)
            $commStmt = $pdo->prepare("
                SELECT c.id, c.assignment_id, c.user_id, c.content, c.comment_type, c.target_student_id, c.created_at,
                       u.full_name AS author_name, u.role AS author_role, u.avatar_url AS author_avatar
                FROM assignment_comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.assignment_id = :aid AND (c.comment_type = 'class' OR c.comment_type IS NULL)
                ORDER BY c.created_at ASC
            ");
            $commStmt->execute(['aid' => $assignmentId]);
            $comments = $commStmt->fetchAll(PDO::FETCH_ASSOC);

            // Ambil komentar pribadi (Private Comments)
            if ($isAdmin) {
                $pcommStmt = $pdo->prepare("
                    SELECT c.id, c.assignment_id, c.user_id, c.content, c.comment_type, c.target_student_id, c.created_at,
                           u.full_name AS author_name, u.role AS author_role, u.avatar_url AS author_avatar
                    FROM assignment_comments c
                    JOIN users u ON c.user_id = u.id
                    WHERE c.assignment_id = :aid AND c.comment_type = 'private'
                    ORDER BY c.created_at ASC
                ");
                $pcommStmt->execute(['aid' => $assignmentId]);
                $privateComments = $pcommStmt->fetchAll(PDO::FETCH_ASSOC);
            } else {
                $pcommStmt = $pdo->prepare("
                    SELECT c.id, c.assignment_id, c.user_id, c.content, c.comment_type, c.target_student_id, c.created_at,
                           u.full_name AS author_name, u.role AS author_role, u.avatar_url AS author_avatar
                    FROM assignment_comments c
                    JOIN users u ON c.user_id = u.id
                    WHERE c.assignment_id = :aid AND c.comment_type = 'private'
                      AND (c.user_id = :uid OR c.target_student_id = :tuid)
                    ORDER BY c.created_at ASC
                ");
                $pcommStmt->execute(['aid' => $assignmentId, 'uid' => $userId, 'tuid' => $userId]);
                $privateComments = $pcommStmt->fetchAll(PDO::FETCH_ASSOC);
            }

            // Submisi
            $mySubmission = null;
            $allSubmissions = [];
            $members = [];

            if ($isAdmin) {
                // Admin: ambil semua submisi murid
                $subStmt = $pdo->prepare("
                    SELECT s.*, u.full_name AS student_name, u.email AS student_email, u.avatar_url AS student_avatar
                    FROM assignment_submissions s
                    JOIN users u ON s.student_id = u.id
                    WHERE s.assignment_id = :aid
                    ORDER BY s.submitted_at DESC
                ");
                $subStmt->execute(['aid' => $assignmentId]);
                $allSubmissions = $subStmt->fetchAll(PDO::FETCH_ASSOC);

                // Ambil seluruh murid dalam kelas
                $memStmt = $pdo->prepare("
                    SELECT u.id, u.full_name, u.email, u.avatar_url
                    FROM room_members rm
                    JOIN users u ON rm.user_id = u.id
                    WHERE rm.room_id = :rid AND u.role = 'student'
                    ORDER BY u.full_name ASC
                ");
                $memStmt->execute(['rid' => $assignment['room_id']]);
                $members = $memStmt->fetchAll(PDO::FETCH_ASSOC);
            } else {
                // Murid: ambil submisi milik sendiri
                $subStmt = $pdo->prepare("
                    SELECT * FROM assignment_submissions
                    WHERE assignment_id = :aid AND student_id = :uid
                    LIMIT 1
                ");
                $subStmt->execute(['aid' => $assignmentId, 'uid' => $userId]);
                $mySubmission = $subStmt->fetch(PDO::FETCH_ASSOC) ?: null;
            }

            sendJson([
                'success' => true,
                'assignment' => $assignment,
                'comments' => $comments,
                'private_comments' => $privateComments,
                'my_submission' => $mySubmission,
                'submissions' => $allSubmissions,
                'members' => $members
            ]);
        } catch (PDOException $e) {
            error_log('room-assignments detail error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal memuat detail tugas.'], 500);
        }
        exit;
    }

    sendJson(['success' => false, 'message' => 'Action tidak dikenali.'], 400);
}

// ─────────────────────────────────────────────────────────────
// POST REQUESTS
// ─────────────────────────────────────────────────────────────
if ($method === 'POST') {
    // Cek apakah request berupa multipart/form-data atau JSON
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'application/json') !== false) {
        $body = getRequestBody();
    } else {
        $body = $_POST;
    }

    $action = isset($body['action']) ? trim($body['action']) : '';

    // 1. ADMIN: BUAT TUGAS BARU
    if ($action === 'create_assignment') {
        if (!$isAdmin) {
            sendJson(['success' => false, 'message' => 'Hanya admin atau guru yang dapat membuat tugas.'], 403);
        }

        $roomId      = isset($body['room_id']) ? (int)$body['room_id'] : 0;
        $title       = isset($body['title']) ? trim($body['title']) : '';
        $description = isset($body['description']) ? trim($body['description']) : '';
        $dueDate     = !empty($body['due_date']) ? trim($body['due_date']) : null;
        $maxPoints   = isset($body['max_points']) ? (int)$body['max_points'] : 100;

        if ($roomId <= 0 || $title === '') {
            sendJson(['success' => false, 'message' => 'Ruang kelas dan judul tugas wajib diisi.'], 400);
        }

        // Handle attachment file jika diunggah oleh admin
        $attachmentPath = null;
        $attachmentName = null;
        if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
            $attDir = dirname(__DIR__) . '/uploads/assignment_attachments/';
            if (!is_dir($attDir)) {
                mkdir($attDir, 0755, true);
            }
            $origName = $_FILES['attachment']['name'];
            $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
            $newAttName = 'att_' . time() . '_' . uniqid() . '.' . $ext;
            if (move_uploaded_file($_FILES['attachment']['tmp_name'], $attDir . $newAttName)) {
                $attachmentPath = $newAttName;
                $attachmentName = $origName;
            }
        }

        try {
            $stmt = $pdo->prepare("
                INSERT INTO room_assignments (room_id, title, description, due_date, max_points, attachment_path, attachment_name, created_by)
                VALUES (:rid, :title, :desc, :due, :pts, :att_path, :att_name, :uid)
            ");
            $stmt->execute([
                'rid'      => $roomId,
                'title'    => $title,
                'desc'     => $description,
                'due'      => $dueDate,
                'pts'      => $maxPoints,
                'att_path' => $attachmentPath,
                'att_name' => $attachmentName,
                'uid'      => $userId
            ]);

            $newId = (int)$pdo->lastInsertId();
            sendJson([
                'success' => true,
                'message' => 'Tugas baru berhasil diterbitkan!',
                'id' => $newId
            ]);
        } catch (PDOException $e) {
            error_log('create_assignment error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal membuat tugas.'], 500);
        }
        exit;
    }

    // 2. ADMIN: EDIT TUGAS
    if ($action === 'update_assignment') {
        if (!$isAdmin) {
            sendJson(['success' => false, 'message' => 'Hanya admin yang dapat mengedit tugas.'], 403);
        }

        $id          = isset($body['id']) ? (int)$body['id'] : 0;
        $title       = isset($body['title']) ? trim($body['title']) : '';
        $description = isset($body['description']) ? trim($body['description']) : '';
        $dueDate     = !empty($body['due_date']) ? trim($body['due_date']) : null;
        $maxPoints   = isset($body['max_points']) ? (int)$body['max_points'] : 100;

        if ($id <= 0 || $title === '') {
            sendJson(['success' => false, 'message' => 'ID dan judul tugas wajib diisi.'], 400);
        }

        try {
            $stmt = $pdo->prepare("
                UPDATE room_assignments 
                SET title = :title, description = :desc, due_date = :due, max_points = :pts
                WHERE id = :id
            ");
            $stmt->execute([
                'title' => $title,
                'desc'  => $description,
                'due'   => $dueDate,
                'pts'   => $maxPoints,
                'id'    => $id
            ]);

            sendJson(['success' => true, 'message' => 'Tugas berhasil diperbarui.']);
        } catch (PDOException $e) {
            error_log('update_assignment error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal memperbarui tugas.'], 500);
        }
        exit;
    }

    // 3. ADMIN: HAPUS TUGAS
    if ($action === 'delete_assignment') {
        if (!$isAdmin) {
            sendJson(['success' => false, 'message' => 'Hanya admin yang dapat menghapus tugas.'], 403);
        }

        $id = isset($body['id']) ? (int)$body['id'] : 0;
        if ($id <= 0) {
            sendJson(['success' => false, 'message' => 'ID tugas tidak valid.'], 400);
        }

        try {
            // Hapus file-file submisi terkait
            $subs = $pdo->prepare("SELECT filename FROM assignment_submissions WHERE assignment_id = :id");
            $subs->execute(['id' => $id]);
            $files = $subs->fetchAll(PDO::FETCH_COLUMN);
            $subDir = dirname(__DIR__) . '/uploads/assignments/';
            foreach ($files as $f) {
                if ($f && file_exists($subDir . $f)) {
                    @unlink($subDir . $f);
                }
            }

            // Hapus berkas lampiran tugas jika ada
            $att = $pdo->prepare("SELECT attachment_path FROM room_assignments WHERE id = :id");
            $att->execute(['id' => $id]);
            $attFile = $att->fetchColumn();
            $attDir = dirname(__DIR__) . '/uploads/assignment_attachments/';
            if ($attFile && file_exists($attDir . $attFile)) {
                @unlink($attDir . $attFile);
            }

            // Hapus record (foreign key cascade akan menghapus komentar & submisi)
            $stmt = $pdo->prepare("DELETE FROM room_assignments WHERE id = :id");
            $stmt->execute(['id' => $id]);

            sendJson(['success' => true, 'message' => 'Tugas berhasil dihapus.']);
        } catch (PDOException $e) {
            error_log('delete_assignment error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal menghapus tugas.'], 500);
        }
        exit;
    }

    // 4. SISWA / ADMIN: KUMPULKAN TUGAS (UPLOAD FILE)
    if ($action === 'submit_assignment') {
        $assignmentId = isset($_POST['assignment_id']) ? (int)$_POST['assignment_id'] : 0;
        $notes        = isset($_POST['notes']) ? trim($_POST['notes']) : '';

        if ($assignmentId <= 0) {
            sendJson(['success' => false, 'message' => 'ID tugas wajib diisi.'], 400);
        }

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            sendJson(['success' => false, 'message' => 'Berkas tugas wajib diunggah.'], 400);
        }

        // Dapatkan room_id dari assignment
        $assignStmt = $pdo->prepare("SELECT room_id FROM room_assignments WHERE id = :id");
        $assignStmt->execute(['id' => $assignmentId]);
        $roomId = (int)$assignStmt->fetchColumn();
        if ($roomId <= 0) {
            sendJson(['success' => false, 'message' => 'Tugas tidak ditemukan.'], 404);
        }

        if (!verifyRoomAccess($pdo, $roomId, $userId, $isAdmin)) {
            sendJson(['success' => false, 'message' => 'Anda bukan anggota kelas ini.'], 403);
        }

        $origName = $_FILES['file']['name'];
        $fileSize = $_FILES['file']['size'];
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

        $allowedExts = ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'zip', 'rar', 'jpg', 'jpeg', 'png', 'xlsx', 'xls'];
        if (!in_array($ext, $allowedExts)) {
            sendJson(['success' => false, 'message' => 'Format file tidak didukung. Harap gunakan PDF, Word, PowerPoint, ZIP, atau Gambar.'], 400);
        }

        // Batas 25MB
        if ($fileSize > 25 * 1024 * 1024) {
            sendJson(['success' => false, 'message' => 'Ukuran berkas melebihi batas maksimal 25MB.'], 400);
        }

        $uploadDir = dirname(__DIR__) . '/uploads/assignments/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $newFilename = 'assign_' . $assignmentId . '_u' . $userId . '_' . time() . '.' . $ext;
        $targetPath  = $uploadDir . $newFilename;

        if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
            try {
                // Cek apakah sudah pernah mengumpulkan sebelumnya
                $checkStmt = $pdo->prepare("SELECT id, filename FROM assignment_submissions WHERE assignment_id = :aid AND student_id = :uid");
                $checkStmt->execute(['aid' => $assignmentId, 'uid' => $userId]);
                $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

                if ($existing) {
                    // Hapus file lama jika ada
                    if ($existing['filename'] && file_exists($uploadDir . $existing['filename'])) {
                        @unlink($uploadDir . $existing['filename']);
                    }

                    $upStmt = $pdo->prepare("
                        UPDATE assignment_submissions 
                        SET filename = :fn, original_name = :on, notes = :notes, status = 'submitted', submitted_at = CURRENT_TIMESTAMP
                        WHERE id = :id
                    ");
                    $upStmt->execute([
                        'fn'    => $newFilename,
                        'on'    => $origName,
                        'notes' => $notes,
                        'id'    => $existing['id']
                    ]);
                } else {
                    $inStmt = $pdo->prepare("
                        INSERT INTO assignment_submissions (assignment_id, room_id, student_id, filename, original_name, notes, status)
                        VALUES (:aid, :rid, :uid, :fn, :on, :notes, 'submitted')
                    ");
                    $inStmt->execute([
                        'aid'   => $assignmentId,
                        'rid'   => $roomId,
                        'uid'   => $userId,
                        'fn'    => $newFilename,
                        'on'    => $origName,
                        'notes' => $notes
                    ]);
                }

                sendJson([
                    'success' => true,
                    'message' => 'Tugas berhasil dikumpulkan!',
                    'filename' => $newFilename,
                    'original_name' => $origName
                ]);
            } catch (PDOException $e) {
                @unlink($targetPath);
                error_log('submit_assignment error: ' . $e->getMessage());
                sendJson(['success' => false, 'message' => 'Terjadi kesalahan database saat menyimpan tugas.'], 500);
            }
        } else {
            sendJson(['success' => false, 'message' => 'Gagal memindahkan file ke server.'], 500);
        }
        exit;
    }

    // 5. SISWA: BATALKAN PENGUMPULAN TUGAS
    if ($action === 'unsubmit_assignment') {
        $assignmentId = isset($body['assignment_id']) ? (int)$body['assignment_id'] : 0;
        if ($assignmentId <= 0) {
            sendJson(['success' => false, 'message' => 'ID tugas tidak valid.'], 400);
        }

        try {
            $stmt = $pdo->prepare("SELECT id, filename, status FROM assignment_submissions WHERE assignment_id = :aid AND student_id = :uid");
            $stmt->execute(['aid' => $assignmentId, 'uid' => $userId]);
            $sub = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$sub) {
                sendJson(['success' => false, 'message' => 'Pengumpulan tidak ditemukan.'], 404);
            }

            if ($sub['status'] === 'graded' && !$isAdmin) {
                sendJson(['success' => false, 'message' => 'Tugas sudah dinilai guru dan tidak dapat dibatalkan.'], 400);
            }

            $uploadDir = dirname(__DIR__) . '/uploads/assignments/';
            if ($sub['filename'] && file_exists($uploadDir . $sub['filename'])) {
                @unlink($uploadDir . $sub['filename']);
            }

            $delStmt = $pdo->prepare("DELETE FROM assignment_submissions WHERE id = :id");
            $delStmt->execute(['id' => $sub['id']]);

            sendJson(['success' => true, 'message' => 'Pengumpulan tugas dibatalkan.']);
        } catch (PDOException $e) {
            error_log('unsubmit_assignment error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal membatalkan pengumpulan.'], 500);
        }
        exit;
    }

    // 6. ADMIN: PENILAIAN PENGUMPULAN SISWA
    if ($action === 'grade_submission') {
        if (!$isAdmin) {
            sendJson(['success' => false, 'message' => 'Hanya admin atau guru yang dapat memberi nilai.'], 403);
        }

        $submissionId = isset($body['submission_id']) ? (int)$body['submission_id'] : 0;
        $grade        = isset($body['grade']) && $body['grade'] !== '' ? (int)$body['grade'] : null;
        $feedback     = isset($body['feedback']) ? trim($body['feedback']) : null;

        if ($submissionId <= 0) {
            sendJson(['success' => false, 'message' => 'ID submisi tidak valid.'], 400);
        }

        try {
            $stmt = $pdo->prepare("
                UPDATE assignment_submissions
                SET grade = :grade, feedback = :feedback, status = 'graded', graded_at = CURRENT_TIMESTAMP
                WHERE id = :id
            ");
            $stmt->execute([
                'grade'    => $grade,
                'feedback' => $feedback,
                'id'       => $submissionId
            ]);

            sendJson(['success' => true, 'message' => 'Nilai dan catatan berhasil disimpan.']);
        } catch (PDOException $e) {
            error_log('grade_submission error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal menyimpan nilai.'], 500);
        }
        exit;
    }

    // 7. SEMUA: TAMBAH KOMENTAR DISKUSI (KELAS ATAU PRIBADI)
    if ($action === 'add_comment') {
        $assignmentId    = isset($body['assignment_id']) ? (int)$body['assignment_id'] : 0;
        $content         = isset($body['content']) ? trim($body['content']) : '';
        $commentType     = isset($body['comment_type']) && in_array($body['comment_type'], ['class', 'private']) ? $body['comment_type'] : 'class';
        $targetStudentId = isset($body['target_student_id']) && (int)$body['target_student_id'] > 0 ? (int)$body['target_student_id'] : null;

        if ($assignmentId <= 0 || $content === '') {
            sendJson(['success' => false, 'message' => 'Isi komentar tidak boleh kosong.'], 400);
        }

        // Jika murid membuat komentar pribadi, target_student_id otomatis adalah dirinya sendiri
        if (!$isAdmin && $commentType === 'private') {
            $targetStudentId = $userId;
        }

        // Cek room access
        $assignStmt = $pdo->prepare("SELECT room_id FROM room_assignments WHERE id = :id");
        $assignStmt->execute(['id' => $assignmentId]);
        $roomId = (int)$assignStmt->fetchColumn();
        if ($roomId <= 0 || !verifyRoomAccess($pdo, $roomId, $userId, $isAdmin)) {
            sendJson(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        try {
            $stmt = $pdo->prepare("
                INSERT INTO assignment_comments (assignment_id, user_id, content, comment_type, target_student_id)
                VALUES (:aid, :uid, :content, :ctype, :tsid)
            ");
            $stmt->execute([
                'aid'     => $assignmentId,
                'uid'     => $userId,
                'content' => $content,
                'ctype'   => $commentType,
                'tsid'    => $targetStudentId
            ]);

            $newCommentId = (int)$pdo->lastInsertId();

            $commStmt = $pdo->prepare("
                SELECT c.id, c.assignment_id, c.user_id, c.content, c.comment_type, c.target_student_id, c.created_at,
                       u.full_name AS author_name, u.role AS author_role, u.avatar_url AS author_avatar
                FROM assignment_comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.id = :id
            ");
            $commStmt->execute(['id' => $newCommentId]);
            $newComment = $commStmt->fetch(PDO::FETCH_ASSOC);

            sendJson([
                'success' => true,
                'message' => 'Komentar terkirim!',
                'comment' => $newComment
            ]);
        } catch (PDOException $e) {
            error_log('add_comment error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal mengirim komentar.'], 500);
        }
        exit;
    }

    // 8. HAPUS KOMENTAR
    if ($action === 'delete_comment') {
        $commentId = isset($body['comment_id']) ? (int)$body['comment_id'] : 0;
        if ($commentId <= 0) {
            sendJson(['success' => false, 'message' => 'ID komentar tidak valid.'], 400);
        }

        try {
            $check = $pdo->prepare("SELECT user_id FROM assignment_comments WHERE id = :id");
            $check->execute(['id' => $commentId]);
            $ownerId = $check->fetchColumn();

            if (!$ownerId) {
                sendJson(['success' => false, 'message' => 'Komentar tidak ditemukan.'], 404);
            }

            if ($ownerId != $userId && !$isAdmin) {
                sendJson(['success' => false, 'message' => 'Anda tidak memiliki hak untuk menghapus komentar ini.'], 403);
            }

            $del = $pdo->prepare("DELETE FROM assignment_comments WHERE id = :id");
            $del->execute(['id' => $commentId]);

            sendJson(['success' => true, 'message' => 'Komentar berhasil dihapus.']);
        } catch (PDOException $e) {
            error_log('delete_comment error: ' . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Gagal menghapus komentar.'], 500);
        }
        exit;
    }

    sendJson(['success' => false, 'message' => 'Aksi POST tidak dikenali.'], 400);
}
