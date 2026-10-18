<?php
// api/admin/room-stats.php
// Ringkasan satu kelas untuk tab "Ringkasan" pada Class Workspace admin.

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan. Gunakan GET.'], 405);
}

requireAdmin();

$roomId = isset($_GET['room_id']) ? (int)$_GET['room_id'] : 0;
if ($roomId <= 0) {
    sendJson(['success' => false, 'message' => 'room_id wajib diberikan.'], 400);
}

/** Query scalar dengan parameter room_id; 0 bila tabel/kolom belum tersedia. */
function roomScalar(PDO $pdo, string $sql, int $roomId): int {
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['room_id' => $roomId]);
        return (int)$stmt->fetchColumn();
    } catch (PDOException $ex) {
        return 0;
    }
}

try {
    $stmt = $pdo->prepare("SELECT id, name, description, room_key, cover_image, is_active, created_at FROM rooms WHERE id = :id");
    $stmt->execute(['id' => $roomId]);
    $room = $stmt->fetch();
    if (!$room) {
        sendJson(['success' => false, 'message' => 'Kelas tidak ditemukan.'], 404);
    }

    $membersCount = roomScalar($pdo, "SELECT COUNT(*) FROM room_members WHERE room_id = :room_id", $roomId);

    $stats = [
        'members_count'      => $membersCount,
        'meetings_count'     => roomScalar($pdo, "SELECT COUNT(*) FROM room_meetings WHERE room_id = :room_id", $roomId),
        'books_count'        => roomScalar($pdo, "SELECT COUNT(*) FROM room_ecopedia WHERE room_id = :room_id", $roomId),
        'contacts_count'     => roomScalar($pdo, "SELECT COUNT(*) FROM room_contacts WHERE room_id = :room_id", $roomId),
        'lkm_total'          => roomScalar($pdo, "SELECT COUNT(*) FROM student_submissions WHERE room_id = :room_id", $roomId),
        'lkm_pending'        => roomScalar($pdo, "SELECT COUNT(*) FROM student_submissions WHERE room_id = :room_id AND status = 'pending'", $roomId),
        'videos_total'       => roomScalar($pdo, "SELECT COUNT(*) FROM eco_creation_videos WHERE room_id = :room_id", $roomId),
        'videos_pending'     => roomScalar($pdo, "SELECT COUNT(*) FROM eco_creation_videos WHERE room_id = :room_id AND status = 'pending'", $roomId),
        'sessions_total'     => roomScalar($pdo, "SELECT COUNT(*) FROM room_attendance_sessions WHERE room_id = :room_id", $roomId),
        'sessions_open'      => roomScalar($pdo, "SELECT COUNT(*) FROM room_attendance_sessions WHERE room_id = :room_id AND status = 'open' AND (closes_at IS NULL OR closes_at > NOW())", $roomId),
    ];

    // Rata-rata kehadiran: total "hadir" dibanding total slot (sesi × anggota)
    $hadirTotal = roomScalar($pdo, "
        SELECT COUNT(*) FROM room_attendance_records r
        JOIN room_attendance_sessions s ON s.id = r.session_id
        WHERE s.room_id = :room_id AND r.status = 'hadir'
    ", $roomId);
    $slots = $stats['sessions_total'] * $membersCount;
    $stats['attendance_rate'] = $slots > 0 ? (int)round(($hadirTotal / $slots) * 100) : 0;

    // Progres LKM per pertemuan
    $lkmPerMeeting = [];
    $stmt = $pdo->prepare("SELECT meeting_code, number, title FROM room_meetings WHERE room_id = :room_id ORDER BY number ASC");
    $stmt->execute(['room_id' => $roomId]);
    foreach ($stmt->fetchAll() as $m) {
        $q = $pdo->prepare("
            SELECT COUNT(*) AS submitted, COALESCE(SUM(status = 'graded'), 0) AS graded
            FROM student_submissions WHERE room_id = :room_id AND meeting_id = :code
        ");
        $q->execute(['room_id' => $roomId, 'code' => $m['meeting_code']]);
        $row = $q->fetch();
        $lkmPerMeeting[] = [
            'meeting_code' => $m['meeting_code'],
            'number'       => (int)$m['number'],
            'title'        => $m['title'],
            'submitted'    => (int)$row['submitted'],
            'graded'       => (int)$row['graded'],
        ];
    }

    // Aktivitas terbaru (LKM masuk)
    $recent = [];
    try {
        $stmt = $pdo->prepare("
            SELECT u.full_name AS who, ss.meeting_id, ss.status, ss.submitted_at
            FROM student_submissions ss JOIN users u ON u.id = ss.student_id
            WHERE ss.room_id = :room_id
            ORDER BY ss.submitted_at DESC LIMIT 6
        ");
        $stmt->execute(['room_id' => $roomId]);
        $recent = $stmt->fetchAll();
    } catch (PDOException $ex) {}

    sendJson([
        'success' => true,
        'room' => $room,
        'stats' => $stats,
        'lkm_per_meeting' => $lkmPerMeeting,
        'recent_submissions' => $recent
    ]);
} catch (PDOException $e) {
    error_log('room-stats error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Gagal memuat ringkasan kelas.'], 500);
}
