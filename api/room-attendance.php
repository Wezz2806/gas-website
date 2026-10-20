<?php
// api/room-attendance.php
// Absensi per kelas (berbasis sesi). Siswa melakukan check-in "Hadir" (dengan kode opsional),
// admin dapat membuka/menutup sesi, mengoreksi status (Hadir/Izin/Sakit/Alpa), dan melihat rekap.
// Murid yang tidak tercatat pada sesi dihitung Alpa saat rekap (dihitung, bukan disimpan).

require_once 'config.php';

$method  = $_SERVER['REQUEST_METHOD'];
$userId  = requireAuth();
$isAdmin = isset($_SESSION['user']) && $_SESSION['user']['role'] === 'admin';

const ATT_STATUSES = ['hadir', 'izin', 'sakit', 'alpa'];

/** Ekspresi SQL status efektif sesi (otomatis tertutup bila melewati closes_at). */
const EFFECTIVE_STATUS_SQL = "CASE WHEN s.status = 'open' AND (s.closes_at IS NULL OR s.closes_at > NOW()) THEN 'open' ELSE 'closed' END";

function attIsMember(PDO $pdo, int $roomId, int $userId): bool {
    $stmt = $pdo->prepare("SELECT 1 FROM room_members WHERE room_id = :r AND user_id = :u LIMIT 1");
    $stmt->execute(['r' => $roomId, 'u' => $userId]);
    return (bool)$stmt->fetchColumn();
}

function attRequireAdmin(bool $isAdmin): void {
    if (!$isAdmin) {
        sendJson(['success' => false, 'message' => 'Akses ditolak. Hanya admin yang dapat melakukan aksi ini.'], 403);
    }
}

