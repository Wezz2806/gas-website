<?php
// api/admin/dashboard-stats.php
// Ringkasan lintas kelas untuk Dashboard Admin: statistik, ringkasan per kelas,
// daftar "perlu tindakan" (LKM belum dinilai / video menunggu review) & aktivitas terbaru.

require_once '../config.php';

// Pastikan hanya menerima request GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan GET.'
    ], 405);
}

// Proteksi Sesi & Akses Admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Endpoint ini hanya untuk Administrator.'
    ], 403);
}

/**
 * Menjalankan query scalar dengan aman (mengembalikan 0 bila tabel/kolom belum ada).
 */
function safeScalar(PDO $pdo, string $sql): int {
    try {
        return (int)$pdo->query($sql)->fetchColumn();
    } catch (PDOException $ex) {
        return 0;
    }
}

try {
    // 1. Statistik pengguna
    $userStats = $pdo->query("
        SELECT
            SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as total_students,
            SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
            COUNT(*) as total_users
        FROM users
    ")->fetch();

    // 2. Statistik modul (lintas kelas)
    $stats = [
        'total_users'         => (int)($userStats['total_users'] ?? 0),
        'total_students'      => (int)($userStats['total_students'] ?? 0),
        'total_admins'        => (int)($userStats['total_admins'] ?? 0),
        'total_rooms'         => safeScalar($pdo, "SELECT COUNT(*) FROM rooms"),
        'active_rooms'        => safeScalar($pdo, "SELECT COUNT(*) FROM rooms WHERE is_active = 1"),
        'total_submissions'   => safeScalar($pdo, "SELECT COUNT(*) FROM student_submissions"),
        'pending_submissions' => safeScalar($pdo, "SELECT COUNT(*) FROM student_submissions WHERE status = 'pending'"),
        'total_videos'        => safeScalar($pdo, "SELECT COUNT(*) FROM eco_creation_videos"),
        'pending_videos'      => safeScalar($pdo, "SELECT COUNT(*) FROM eco_creation_videos WHERE status = 'pending'"),
        'total_journals'      => safeScalar($pdo, "SELECT COUNT(DISTINCT student_id) FROM sustainability_journals"),
        'total_surveys'       => safeScalar($pdo, "SELECT COUNT(*) FROM student_surveys"),
        'total_tests'         => safeScalar($pdo, "SELECT COUNT(*) FROM student_tests WHERE submitted = 1"),
        'open_attendance'     => safeScalar($pdo, "SELECT COUNT(*) FROM room_attendance_sessions WHERE status = 'open'"),
    ];

    // 3. Ringkasan per kelas
    $rooms = [];
    try {
        $rooms = $pdo->query("
            SELECT r.id, r.name, r.room_key, r.cover_image, r.is_active,
                   (SELECT COUNT(*) FROM room_members rm WHERE rm.room_id = r.id) AS members_count,
                   (SELECT COUNT(*) FROM student_submissions ss WHERE ss.room_id = r.id AND ss.status = 'pending') AS pending_lkm,
                   (SELECT COUNT(*) FROM eco_creation_videos ev WHERE ev.room_id = r.id AND ev.status = 'pending') AS pending_videos,
                   (SELECT COUNT(*) FROM room_attendance_sessions s WHERE s.room_id = r.id AND s.status = 'open') AS open_sessions
            FROM rooms r
            ORDER BY r.is_active DESC, r.created_at DESC
        ")->fetchAll();
    } catch (PDOException $ex) {
        error_log('dashboard rooms summary error: ' . $ex->getMessage());
    }

    // 4. Aktivitas terbaru (digabung di PHP agar aman dari konflik collation UNION)
    $activity = [];
    try {
        $rows = $pdo->query("
            SELECT ss.submitted_at AS at_time, u.full_name AS who, ss.meeting_id AS ref, r.name AS room_name, r.id AS room_id
            FROM student_submissions ss
            JOIN users u ON u.id = ss.student_id
            LEFT JOIN rooms r ON r.id = ss.room_id
            ORDER BY ss.submitted_at DESC LIMIT 8
        ")->fetchAll();
        foreach ($rows as $row) {
            $activity[] = [
                'type' => 'lkm',
                'text' => $row['who'] . ' mengumpulkan LKM (' . $row['ref'] . ')',
                'room_id' => $row['room_id'] ? (int)$row['room_id'] : null,
                'room_name' => $row['room_name'],
                'at' => $row['at_time']
            ];
        }
    } catch (PDOException $ex) {}

    try {
        $rows = $pdo->query("
            SELECT ev.submitted_at AS at_time, u.full_name AS who, ev.title AS ref, r.name AS room_name, r.id AS room_id
            FROM eco_creation_videos ev
            JOIN users u ON u.id = ev.student_id
            LEFT JOIN rooms r ON r.id = ev.room_id
            ORDER BY ev.submitted_at DESC LIMIT 8
        ")->fetchAll();
        foreach ($rows as $row) {
            $activity[] = [
                'type' => 'video',
                'text' => $row['who'] . ' mengunggah video "' . $row['ref'] . '"',
                'room_id' => $row['room_id'] ? (int)$row['room_id'] : null,
                'room_name' => $row['room_name'],
                'at' => $row['at_time']
            ];
        }
    } catch (PDOException $ex) {}

    try {
        $rows = $pdo->query("
            SELECT rm.joined_at AS at_time, u.full_name AS who, r.name AS room_name, r.id AS room_id
            FROM room_members rm
            JOIN users u ON u.id = rm.user_id
            JOIN rooms r ON r.id = rm.room_id
            ORDER BY rm.joined_at DESC LIMIT 8
        ")->fetchAll();
        foreach ($rows as $row) {
            $activity[] = [
                'type' => 'join',
                'text' => $row['who'] . ' bergabung ke kelas',
                'room_id' => (int)$row['room_id'],
                'room_name' => $row['room_name'],
                'at' => $row['at_time']
            ];
        }
    } catch (PDOException $ex) {}

    usort($activity, function ($a, $b) {
        return strcmp((string)$b['at'], (string)$a['at']);
    });
    $activity = array_slice($activity, 0, 10);

    sendJson([
        'success' => true,
        'stats' => $stats,
        'rooms' => $rooms,
        'activity' => $activity
    ]);

} catch (PDOException $e) {
    error_log('dashboard-stats error: ' . $e->getMessage());
    sendJson([
        'success' => false,
        'message' => 'Terjadi kesalahan basis data saat memuat statistik.'
    ], 500);
}
