<?php
// api/add-comment.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Metode request tidak diizinkan.'], 405);
}

$user_id = getAuthUserId();
if ($user_id === null) {
    sendJson(['success' => false, 'message' => 'Sesi tidak aktif. Silakan login terlebih dahulu.'], 401);
}

$data = getRequestBody();
$content = trim($data['content'] ?? '');

if (empty($content)) {
    sendJson(['success' => false, 'message' => 'Komentar tidak boleh kosong.'], 400);
}

    $roomId = isset($data['room_id']) ? (int)$data['room_id'] : null;
    if ($roomId <= 0) {
        $roomId = null;
    }

    // Simpan komentar ke database
    $stmt = $pdo->prepare(
        "INSERT INTO eco_challenge_comments (evaluation_id, student_id, room_id, content) 
         VALUES (1, :student_id, :room_id, :content)"
    );
    $stmt->execute([
        'student_id' => $user_id,
        'room_id' => $roomId,
        'content' => $content
    ]);

    $inserted_id = $pdo->lastInsertId();

    $stmt_user = $pdo->prepare("SELECT full_name FROM users WHERE id = :id");
    $stmt_user->execute(['id' => $user_id]);
    $author = $stmt_user->fetchColumn() ?: 'Murid';

    sendJson([
        'success' => true,
        'message' => 'Komentar berhasil dikirim.',
        'comment' => [
            'id' => (int)$inserted_id,
            'student_id' => $user_id,
            'author' => $author,
            'content' => $content,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
} catch (PDOException $e) {
    error_log('add-comment.php error: ' . $e->getMessage());
    sendJson(['success' => false, 'message' => 'Kesalahan database saat mengirim komentar.'], 500);
}