function attGenerateCode(): string {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = '';
    for ($i = 0; $i < 5; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $code;
}

function attGetSession(PDO $pdo, int $sessionId): ?array {
    $stmt = $pdo->prepare("SELECT s.*, " . EFFECTIVE_STATUS_SQL . " AS effective_status FROM room_attendance_sessions s WHERE s.id = :id");
    $stmt->execute(['id' => $sessionId]);
    $row = $stmt->fetch();
    return $row ?: null;
}

if ($method === 'GET') {
    $action = isset($_GET['action']) ? trim($_GET['action']) : 'list_sessions';
    $roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;
    if ($roomId <= 0) {
        sendJson(['success' => false, 'message' => 'room_id wajib diberikan.'], 400);
    }

    if (!$isAdmin && !attIsMember($pdo, $roomId, $userId)) {
        sendJson(['success' => false, 'message' => 'Anda bukan anggota kelas ini.'], 403);
    }

    try {
        // ── Daftar sesi ───────────────────────────────────────────────
        if ($action === 'list_sessions') {
            $totalMembers = (int)$pdo->query("SELECT COUNT(*) FROM room_members WHERE room_id = " . $roomId)->fetchColumn();

            if ($isAdmin) {
                $stmt = $pdo->prepare("
                    SELECT s.id, s.room_id, s.meeting_id, s.title, s.session_date, s.access_code,
                           " . EFFECTIVE_STATUS_SQL . " AS status, s.opens_at, s.closes_at,
                           COALESCE(SUM(r.status = 'hadir'), 0) AS hadir_count,
                           COALESCE(SUM(r.status = 'izin'), 0)  AS izin_count,
                           COALESCE(SUM(r.status = 'sakit'), 0) AS sakit_count
                    FROM room_attendance_sessions s
                    LEFT JOIN room_attendance_records r ON r.session_id = s.id
                    WHERE s.room_id = :room_id
                    GROUP BY s.id
                    ORDER BY s.session_date DESC, s.id DESC
                ");
                $stmt->execute(['room_id' => $roomId]);
                $sessions = $stmt->fetchAll();
                foreach ($sessions as &$s) {
                    $s['id'] = (int)$s['id'];
                    $s['room_id'] = (int)$s['room_id'];
                    $s['has_code'] = !empty($s['access_code']);
                    $s['hadir_count'] = (int)$s['hadir_count'];
                    $s['izin_count'] = (int)$s['izin_count'];
                    $s['sakit_count'] = (int)$s['sakit_count'];
                    $s['total_members'] = $totalMembers;
                    $s['alpa_count'] = max(0, $totalMembers - $s['hadir_count'] - $s['izin_count'] - $s['sakit_count']);
                }
                unset($s);
                sendJson(['success' => true, 'sessions' => $sessions, 'total_members' => $totalMembers]);
            }

            // Siswa: sesi + status milik sendiri (kode akses tidak dikirim)
            $stmt = $pdo->prepare("
                SELECT s.id, s.room_id, s.meeting_id, s.title, s.session_date,
                       (s.access_code IS NOT NULL AND s.access_code <> '') AS has_code,
                       " . EFFECTIVE_STATUS_SQL . " AS status, s.opens_at, s.closes_at,
                       r.status AS my_status, r.note AS my_note, r.marked_by AS my_marked_by, r.checked_in_at AS my_checked_in_at
                FROM room_attendance_sessions s
                LEFT JOIN room_attendance_records r ON r.session_id = s.id AND r.student_id = :uid
                WHERE s.room_id = :room_id
                ORDER BY s.session_date DESC, s.id DESC
            ");
            $stmt->execute(['room_id' => $roomId, 'uid' => $userId]);
            $sessions = $stmt->fetchAll();

            $summary = ['total' => count($sessions), 'hadir' => 0, 'izin' => 0, 'sakit' => 0, 'alpa' => 0];
            foreach ($sessions as &$s) {
                $s['id'] = (int)$s['id'];
                $s['room_id'] = (int)$s['room_id'];
                $s['has_code'] = (bool)$s['has_code'];
                if ($s['my_status']) {
                    $summary[$s['my_status']]++;
                } elseif ($s['status'] === 'closed') {
                    // Sesi tertutup tanpa catatan dihitung Alpa
                    $summary['alpa']++;
                    $s['my_status'] = 'alpa';
                    $s['my_marked_by'] = null;
                }
            }
            unset($s);
            // Sesi yang masih terbuka dan belum diisi tidak dihitung dulu
            $counted = $summary['hadir'] + $summary['izin'] + $summary['sakit'] + $summary['alpa'];
            $summary['counted'] = $counted;
            $summary['percentage'] = $counted > 0 ? round(($summary['hadir'] / $counted) * 100) : 0;

            sendJson(['success' => true, 'sessions' => $sessions, 'summary' => $summary]);
        }

        // ── Detail satu sesi (admin): daftar murid + statusnya ────────
        if ($action === 'session_detail') {
            attRequireAdmin($isAdmin);
            $sessionId = isset($_GET['session_id']) ? (int)$_GET['session_id'] : 0;
            $session = attGetSession($pdo, $sessionId);
            if (!$session || (int)$session['room_id'] !== $roomId) {
                sendJson(['success' => false, 'message' => 'Sesi tidak ditemukan.'], 404);
            }

            $stmt = $pdo->prepare("
                SELECT u.id, u.full_name, u.email, u.avatar_url,
                       r.status, r.note, r.marked_by, r.checked_in_at
                FROM room_members rm
                JOIN users u ON u.id = rm.user_id
                LEFT JOIN room_attendance_records r ON r.session_id = :sid AND r.student_id = u.id
                WHERE rm.room_id = :room_id
                ORDER BY u.full_name ASC
            ");
            $stmt->execute(['sid' => $sessionId, 'room_id' => $roomId]);

            sendJson([
                'success' => true,
                'session' => [
                    'id' => (int)$session['id'],
                    'title' => $session['title'],
                    'session_date' => $session['session_date'],
                    'access_code' => $session['access_code'],
                    'status' => $session['effective_status'],
                ],
                'students' => $stmt->fetchAll()
            ]);
        }

        // ── Rekap matriks (admin) ─────────────────────────────────────
        if ($action === 'recap') {
            attRequireAdmin($isAdmin);

            $stmt = $pdo->prepare("
                SELECT s.id, s.title, s.session_date, " . EFFECTIVE_STATUS_SQL . " AS status
                FROM room_attendance_sessions s
                WHERE s.room_id = :room_id
                ORDER BY s.session_date ASC, s.id ASC
            ");
            $stmt->execute(['room_id' => $roomId]);
            $sessions = $stmt->fetchAll();

            $stmt = $pdo->prepare("
                SELECT u.id, u.full_name, u.email, u.avatar_url
                FROM room_members rm JOIN users u ON u.id = rm.user_id
                WHERE rm.room_id = :room_id ORDER BY u.full_name ASC
            ");
            $stmt->execute(['room_id' => $roomId]);
            $members = $stmt->fetchAll();

            $stmt = $pdo->prepare("
                SELECT r.session_id, r.student_id, r.status, r.note
                FROM room_attendance_records r
                JOIN room_attendance_sessions s ON s.id = r.session_id
                WHERE s.room_id = :room_id
            ");
            $stmt->execute(['room_id' => $roomId]);

            sendJson([
                'success' => true,
                'sessions' => $sessions,
                'members' => $members,
                'records' => $stmt->fetchAll()
            ]);
        }

        sendJson(['success' => false, 'message' => 'Aksi tidak dikenal.'], 400);
    } catch (PDOException $e) {
        error_log('room-attendance GET error: ' . $e->getMessage());
        sendJson(['success' => false, 'message' => 'Gagal memuat data absensi.'], 500);
    }
}

if ($method === 'POST') {
    $body   = getRequestBody();
    $action = isset($body['action']) ? trim($body['action']) : '';

    try {
        // ── Siswa: check-in (Hadir / Izin / Sakit) ────────────────────
        if ($action === 'check_in') {
            $sessionId = isset($body['session_id']) ? (int)$body['session_id'] : 0;
            $code      = isset($body['access_code']) ? strtoupper(trim($body['access_code'])) : '';
            $status    = isset($body['status']) ? strtolower(trim($body['status'])) : 'hadir';
            $note      = isset($body['note']) && trim($body['note']) !== '' ? trim($body['note']) : null;

            if (!in_array($status, ['hadir', 'izin', 'sakit'])) {
                $status = 'hadir';
            }

            $session = attGetSession($pdo, $sessionId);
            if (!$session) {
                sendJson(['success' => false, 'message' => 'Sesi absensi tidak ditemukan.'], 404);
            }
            if (!attIsMember($pdo, (int)$session['room_id'], $userId)) {
                sendJson(['success' => false, 'message' => 'Anda bukan anggota kelas ini.'], 403);
            }
            if ($session['effective_status'] !== 'open') {
                sendJson(['success' => false, 'message' => 'Sesi absensi sudah ditutup.'], 400);
            }

            // Kode absensi wajib jika status Hadir dan sesi memiliki kode akses
            if ($status === 'hadir' && !empty($session['access_code']) && strtoupper($session['access_code']) !== $code) {
                sendJson(['success' => false, 'message' => 'Kode absensi salah atau belum diisi.'], 400);
            }

            // Jika status izin atau sakit, keterangan/alasan wajib diisi
            if (($status === 'izin' || $status === 'sakit') && empty($note)) {
                $label = $status === 'izin' ? 'Izin' : 'Sakit';
                sendJson(['success' => false, 'message' => "Mohon sertakan alasan/keterangan {$label} Anda."], 400);
            }

            $stmt = $pdo->prepare("SELECT status, marked_by FROM room_attendance_records WHERE session_id = :sid AND student_id = :uid");
            $stmt->execute(['sid' => $sessionId, 'uid' => $userId]);
            $existing = $stmt->fetch();
            if ($existing) {
                $msg = $existing['marked_by'] === 'admin'
                    ? 'Kehadiran Anda sudah dicatat oleh guru (' . ucfirst($existing['status']) . ').'
                    : 'Anda sudah melakukan absensi pada sesi ini (' . ucfirst($existing['status']) . ').';
                sendJson(['success' => false, 'message' => $msg], 400);
            }

            $stmt = $pdo->prepare("
                INSERT INTO room_attendance_records (session_id, student_id, status, note, marked_by)
                VALUES (:sid, :uid, :status, :note, 'self')
            ");
            $stmt->execute([
                'sid' => $sessionId,
                'uid' => $userId,
                'status' => $status,
                'note' => $note
            ]);

            $label = $status === 'hadir' ? 'Hadir' : ($status === 'izin' ? 'Izin' : 'Sakit');
            sendJson(['success' => true, 'message' => "Absensi berhasil. Anda tercatat {$label}."]);
        }

        // ── Aksi admin ────────────────────────────────────────────────
        attRequireAdmin($isAdmin);

        if ($action === 'create_session') {
            $roomId    = isset($body['room_id']) ? (int)$body['room_id'] : 0;
            $title     = isset($body['title']) ? trim($body['title']) : '';
            $date      = isset($body['session_date']) && $body['session_date'] !== '' ? trim($body['session_date']) : date('Y-m-d');
            $meetingId = isset($body['meeting_id']) && $body['meeting_id'] !== '' ? trim($body['meeting_id']) : null;
            $code      = isset($body['access_code']) ? strtoupper(trim($body['access_code'])) : '';
            $duration  = isset($body['duration_minutes']) ? (int)$body['duration_minutes'] : 0;

            if ($roomId <= 0 || $title === '') {
                sendJson(['success' => false, 'message' => 'Kelas dan judul sesi wajib diisi.'], 400);
            }
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                sendJson(['success' => false, 'message' => 'Format tanggal tidak valid.'], 400);
            }
            if (!empty($body['generate_code']) && $code === '') {
                $code = attGenerateCode();
            }

            $closesSql = $duration > 0 ? "DATE_ADD(NOW(), INTERVAL " . (int)$duration . " MINUTE)" : "NULL";
            $stmt = $pdo->prepare("
                INSERT INTO room_attendance_sessions (room_id, meeting_id, title, session_date, access_code, status, closes_at, created_by)
                VALUES (:room_id, :meeting_id, :title, :session_date, :code, 'open', $closesSql, :admin)
            ");
            $stmt->execute([
                'room_id' => $roomId, 'meeting_id' => $meetingId, 'title' => $title,
                'session_date' => $date, 'code' => $code !== '' ? $code : null, 'admin' => $userId
            ]);

            sendJson(['success' => true, 'message' => 'Sesi absensi dibuka.', 'session_id' => (int)$pdo->lastInsertId()]);
        }

        if ($action === 'update_session') {
            $sessionId = isset($body['session_id']) ? (int)$body['session_id'] : 0;
            $title     = isset($body['title']) ? trim($body['title']) : '';
            $date      = isset($body['session_date']) ? trim($body['session_date']) : '';
            $code      = isset($body['access_code']) ? strtoupper(trim($body['access_code'])) : '';
            if ($sessionId <= 0 || $title === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                sendJson(['success' => false, 'message' => 'Data sesi tidak valid.'], 400);
            }
            $stmt = $pdo->prepare("UPDATE room_attendance_sessions SET title = :t, session_date = :d, access_code = :c WHERE id = :id");
            $stmt->execute(['t' => $title, 'd' => $date, 'c' => $code !== '' ? $code : null, 'id' => $sessionId]);
            sendJson(['success' => true, 'message' => 'Sesi absensi diperbarui.']);
        }

        if ($action === 'set_status') {
            $sessionId = isset($body['session_id']) ? (int)$body['session_id'] : 0;
            $status    = isset($body['status']) ? trim($body['status']) : '';
            if ($sessionId <= 0 || !in_array($status, ['open', 'closed'], true)) {
                sendJson(['success' => false, 'message' => 'Parameter tidak valid.'], 400);
            }
            if ($status === 'open') {
                // Buka kembali: hapus batas waktu lama agar benar-benar terbuka
                $stmt = $pdo->prepare("UPDATE room_attendance_sessions SET status = 'open', closes_at = NULL WHERE id = :id");
            } else {
                $stmt = $pdo->prepare("UPDATE room_attendance_sessions SET status = 'closed', closes_at = NOW() WHERE id = :id");
            }
            $stmt->execute(['id' => $sessionId]);
            sendJson(['success' => true, 'message' => $status === 'open' ? 'Sesi dibuka kembali.' : 'Sesi ditutup.']);
        }

        if ($action === 'delete_session') {
            $sessionId = isset($body['session_id']) ? (int)$body['session_id'] : 0;
            if ($sessionId <= 0) {
                sendJson(['success' => false, 'message' => 'ID sesi tidak valid.'], 400);
            }
            $pdo->prepare("DELETE FROM room_attendance_records WHERE session_id = :id")->execute(['id' => $sessionId]);
            $pdo->prepare("DELETE FROM room_attendance_sessions WHERE id = :id")->execute(['id' => $sessionId]);
            sendJson(['success' => true, 'message' => 'Sesi absensi dihapus.']);
        }

        if ($action === 'mark') {
            $sessionId = isset($body['session_id']) ? (int)$body['session_id'] : 0;
            $studentId = isset($body['student_id']) ? (int)$body['student_id'] : 0;
            $status    = isset($body['status']) ? trim($body['status']) : '';
            $note      = isset($body['note']) ? mb_substr(trim($body['note']), 0, 255) : '';

            $session = attGetSession($pdo, $sessionId);
            if (!$session || $studentId <= 0) {
                sendJson(['success' => false, 'message' => 'Sesi atau murid tidak valid.'], 400);
            }
            if (!attIsMember($pdo, (int)$session['room_id'], $studentId)) {
                sendJson(['success' => false, 'message' => 'Murid bukan anggota kelas ini.'], 400);
            }

            // status kosong = hapus catatan (kembali ke "belum tercatat")
            if ($status === '') {
                $pdo->prepare("DELETE FROM room_attendance_records WHERE session_id = :sid AND student_id = :uid")
                    ->execute(['sid' => $sessionId, 'uid' => $studentId]);
                sendJson(['success' => true, 'message' => 'Catatan absensi dihapus.']);
            }
            if (!in_array($status, ATT_STATUSES, true)) {
                sendJson(['success' => false, 'message' => 'Status absensi tidak valid.'], 400);
            }

            $stmt = $pdo->prepare("
                INSERT INTO room_attendance_records (session_id, student_id, status, note, marked_by)
                VALUES (:sid, :uid, :status, :note, 'admin')
                ON DUPLICATE KEY UPDATE status = VALUES(status), note = VALUES(note), marked_by = 'admin'
            ");
            $stmt->execute(['sid' => $sessionId, 'uid' => $studentId, 'status' => $status, 'note' => $note !== '' ? $note : null]);
            sendJson(['success' => true, 'message' => 'Status absensi disimpan.']);
        }

        // Tandai semua murid yang belum tercatat dengan satu status
        if ($action === 'bulk_mark') {
            $sessionId = isset($body['session_id']) ? (int)$body['session_id'] : 0;
            $status    = isset($body['status']) ? trim($body['status']) : '';
            $session   = attGetSession($pdo, $sessionId);
            if (!$session || !in_array($status, ATT_STATUSES, true)) {
                sendJson(['success' => false, 'message' => 'Parameter tidak valid.'], 400);
            }
            $stmt = $pdo->prepare("
                INSERT INTO room_attendance_records (session_id, student_id, status, marked_by)
                SELECT :sid, rm.user_id, :status, 'admin'
                FROM room_members rm
                WHERE rm.room_id = :room_id
                  AND NOT EXISTS (SELECT 1 FROM room_attendance_records r WHERE r.session_id = :sid2 AND r.student_id = rm.user_id)
            ");
            $stmt->execute(['sid' => $sessionId, 'status' => $status, 'room_id' => (int)$session['room_id'], 'sid2' => $sessionId]);
            sendJson(['success' => true, 'message' => 'Murid yang belum tercatat ditandai ' . $status . '.', 'affected' => $stmt->rowCount()]);
        }

        sendJson(['success' => false, 'message' => 'Aksi tidak dikenal.'], 400);
    } catch (PDOException $e) {
        error_log('room-attendance POST error: ' . $e->getMessage());
        sendJson(['success' => false, 'message' => 'Gagal memproses absensi.'], 500);
    }
}

sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan.'], 405);
