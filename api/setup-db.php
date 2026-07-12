<?php
// api/setup-db.php
// TEMPORARY: Hapus file ini setelah setup berhasil!

// Simple secret key protection - akses via: /api/setup-db.php?key=gas2026setup
$secret = 'gas2026setup';
if (($_GET['key'] ?? '') !== $secret) {
    http_response_code(403);
    die(json_encode(['error' => 'Forbidden']));
}

header('Content-Type: text/plain; charset=utf-8');

$db_host = getenv('MYSQLHOST')     ?: 'localhost';
$db_name = getenv('MYSQLDATABASE') ?: 'railway';
$db_user = getenv('MYSQLUSER')     ?: 'root';
$db_pass = getenv('MYSQLPASSWORD') ?: '';
$db_port = getenv('MYSQLPORT')     ?: '3306';

try {
    $pdo = new PDO(
        "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8mb4",
        $db_user, $db_pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    die("DB Connection failed: " . $e->getMessage());
}

$statements = [
    "CREATE TABLE IF NOT EXISTS users (
        id            INT            AUTO_INCREMENT PRIMARY KEY,
        full_name     VARCHAR(100)   NOT NULL,
        email         VARCHAR(150)   NOT NULL UNIQUE,
        password_hash VARCHAR(255)   DEFAULT NULL,
        role          ENUM('student','admin') NOT NULL DEFAULT 'student',
        avatar_url    VARCHAR(500)   DEFAULT NULL,
        eco_points    INT            NOT NULL DEFAULT 0,
        streak        INT            NOT NULL DEFAULT 0,
        auth_provider ENUM('local','google') NOT NULL DEFAULT 'local',
        google_id     VARCHAR(255)   DEFAULT NULL UNIQUE,
        last_login    TIMESTAMP      NULL,
        last_checkin  DATE           DEFAULT NULL,
        created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email        (email),
        INDEX idx_role         (role),
        INDEX idx_eco_points   (eco_points DESC),
        INDEX idx_auth_provider (auth_provider)
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS password_resets (
        id         INT          AUTO_INCREMENT PRIMARY KEY,
        email      VARCHAR(150) NOT NULL,
        otp_code   VARCHAR(6)   NOT NULL,
        expires_at TIMESTAMP    NOT NULL,
        used       TINYINT(1)   NOT NULL DEFAULT 0,
        created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_otp (email, otp_code),
        INDEX idx_expires   (expires_at)
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS student_submissions (
        id            INT          AUTO_INCREMENT PRIMARY KEY,
        student_id    INT          NOT NULL,
        meeting_id    VARCHAR(50)  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        filename      VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        grade         TINYINT UNSIGNED DEFAULT NULL,
        teacher_comment TEXT        DEFAULT NULL,
        status        ENUM('pending','graded') NOT NULL DEFAULT 'pending',
        submitted_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        graded_at     TIMESTAMP    NULL,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_student_meeting (student_id, meeting_id),
        INDEX idx_status          (status)
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS eco_challenge_evaluations (
        id              INT        AUTO_INCREMENT PRIMARY KEY,
        teacher_id      INT        NOT NULL,
        evaluation_text TEXT       NOT NULL,
        published_at    TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS eco_challenge_comments (
        id             INT          AUTO_INCREMENT PRIMARY KEY,
        evaluation_id  INT          NOT NULL,
        student_id     INT          NOT NULL,
        content        TEXT         NOT NULL,
        created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (evaluation_id) REFERENCES eco_challenge_evaluations(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id)    REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_evaluation (evaluation_id),
        INDEX idx_student    (student_id)
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS eco_creation_videos (
        id            INT          AUTO_INCREMENT PRIMARY KEY,
        student_id    INT          NOT NULL,
        title         VARCHAR(300) NOT NULL,
        category      VARCHAR(100) NOT NULL DEFAULT 'Umum',
        duration      VARCHAR(10)  DEFAULT NULL,
        filename      VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        status        ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        reject_reason VARCHAR(500) DEFAULT NULL,
        views         INT          NOT NULL DEFAULT 0,
        likes         INT          NOT NULL DEFAULT 0,
        submitted_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        approved_at   TIMESTAMP    NULL,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_student (student_id),
        INDEX idx_status  (status)
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS eco_contact_messages (
        id           INT          AUTO_INCREMENT PRIMARY KEY,
        student_id   INT          NOT NULL,
        student_name VARCHAR(100) NOT NULL,
        subject      VARCHAR(300) NOT NULL,
        message      TEXT         NOT NULL,
        is_read      TINYINT(1)   NOT NULL DEFAULT 0,
        replied_at   TIMESTAMP    NULL,
        created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_student (student_id),
        INDEX idx_is_read (is_read)
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS eco_points_log (
        id         INT          AUTO_INCREMENT PRIMARY KEY,
        user_id    INT          NOT NULL,
        points     SMALLINT     NOT NULL,
        reason     VARCHAR(200) NOT NULL,
        created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user    (user_id)
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS eco_creation_video_comments (
        id          INT          AUTO_INCREMENT PRIMARY KEY,
        video_id    INT          NOT NULL,
        student_id  INT          NOT NULL,
        content     TEXT         NOT NULL,
        created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (video_id)   REFERENCES eco_creation_videos(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_video   (video_id),
        INDEX idx_student (student_id)
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
];

$success = 0;
$errors = [];

foreach ($statements as $i => $sql) {
    try {
        $pdo->exec($sql);
        $success++;
        echo "✅ Statement " . ($i + 1) . " OK\n";
    } catch (PDOException $e) {
        $errors[] = "❌ Statement " . ($i + 1) . ": " . $e->getMessage();
        echo end($errors) . "\n";
    }
}

echo "\n=============================\n";
echo "Done: $success/" . count($statements) . " statements executed.\n";
if (!empty($errors)) {
    echo "Errors:\n" . implode("\n", $errors) . "\n";
} else {
    echo "✅ All tables created successfully!\n";
    echo "⚠️  PENTING: Hapus file api/setup-db.php dari repo setelah ini!\n";
}
