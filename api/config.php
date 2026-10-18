<?php
// api/config.php

/*
 * SECURITY & PERFORMANCE:
 * - Error display is OFF. Errors are logged to file, not shown to users.
 */
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Detect environment — Railway otomatis set RAILWAY_ENVIRONMENT / RAILWAY_ENVIRONMENT_NAME
$is_production = (
    getenv('ENVIRONMENT') === 'production' ||
    getenv('RAILWAY_ENVIRONMENT') !== false ||
    getenv('RAILWAY_ENVIRONMENT_NAME') !== false ||
    getenv('RAILWAY_SERVICE_ID') !== false ||
    (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'localhost') === false && strpos($_SERVER['HTTP_HOST'], '127.0.0.1') === false) ||
    (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
);

// Set CORS headers dynamically based on Origin header to prevent CORS issues
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://gas-website.netlify.app',
    'https://gaslearn.netlify.app',
    'https://gas-website-production-46db.up.railway.app',
];

$frontend_env = getenv('FRONTEND_URL');
if ($frontend_env) {
    $custom_origins = array_map('trim', explode(',', $frontend_env));
    $allowed_origins = array_merge($allowed_origins, $custom_origins);
}

if (in_array($origin, $allowed_origins)) {
    $allowed_origin = $origin;
} else if ($origin && (strpos($origin, 'netlify.app') !== false || strpos($origin, 'vercel.app') !== false || strpos($origin, 'railway.app') !== false)) {
    $allowed_origin = $origin;
} else {
    $allowed_origin = $frontend_env ?: 'https://gaslearn.netlify.app';
}
header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Session-Token");
header("Access-Control-Expose-Headers: Authorization, X-Session-Token");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Handle preflight requests — return immediately, no DB needed
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── SESSION CONFIGURATION ───────────────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 86400 * 7,   // 7 hari
        'path'     => '/',
        'secure'   => $is_production, // HTTPS-only di production
        'httponly' => true,
        // PENTING: 'None' wajib untuk cross-origin (Netlify ↔ Railway)
        // 'Lax' tidak akan bisa kirim cookie lintas domain
        'samesite' => $is_production ? 'None' : 'Lax',
    ]);
    session_start();
}

// ── DATABASE CONNECTION ──────────────────────────────────────────────────────
// Railway mendukung MYSQL_URL / DATABASE_URL atau variabel terpisah (MYSQLHOST, dsb.)
$database_url = getenv('MYSQL_URL') ?: getenv('DATABASE_URL') ?: '';
if ($database_url) {
    $parsed_db = parse_url($database_url);
    $db_host = $parsed_db['host'] ?? 'localhost';
    $db_port = $parsed_db['port'] ?? 3306;
    $db_user = $parsed_db['user'] ?? 'root';
    $db_pass = $parsed_db['pass'] ?? '';
    $db_name = ltrim($parsed_db['path'] ?? 'gas_website', '/');
} else {
    $db_host = getenv('MYSQLHOST')     ?: getenv('DB_HOST') ?: 'localhost';
    $db_name = getenv('MYSQLDATABASE') ?: getenv('DB_NAME') ?: 'gas_website';
    $db_user = getenv('MYSQLUSER')     ?: getenv('DB_USER') ?: 'root';
    $db_pass = getenv('MYSQLPASSWORD') ?: getenv('DB_PASS') ?: '';
    $db_port = getenv('MYSQLPORT')     ?: getenv('DB_PORT') ?: '3306';
}

try {
    $pdo = new PDO(
        "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_PERSISTENT         => true,
        ]
    );
} catch (PDOException $e) {
    // Log full error, return safe message to client
    error_log('DB Connection failed: ' . $e->getMessage());
    sendJson([
        'success' => false,
        'message' => 'Koneksi database gagal. Silakan coba beberapa saat lagi.',
    ], 503);
}

// ── TOKEN-BASED AUTH & SESSION HELPERS ───────────────────────────────────────

/**
 * Secret key for signing auth tokens (JWT HS256)
 */
function getAuthSecret(): string {
    return getenv('AUTH_SECRET') ?: getenv('JWT_SECRET') ?: 'gas_jwt_secret_key_sustainability_2024_secure';
}

/**
 * Base64 URL-safe encode
 */
function base64UrlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Base64 URL-safe decode
 */
function base64UrlDecode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Generate a signed auth token for a user
 */
function generateAuthToken(array $user): string {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'uid'   => (int)$user['id'],
        'email' => $user['email'] ?? '',
        'role'  => $user['role'] ?? 'student',
        'iat'   => time(),
        'exp'   => time() + (86400 * 14) // 14 hari
    ]);

    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, getAuthSecret(), true);
    $base64UrlSignature = base64UrlEncode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * Verify and decode signed auth token
 */
function verifyAuthToken(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;

    $signature = base64UrlDecode($base64UrlSignature);
    $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, getAuthSecret(), true);

    if (!hash_equals($expectedSignature, $signature)) {
        return null;
    }

    $payload = json_decode(base64UrlDecode($base64UrlPayload), true);
    if (!is_array($payload) || !isset($payload['uid']) || !isset($payload['exp'])) {
        return null;
    }

    if (time() > $payload['exp']) {
        return null; // Expired
    }

    return $payload;
}

// ── TOKEN-BASED SESSION RESTORATION (FOR INCOGNITO / 3RD-PARTY COOKIE BLOCKS) ─
// Modern browsers (termasuk Chrome Incognito & Safari) memblokir third-party cookie secara default.
// Jika session cookie tidak terkirim, kita pulihkan session dari Authorization Bearer atau X-Session-Token.
if (!isset($_SESSION['user']) || empty($_SESSION['user']['id'])) {
    $incomingToken = null;
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        $incomingToken = $matches[1];
    } elseif (!empty($_SERVER['HTTP_X_SESSION_TOKEN'])) {
        $incomingToken = trim($_SERVER['HTTP_X_SESSION_TOKEN']);
    }

    if ($incomingToken) {
        $tokenPayload = verifyAuthToken($incomingToken);
        if ($tokenPayload && isset($tokenPayload['uid'])) {
            try {
                $stmtAuth = $pdo->prepare("SELECT id, full_name, email, role, avatar_url, auth_provider FROM users WHERE id = :id LIMIT 1");
                $stmtAuth->execute(['id' => (int)$tokenPayload['uid']]);
                $authUser = $stmtAuth->fetch();
                if ($authUser) {
                    $userRole = (strtolower(trim($authUser['email'])) === 'admin@gmail.com') ? 'admin' : $authUser['role'];
                    $_SESSION['user'] = [
                        'id'            => (int)$authUser['id'],
                        'full_name'     => $authUser['full_name'],
                        'email'         => $authUser['email'],
                        'role'          => $userRole,
                        'avatar_url'    => $authUser['avatar_url'],
                        'auth_provider' => $authUser['auth_provider'],
                    ];
                    $_SESSION['user_cached_at'] = time();
                }
            } catch (Exception $tokenEx) {
                error_log('Token resolution DB error: ' . $tokenEx->getMessage());
            }
        }
    }
}

// Jamin akun admin@gmail.com selalu memiliki role 'admin' di dalam sesi aktif
if (isset($_SESSION['user']['email']) && strtolower(trim($_SESSION['user']['email'])) === 'admin@gmail.com') {
    $_SESSION['user']['role'] = 'admin';
}

// Auto migration: Update schema constraints and tables
try {
    // 1. Clean up legacy role values to prevent ALTER TABLE failure
    try {
        $pdo->exec("DELETE FROM users WHERE role = 'teacher' AND id = 9999");
        $pdo->exec("UPDATE users SET role = 'student' WHERE role = 'teacher'");
        $pdo->exec("ALTER TABLE users MODIFY COLUMN role ENUM('student', 'admin') NOT NULL DEFAULT 'student'");
        // Pastikan akun admin@gmail.com selalu memiliki role 'admin'
        $pdo->exec("UPDATE users SET role = 'admin' WHERE LOWER(email) = 'admin@gmail.com'");
    } catch (PDOException $ex) {
        error_log('Users role migration failed: ' . $ex->getMessage());
    }

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS eco_creation_video_comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            video_id INT NOT NULL,
            student_id INT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (video_id) REFERENCES eco_creation_videos(id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_video (video_id),
            INDEX idx_student (student_id)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Seeding default evaluation if an admin exists
    $adminId = $pdo->query("SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1")->fetchColumn();
    if ($adminId) {
        $pdo->exec("INSERT IGNORE INTO eco_challenge_evaluations (id, teacher_id, evaluation_text) VALUES (1, $adminId, 'Evaluasi Kimia Hijau')");
    }

    // Auto-migration: ecopedia_books
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ecopedia_books (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(300) NOT NULL,
            category VARCHAR(100) DEFAULT '',
            tag_class VARCHAR(100) DEFAULT '',
            icon VARCHAR(50) DEFAULT 'science',
            description TEXT,
            content TEXT,
            pdf_url VARCHAR(500) DEFAULT '#',
            flip_url VARCHAR(500) DEFAULT NULL,
            cover_url VARCHAR(500) DEFAULT ''
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Auto-migration: ecoupdate_news
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ecoupdate_news (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(300) NOT NULL,
            category VARCHAR(150) NOT NULL,
            date VARCHAR(100) NOT NULL,
            read_time VARCHAR(50) NOT NULL,
            description TEXT NOT NULL,
            content TEXT NOT NULL,
            cover_url VARCHAR(500) NOT NULL,
            author VARCHAR(150) NOT NULL,
            likes INT NOT NULL DEFAULT 0,
            comments_count INT NOT NULL DEFAULT 0,
            url VARCHAR(500) DEFAULT ''
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Auto-migration: ecocontact_members
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ecocontact_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            role VARCHAR(100) NOT NULL,
            program VARCHAR(150) DEFAULT '',
            instansi VARCHAR(250) NOT NULL,
            email VARCHAR(150) DEFAULT '',
            phone VARCHAR(50) DEFAULT '',
            office_hours VARCHAR(100) DEFAULT '',
            avatar VARCHAR(500) DEFAULT '',
            sort_order INT NOT NULL DEFAULT 0
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Auto-migration: ecolab_meetings
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ecolab_meetings (
            id VARCHAR(50) PRIMARY KEY,
            number INT NOT NULL,
            title VARCHAR(300) NOT NULL,
            description TEXT,
            icon VARCHAR(50) DEFAULT 'science',
            status VARCHAR(50) DEFAULT 'scheduled',
            embed_url VARCHAR(500) DEFAULT '',
            download_url VARCHAR(500) DEFAULT ''
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Auto-migration: sustainability_journals
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS sustainability_journals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            row_index INT NOT NULL,
            tanggal VARCHAR(100) DEFAULT '',
            warna VARCHAR(100) DEFAULT '',
            aroma VARCHAR(100) DEFAULT '',
            gas VARCHAR(100) DEFAULT '',
            alasan TEXT,
            solusi TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_student_row (student_id, row_index)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Auto-migration: student_surveys
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS student_surveys (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            answers TEXT NOT NULL,
            feedback TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_student_survey (student_id)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Auto-migration: student_tests
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS student_tests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            answers TEXT NOT NULL,
            current_step INT DEFAULT 1,
            submitted TINYINT DEFAULT 0,
            grade INT DEFAULT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_student_test (student_id)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Add grade column to student_tests if it does not exist (for existing installations)
    try {
        $pdo->exec("ALTER TABLE student_tests ADD COLUMN grade INT DEFAULT NULL AFTER submitted");
    } catch (PDOException $e) {
        // Column might already exist, ignore error
    }

    // Auto-migration: test_cases
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS test_cases (
            id INT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content_json LONGTEXT NOT NULL,
            questions_json LONGTEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Seed test_cases if empty
    $checkTestCases = $pdo->query("SELECT COUNT(*) FROM test_cases")->fetchColumn();
    if ($checkTestCases == 0) {
        $casesData = [
            [
                1,
                "KASUS 1: Dari Botol ke Mikroplastik yang Kembali ke Meja Makan Kita",
                json_encode([
                    [
                        "type" => "paragraph",
                        "value" => "Setiap pagi, kantin sekolah dipenuhi murid yang membeli minuman dalam botol plastik sekali pakai. Dalam sehari, satu sekolah dapat menghasilkan ratusan botol plastik berbahan PET (polyethylene terephthalate). Tren menunjukkan peningkatan produksi plastik global meningkat dari ±200 juta ton (2000) menjadi lebih dari 400 juta ton (2024) melonjak dua kali lipat karena tuntutan masyarakat terhadap konsumsi kemasan sekali pakai."
                    ],
                    [
                        "type" => "paragraph",
                        "value" => "Namun sampah plastik ini berakhir langsung dibuang, sebagian dibuang ke tempat sampah, tetapi tidak sedikit yang tercecer di lingkungan dan terbawa air hujan menuju selokan."
                    ],
                    [
                        "type" => "paragraph",
                        "value" => "Data dari Kementerian Lingkungan Hidup dan Kehutanan (KLHK) menunjukkan bahwa Indonesia menghasilkan sekitar 68,5 juta ton sampah per tahun, dengan plastik mencapai ±17%. Di kota besar seperti Surabaya, sebagian sampah plastik ini berakhir di sungai yang bermuara ke laut. Plastik yang tidak terkelola akan terpapar sinar UV dan mengalami degradasi fisik menjadi mikroplastik."
                    ],
                    [
                        "type" => "paragraph",
                        "value" => "Mikroplastik ini masuk ke rantai makanan melalui organisme air seperti plankton dan ikan kecil. Studi global oleh UNEP menunjukkan bahwa mikroplastik telah ditemukan dalam air minum, garam, dan bahkan tubuh manusia. Ironisnya, plastik yang awalnya digunakan untuk kenyamanan manusia justru kembali sebagai ancaman kesehatan dan lingkungan. Di sisi lain, kebiasaan konsumsi praktis terus meningkat. Tanpa perubahan perilaku dan inovasi material, pencemaran ini akan semakin sulit dikendalikan."
                    ]
                ], JSON_UNESCAPED_UNICODE),
                json_encode([
                    ["id" => "q1", "label" => "1. Berdasarkan kasus diatas di jelaskan jika plastik menyumbang 17% sampah di Indonesia. Jelaskan mengapa plastik sekali pakai dapat menyebabkan pencemaran lingkungan yang berkepanjangan! Hubungkan jawabanmu dengan sifat-sifat plastik dalam kehidupan sehari-hari dan dampaknya terhadap lingkungan."],
                    ["id" => "q2", "label" => "2. Identifikasilah faktor-faktor utama yang menyebabkan meningkatnya pencemaran plastik sekali pakai di lingkungan sekolah dan perkotaan. Jelaskan hubungan antara faktor tersebut dengan buruknya akumulasi plastik di lingkungan!"],
                    ["id" => "q3", "label" => "3. Analisislah dampak keberadaan mikroplastik terhadap organisme hidup dengan meninjau aspek kimia (interaksi dengan zat berbahaya) dan ekologi (rantai makanan). Jelaskan bagaimana proses tersebut dapat berdampak pada manusia!"],
                    ["id" => "q4", "label" => "4. Rancanglah solusi alternatif untuk mengurangi penggunaan plastik sekali pakai di lingkungan sekolah dengan menerapkan minimal dua prinsip green chemistry!"]
                ], JSON_UNESCAPED_UNICODE)
            ],
            [
                2,
                "KASUS 2: Limbah Deterjen Rumah Tangga",
                json_encode([
                    [
                        "type" => "paragraph",
                        "value" => "Di kawasan aliran Sungai Cikarang Bekasi Laut (CBL), aktivitas rumah tangga menjadi salah satu sumber utama pencemaran air. Setiap hari, masyarakat menggunakan deterjen untuk mencuci pakaian dan peralatan rumah tangga. Air limbah cucian yang mengandung surfaktan dan fosfat langsung dialirkan ke saluran drainase tanpa pengolahan lalu bermuara ke sungai yang juga dimanfaatkan untuk kebutuhan sehari-hari."
                    ],
                    [
                        "type" => "paragraph",
                        "value" => "Surfaktan dalam deterjen memiliki sifat hidrofilik dan hidrofobik yang efektif mengangkat kotoran, tetapi juga berpotensi mengganggu organisme air. Sementara itu, fosfat berperan sebagai “nutrisi” bagi alga. Ketika jumlahnya berlebih terjadi eutrofikasi atau ledakan pertumbuhan alga yang menutupi permukaan air. Akibatnya cahaya matahari terhalang dan kadar oksigen terlarut menurun drastis."
                    ],
                    [
                        "type" => "table",
                        "value" => [
                            "headers" => ["Jenis Deterjen", "Kandungan Fosfat (%)", "Biodegradabilitas", "Dampak Lingkungan"],
                            "rows" => [
                                ["Deterjen konvensional", "20–35%", "Rendah", "Tinggi (eutrofikasi)"],
                                ["Deterjen rendah fosfat", "5–10%", "Sedang", "Sedang"],
                                ["Deterjen ramah lingkungan", "<1%", "Tinggi", "Rendah"]
                            ]
                        ]
                    ]
                ], JSON_UNESCAPED_UNICODE),
                json_encode([
                    ["id" => "q5", "label" => "5. Berdasarkan data kualitas air dan penjelasan tentang surfaktan dalam kasus, jelaskan bagaimana sifat kimia surfaktan dapat memengaruhi kualitas air sungai!"],
                    ["id" => "q6", "label" => "6. Perhatikan data kadar fosfat dan kondisi air pada kasus. Jelaskan hubungan antara peningkatan kadar fosfat dengan terjadinya eutrofikasi di perairan!"],
                    ["id" => "q7", "label" => "7. Berdasarkan narasi kasus, identifikasi: a. Sumber utama pencemaran air, b. Zat kimia yang berperan dalam pencemaran. Jelaskan alasan Anda!"],
                    ["id" => "q8", "label" => "8. Jelaskan salah satu solusi adalah penggunaan deterjen ramah lingkungan. Evaluasilah solusi tersebut berdasarkan prinsip green chemistry!"]
                ], JSON_UNESCAPED_UNICODE)
            ],
            [
                3,
                "KASUS 3: Pestisida Kimia: Panen Melimpah atau Lingkungan Terancam?",
                json_encode([
                    [
                        "type" => "paragraph",
                        "value" => "Pertanian sayur di Jawa Timur rutin menggunakan pestisida kimia sintetis untuk mengatasi serangan hama ulat dan wereng. Dalam satu musim tanam, penyemprotan dilakukan hingga 8–12 kali demi menjaga hasil panen tetap tinggi. Salah satu pestisida yang digunakan mengandung senyawa organofosfat yang bersifat toksik dan relatif persisten di lingkungan."
                    ],
                    [
                        "type" => "paragraph",
                        "value" => "Namun, dalam beberapa tahun terakhir, masyarakat mulai mengeluhkan perubahan lingkungan. Populasi lebah penyerbuk menurun drastis, ikan di saluran irigasi sering ditemukan mati, dan beberapa petani mengalami gejala pusing serta iritasi kulit setelah penyemprotan. Hasil uji sederhana menunjukkan adanya residu pestisida pada sayuran yang melebihi batas aman."
                    ],
                    [
                        "type" => "paragraph",
                        "value" => "Di sisi lain, petani menghadapi dilema jika harus memilih tanpa pestisida maka risiko gagal panen meningkat dan berdampak pada ekonomi mereka. Penggunaan pestisida memang meningkatkan produktivitas tetapi juga memicu pencemaran tanah, air, serta berpotensi membahayakan kesehatan manusia melalui rantai makanan."
                    ],
                    [
                        "type" => "paragraph",
                        "value" => "Diagram Tren Penggunaan Pestisida (Indonesia) - 2018 (45000), 2019 (48500), 2020 (52000), 2021 (55000), 2022 (58000)"
                    ]
                ], JSON_UNESCAPED_UNICODE),
                json_encode([
                    ["id" => "q9", "label" => "9. Berdasarkan data pada kasus, residu pestisida pada sayuran melebihi batas aman dan terjadi penurunan populasi organisme seperti lebah dan ikan. Jelaskan bagaimana sifat kimia pestisida sintetis dapat menyebabkan dampak tersebut terhadap lingkungan dan organisme hidup!"],
                    ["id" => "q10", "label" => "10. Petani masih bergantung pada pestisida kimia untuk menjaga hasil panen. Rancang satu solusi berbasis prinsip green chemistry yang dapat digunakan sebagai alternatif pestisida kimia, serta jelaskan alasan ilmiahnya!"],
                    ["id" => "q11", "label" => "11. Pestisida yang bersifat lipofilik dapat masuk ke rantai makanan dan mengalami peningkatan konsentrasi. Analisis bagaimana proses ini terjadi dari lingkungan hingga ke manusia, serta kaitkan dengan dampaknya terhadap kesehatan!"]
                ], JSON_UNESCAPED_UNICODE)
            ]
        ];

        $insertStmt = $pdo->prepare("INSERT INTO test_cases (id, title, content_json, questions_json) VALUES (?, ?, ?, ?)");
        foreach ($casesData as $c) {
            $insertStmt->execute($c);
        }
    }

    // Ensure student_submissions meeting_id has the correct collation to prevent illegal mix of collations on JOIN
    try {
        $pdo->exec("ALTER TABLE student_submissions MODIFY meeting_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL");
    } catch (PDOException $e) {
        // Table might not exist yet during initial setup
    }

    // ── AUTO-MIGRATION: ROOMS SYSTEM ─────────────────────────────────────────
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS rooms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            room_key VARCHAR(50) NOT NULL UNIQUE,
            cover_image VARCHAR(500) DEFAULT NULL,
            created_by INT NOT NULL,
            gamification_enabled TINYINT(1) NOT NULL DEFAULT 0,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_room_key (room_key),
            INDEX idx_created_by (created_by),
            INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS room_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            room_id INT NOT NULL,
            user_id INT NOT NULL,
            joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_membership (room_id, user_id),
            INDEX idx_room (room_id),
            INDEX idx_user (user_id)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS room_ecopedia (
            id INT AUTO_INCREMENT PRIMARY KEY,
            room_id INT NOT NULL,
            title VARCHAR(300) NOT NULL,
            category VARCHAR(100) DEFAULT 'Umum',
            cover_url VARCHAR(500) DEFAULT '',
            description TEXT,
            content LONGTEXT,
            pdf_url VARCHAR(500) DEFAULT '#',
            flip_url VARCHAR(500) DEFAULT '',
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_room (room_id)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS room_meetings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            room_id INT NOT NULL,
            meeting_code VARCHAR(50) NOT NULL DEFAULT 'm1',
            number INT NOT NULL DEFAULT 1,
            title VARCHAR(300) NOT NULL,
            description TEXT,
            icon VARCHAR(50) DEFAULT 'science',
            status VARCHAR(50) DEFAULT 'scheduled',
            embed_url VARCHAR(500) DEFAULT '',
            download_url VARCHAR(500) DEFAULT '',
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_room (room_id)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Add room_id to existing tables safely
    $tablesToAlter = [
        'student_submissions',
        'eco_creation_videos',
        'eco_challenge_evaluations',
        'eco_challenge_comments',
        'eco_points_log',
        'sustainability_journals',
        'student_tests',
        'student_surveys'
    ];
    foreach ($tablesToAlter as $tbl) {
        try {
            $pdo->exec("ALTER TABLE $tbl ADD COLUMN room_id INT DEFAULT NULL");
        } catch (PDOException $ex) {
            // Column already exists or table doesn't exist
        }
    }

    // -- AUTO-MIGRATION: ABSENSI & KONTAK PER KELAS --
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS room_attendance_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            room_id INT NOT NULL,
            meeting_id VARCHAR(50) DEFAULT NULL,
            title VARCHAR(200) NOT NULL,
            session_date DATE NOT NULL,
            access_code VARCHAR(20) DEFAULT NULL,
            status ENUM('open','closed') NOT NULL DEFAULT 'open',
            opens_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            closes_at TIMESTAMP NULL DEFAULT NULL,
            created_by INT DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_att_room (room_id),
            INDEX idx_att_date (session_date)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS room_attendance_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            student_id INT NOT NULL,
            status ENUM('hadir','izin','sakit','alpa') NOT NULL DEFAULT 'hadir',
            note VARCHAR(255) DEFAULT NULL,
            marked_by ENUM('self','admin') NOT NULL DEFAULT 'self',
            checked_in_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_att_record (session_id, student_id),
            INDEX idx_att_student (student_id)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS room_contacts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            room_id INT NOT NULL,
            name VARCHAR(200) NOT NULL,
            role VARCHAR(150) DEFAULT NULL,
            instansi VARCHAR(200) DEFAULT NULL,
            email VARCHAR(200) DEFAULT NULL,
            phone VARCHAR(50) DEFAULT NULL,
            office_hours VARCHAR(100) DEFAULT NULL,
            avatar_url VARCHAR(500) DEFAULT NULL,
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_contact_room (room_id)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // -- AUTO-MIGRATION: TUGAS KELAS (ROOM ASSIGNMENTS), PENGUMPULAN & DISKUSI --
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS room_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            room_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description LONGTEXT,
            due_date DATETIME NULL,
            max_points INT NOT NULL DEFAULT 100,
            attachment_path VARCHAR(500) DEFAULT NULL,
            attachment_name VARCHAR(255) DEFAULT NULL,
            created_by INT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_assign_room (room_id),
            INDEX idx_assign_due (due_date)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS assignment_submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            assignment_id INT NOT NULL,
            room_id INT NOT NULL,
            student_id INT NOT NULL,
            filename VARCHAR(255) NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            notes TEXT DEFAULT NULL,
            status ENUM('submitted','graded') NOT NULL DEFAULT 'submitted',
            grade INT DEFAULT NULL,
            feedback TEXT DEFAULT NULL,
            submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            graded_at TIMESTAMP NULL DEFAULT NULL,
            UNIQUE KEY unique_assign_student (assignment_id, student_id),
            INDEX idx_asub_assign (assignment_id),
            INDEX idx_asub_student (student_id),
            INDEX idx_asub_room (room_id)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS assignment_comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            assignment_id INT NOT NULL,
            user_id INT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_acomm_assign (assignment_id),
            INDEX idx_acomm_user (user_id)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Seed sample assignment if none exists and a room exists
    try {
        $assignCount = $pdo->query("SELECT COUNT(*) FROM room_assignments")->fetchColumn();
        if ($assignCount == 0) {
            $sampleRoomId = $pdo->query("SELECT id FROM rooms ORDER BY id ASC LIMIT 1")->fetchColumn();
            $adminUser = $pdo->query("SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1")->fetchColumn() ?: 1;
            if ($sampleRoomId) {
                $sampleDueDate = date('Y-m-d 23:59:59', strtotime('+7 days'));
                $stmtSample = $pdo->prepare("
                    INSERT INTO room_assignments (room_id, title, description, due_date, max_points, created_by)
                    VALUES (?, ?, ?, ?, 100, ?)
                ");
                $descSample = "Halo Sahabat GAS!\n\nPada tugas ini, silakan buat laporan analisis singkat (1-2 halaman) mengenai penerapan 12 Prinsip Kimia Hijau pada proses pembuatan Ekoenzim di kelompok masing-masing.\n\nKetentuan:\n1. Berkas dalam format PDF atau DOCX.\n2. Cantumkan nama kelompok, anggota, dan dokumentasi foto proses fermentasi.\n3. Jelaskan minimal 3 prinsip kimia hijau yang terimplementasi dalam fermentasi ekoenzim.\n\nJika ada pertanyaan mengenai tugas ini, silakan tanyakan pada kolom diskusi di bawah ini!";
                $stmtSample->execute([$sampleRoomId, 'Tugas Analisis: Penerapan Prinsip Kimia Hijau pada Ekoenzim', $descSample, $sampleDueDate, $adminUser]);
                $sampleAssignId = $pdo->lastInsertId();

                if ($sampleAssignId) {
                    $stmtComment = $pdo->prepare("
                        INSERT INTO assignment_comments (assignment_id, user_id, content)
                        VALUES (?, ?, ?)
                    ");
                    $stmtComment->execute([$sampleAssignId, $adminUser, 'Selamat mengerjakan penugasan! Jika ada kendala terkait format dokumen atau materi, tanyakan langsung di forum diskusi ini ya. Semangat!']);
                }
            }
        }
    } catch (Exception $e) {
        error_log('Failed seeding sample assignment: ' . $e->getMessage());
    }


    // Seeding: Default room if no room exists
    $checkRooms = $pdo->query("SELECT COUNT(*) FROM rooms")->fetchColumn();
    if ($checkRooms == 0) {
        $firstAdminId = $pdo->query("SELECT id FROM users WHERE role = 'admin' LIMIT 1")->fetchColumn();
        if (!$firstAdminId) {
            $firstAdminId = $pdo->query("SELECT id FROM users ORDER BY id ASC LIMIT 1")->fetchColumn() ?: 1;
        }

        $stmtRoom = $pdo->prepare("
            INSERT INTO rooms (id, name, description, room_key, cover_image, created_by, gamification_enabled, is_active)
            VALUES (1, 'Kelas Kimia Hijau & Ekoenzim', 'Kelas proyek pembelajaran fermentasi ekoenzim dan kimia hijau.', 'GAS-KIMIA1', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80', ?, 0, 1)
        ");
        $stmtRoom->execute([$firstAdminId]);

        // Seed room_meetings for room 1
        $pdo->exec("
            INSERT IGNORE INTO room_meetings (room_id, meeting_code, number, title, description, icon, status, embed_url, download_url) VALUES
            (1, 'm1', 1, 'Mengapa green chemistry penting?', 'Lembar Kerja Murid 1: Menganalisis urgensi dan prinsip dasar Green Chemistry.', 'groups', 'completed', 'https://drive.google.com/file/d/11an9PvFIlJnrJniqR2Z_k8W4hudX2yM_/preview', 'https://drive.google.com/file/d/11an9PvFIlJnrJniqR2Z_k8W4hudX2yM_/view?usp=sharing'),
            (1, 'm2', 2, 'Integrasi Prinsip Green Chemistry dalam Masalah Lingkungan', 'Lembar Kerja Murid 2: Memahami integrasi Green Chemistry dalam penyelesaian isu lingkungan.', 'science', 'ongoing', 'https://drive.google.com/file/d/1leOTPkIbRbEH8Lsy28B1yCnoeykc9RaQ/preview', 'https://drive.google.com/file/d/1leOTPkIbRbEH8Lsy28B1yCnoeykc9RaQ/view?usp=sharing'),
            (1, 'm3', 3, 'Aksi Nyata Berkelanjutan Berbasis Prinsip Green Chemistry', 'Lembar Kerja Murid 3: Merancang dan melaksanakan aksi nyata berkelanjutan berbasis kimia hijau.', 'biotech', 'scheduled', 'https://drive.google.com/file/d/18Y8klb4fEvTAy5AZL8--ihxX2df1rffg/preview', 'https://drive.google.com/file/d/18Y8klb4fEvTAy5AZL8--ihxX2df1rffg/view?usp=sharing'),
            (1, 'm4', 4, 'Agents of Change: Sampah Organik menjadi Solusi Organik', 'Lembar Kerja Murid 4: Mengembangkan solusi organik dari pengolahan limbah sampah organik sekitar.', 'inventory', 'scheduled', 'https://drive.google.com/file/d/14bqlkq9CD9DXx7N2VmzjdDxluy0RFgO5/preview', 'https://drive.google.com/file/d/14bqlkq9CD9DXx7N2VmzjdDxluy0RFgO5/view?usp=sharing')
        ");

        // Seed room_ecopedia for room 1
        $pdo->exec("
            INSERT IGNORE INTO room_ecopedia (room_id, title, category, cover_url, description, content, pdf_url, flip_url, sort_order) VALUES
            (1, 'Solusi Sat-Set untuk Penyelamatan Bumi: Green Chemistry dan Keberlanjutan Lingkungan', 'Kimia Hijau', './Cover Buku 1.png', '', 'Buku ini menyajikan 12 prinsip pokok Kimia Hijau (Green Chemistry) untuk mengurangi atau menonaktifkan penggunaan zat kimia berbahaya.', '#', 'https://online.fliphtml5.com/azzanuriahw/Buku-Ajar-1---Green-Chemistry/', 1),
            (1, 'Bukan Sihir, Cuma Sains: Keajaiban Eco Enzyme yang Bikin Geleng Kepala', 'Ekoenzim', './Cover Buku 2.png', '', 'Panduan luar biasa ini menjelaskan langkah demi langkah untuk memfermentasi sisa kulit buah segar dan sayuran bersama gula merah/molase di air bersih dengan rasio emas 1:3:10.', '#', 'https://online.fliphtml5.com/azzanuriahw/Buku-Ajar-2---Ecoenzyme/', 2)
        ");

        // Enroll all existing students into room 1 as initial members
        $pdo->exec("
            INSERT IGNORE INTO room_members (room_id, user_id)
            SELECT 1, id FROM users WHERE role = 'student'
        ");

        // Update existing submissions, videos, etc to room_id = 1
        $pdo->exec("UPDATE student_submissions SET room_id = 1 WHERE room_id IS NULL");
        $pdo->exec("UPDATE eco_creation_videos SET room_id = 1 WHERE room_id IS NULL");
        $pdo->exec("UPDATE eco_challenge_comments SET room_id = 1 WHERE room_id IS NULL");
    }

    // Seeding: ecolab_meetings
    $checkMeetings = $pdo->query("SELECT COUNT(*) FROM ecolab_meetings")->fetchColumn();
    if ($checkMeetings == 0) {
        $pdo->exec("
            INSERT INTO ecolab_meetings (id, number, title, description, icon, status, embed_url, download_url) VALUES
            ('m1', 1, 'Mengapa green chemistry penting?', 'Lembar Kerja Murid 1: Menganalisis urgensi dan prinsip dasar Green Chemistry.', 'groups', 'completed', 'https://drive.google.com/file/d/11an9PvFIlJnrJniqR2Z_k8W4hudX2yM_/preview', 'https://drive.google.com/file/d/11an9PvFIlJnrJniqR2Z_k8W4hudX2yM_/view?usp=sharing'),
            ('m2', 2, 'Integrasi Prinsip Green Chemistry dalam Masalah Lingkungan', 'Lembar Kerja Murid 2: Memahami integrasi Green Chemistry dalam penyelesaian isu lingkungan.', 'science', 'ongoing', 'https://drive.google.com/file/d/1leOTPkIbRbEH8Lsy28B1yCnoeykc9RaQ/preview', 'https://drive.google.com/file/d/1leOTPkIbRbEH8Lsy28B1yCnoeykc9RaQ/view?usp=sharing'),
            ('m3', 3, 'Aksi Nyata Berkelanjutan Berbasis Prinsip Green Chemistry', 'Lembar Kerja Murid 3: Merancang dan melaksanakan aksi nyata berkelanjutan berbasis kimia hijau.', 'biotech', 'scheduled', 'https://drive.google.com/file/d/18Y8klb4fEvTAy5AZL8--ihxX2df1rffg/preview', 'https://drive.google.com/file/d/18Y8klb4fEvTAy5AZL8--ihxX2df1rffg/view?usp=sharing'),
            ('m4', 4, 'Agents of Change: Sampah Organik menjadi Solusi Organik', 'Lembar Kerja Murid 4: Mengembangkan solusi organik dari pengolahan limbah sampah organik sekitar.', 'inventory', 'scheduled', 'https://drive.google.com/file/d/14bqlkq9CD9DXx7N2VmzjdDxluy0RFgO5/preview', 'https://drive.google.com/file/d/14bqlkq9CD9DXx7N2VmzjdDxluy0RFgO5/view?usp=sharing')
        ");
    }


    // Seeding: ecopedia_books
    $checkBooks = $pdo->query("SELECT COUNT(*) FROM ecopedia_books")->fetchColumn();
    if ($checkBooks == 0) {
        $pdo->exec("
            INSERT INTO ecopedia_books (id, title, category, tag_class, icon, description, content, pdf_url, flip_url, cover_url) VALUES
            ('green-chemistry', 'Solusi Sat-Set untuk Penyelamatan Bumi: Green Chemistry dan Keberlanjutan Lingkungan', '', 'bg-primary-container text-on-primary-fixed', 'science', '', 'Buku ini menyajikan 12 prinsip pokok Kimia Hijau (Green Chemistry) untuk mengurangi atau menonaktifkan penggunaan zat kimia berbahaya. Buku ini mengajarkan bagaimana rancangan molekul organik dapat disintesis menggunakan biokatalis alamiah dengan memaksimalkan atom economy, meminimalkan limbah pencemaran air, dan mengoptimalkan sirkulasi bahan ramah lingkungan untuk masa depan industri global.', '#', 'https://online.fliphtml5.com/azzanuriahw/Buku-Ajar-1---Green-Chemistry/', './Cover Buku 1.png'),
            ('ecoenzyme', 'Bukan Sihir, Cuma Sains: Keajaiban Eco Enzyme yang Bikin Geleng Kepala', '', 'bg-secondary-container text-on-secondary-container', 'compost', '', 'Panduan luar biasa ini menjelaskan langkah demi langkah untuk memfermentasi sisa kulit buah segar dan sayuran bersama gula merah/molase di air bersih dengan rasio emas 1:3:10. Selama 3 bulan berjalan, mikroba pengurai menghasilkan cairan multi-manfaat yang kaya akan asam asetat, amilase, lipase, dan enzim aktif lainnya yang berguna sebagai pembersih alami, disinfektan bebas toksin, serta pupuk organik penyubur tanah.', '#', 'https://online.fliphtml5.com/azzanuriahw/Buku-Ajar-2---Ecoenzyme/', './Cover Buku 2.png')
        ");
    }

        // Seeding: ecoupdate_news (version 2 - updated curated list)
    $checkNewNews = $pdo->prepare("SELECT COUNT(*) FROM ecoupdate_news WHERE url = :url");
    $checkNewNews->execute(['url' => 'https://www.metrotvnews.com/play/b1oCOX23-sidak-adipura-menteri-hanif-soroti-tumpukan-sampah-di-sungai-dan-tps-liar-surabaya']);
    $hasNewNews = $checkNewNews->fetchColumn() > 0;

    if (!$hasNewNews) {
        // Clear old news
        $pdo->exec("DELETE FROM ecoupdate_news");
        
        $stmt = $pdo->prepare("
            INSERT INTO ecoupdate_news (title, category, date, read_time, description, content, cover_url, author, likes, comments_count, url) VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $newsData = [
            [
                'Berita Lingkungan Lokal dari metrotvnews.com',
                'Berita Lokal',
                '14 July 2026',
                '5 menit baca',
                'Akses langsung artikel lengkap untuk membaca berita seputar lingkungan hidup.',
                'Akses langsung artikel lengkap untuk membaca berita seputar lingkungan hidup.',
                'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
                'metrotvnews.com',
                376,
                13,
                'https://www.metrotvnews.com/play/b1oCOX23-sidak-adipura-menteri-hanif-soroti-tumpukan-sampah-di-sungai-dan-tps-liar-surabaya'
            ],
            [
                'Peringati Hari Bumi, ECOTON Hiasi Manequin dengan Sachet | Pilar.ID',
                'Berita Lokal',
                '14 July 2026',
                '3 menit baca',
                'Surabaya (pilar.id) - Dalam memperingati Hari Bumi yang jatuh pada 22 April. Yayasan ECOTON bersama beberapa komunitas, mahasiswa dan lainnya turun aksi di depan gedung Grahadi, Surabaya, Jumat (22/4/2022) Pada aksi kali ini, berdasar penjelasan Kholid Basyaiban, selaku Koordinator Lapangan (Kor...',
                'Surabaya (pilar.id) - Dalam memperingati Hari Bumi yang jatuh pada 22 April. Yayasan ECOTON bersama beberapa komunitas, mahasiswa dan lainnya turun aksi di depan gedung Grahadi, Surabaya, Jumat (22/4/2022) Pada aksi kali ini, berdasar penjelasan Kholid Basyaiban, selaku Koordinator Lapangan (Kor...',
                'https://www.pilar.id/wp-content/uploads/2022/04/6FF30E25-402F-477C-8E99-0BC84BC132D0.jpeg',
                'https://www.facebook.com/mediapilarID/',
                388,
                21,
                'https://www.pilar.id/peringati-hari-bumi-ecoton-hiasi-manequin-dengan-sachet/'
            ],
            [
                'Pemkot Surabaya Terbitkan Perwali Pengurangan Penggunaan Kantong Plastik - Pemerintah Kota Surabaya',
                'Berita Lokal',
                '14 July 2026',
                '3 menit baca',
                'Pemkot Surabaya Terbitkan Perwali Pengurangan Penggunaan Kantong Plastik',
                'Pemkot Surabaya Terbitkan Perwali Pengurangan Penggunaan Kantong Plastik',
                'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
                'surabaya.go.id',
                184,
                20,
                'https://surabaya.go.id/id/berita/65759/pemkot-surabaya-terbitkan-perwali-pengurangan-penggunaan-kantong-plastik'
            ],
            [
                '6 Taman dan Jalur Hijau di Kota Surabaya Rusak Akibat Fenomena Koin Jagat, Pemkot Surabaya Lakukan Tindakan Tegas - Pemerintah Kota Surabaya',
                'Berita Lokal',
                '14 July 2026',
                '6 menit baca',
                '6 Taman dan Jalur Hijau di Kota Surabaya Rusak Akibat Fenomena Koin Jagat, Pemkot Surabaya Lakukan Tindakan Tegas',
                '6 Taman dan Jalur Hijau di Kota Surabaya Rusak Akibat Fenomena Koin Jagat, Pemkot Surabaya Lakukan Tindakan Tegas',
                'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
                'surabaya.go.id',
                277,
                13,
                'https://www.surabaya.go.id/id/berita/23345/6-taman-dan-jalur-hijau-di-kota-surabaya-rusak-akibat-fenomena-koin-jagat-pemkot-surabaya-lakukan-tindakan-tegas'
            ],
            [
                'Jaga Kebersihan Lingkungan, Ratusan Siswa SD-SMP Rutin Bersih-bersih Pantai Nambangan - Pemerintah Kota Surabaya',
                'Berita Lokal',
                '14 July 2026',
                '6 menit baca',
                'Jaga Kebersihan Lingkungan, Ratusan Siswa SD-SMP Rutin Bersih-bersih Pantai Nambangan',
                'Jaga Kebersihan Lingkungan, Ratusan Siswa SD-SMP Rutin Bersih-bersih Pantai Nambangan',
                'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
                'surabaya.go.id',
                295,
                29,
                'https://surabaya.go.id/id/berita/10882/jaga-kebersihan-lingkungan-ratusan-siswa-sd-smp-rutin-bersih-bersih-pantai-nambangan'
            ],
            [
                'Ratusan Perempuan Surabaya Deklarasikan “She Heroes” di CFD Tunjungan',
                'Berita Lokal',
                '14 July 2026',
                '6 menit baca',
                'Sekitar 500 perempuan memadati kawasan Car Free Day Jalan Tunjungan untuk mengikuti Deklarasi Gerakan “She Heroes”, Minggu (26/4/2026) . Gerakan …',
                'Sekitar 500 perempuan memadati kawasan Car Free Day Jalan Tunjungan untuk mengikuti Deklarasi Gerakan “She Heroes”, Minggu (26/4/2026) . Gerakan …',
                'https://tunashijau.id/wp-content/uploads/2026/04/she-changes.webp',
                'Tunas Hijau ID',
                336,
                10,
                'https://tunashijau.id/ratusan-perempuan-surabaya-deklarasikan-she-heroes-di-cfd-tunjungan/'
            ],
            [
                'Penjualan Mobil Listrik di Surabaya Naik 4 Kali Lipat pada Awal 2026',
                'Berita Lokal',
                '14 July 2026',
                '7 menit baca',
                'Menurutnya, penggunaan kendaraan listrik di Jakarta relatif lebih cepat berkembang karena didukung kebijakan ganjil genap.',
                'Menurutnya, penggunaan kendaraan listrik di Jakarta relatif lebih cepat berkembang karena didukung kebijakan ganjil genap.',
                'https://img.inews.co.id/media/600/files/networks/2026/05/19/638da_mobil-listrik.jpg',
                'https://surabaya.inews.id/',
                382,
                7,
                'https://surabaya.inews.id/read/691788/penjualan-mobil-listrik-di-surabaya-naik-4-kali-lipat-pada-awal-2026'
            ],
            [
                'Resolusi 2026 Namira Eco Print Surabaya: Gaungkan “Back to Nature”, Ajak Anak Muda Lebih Peduli Lingkungan',
                'Berita Lokal',
                '14 July 2026',
                '6 menit baca',
                'Radar Surabaya adalah media digital yang menjadi denyut informasi Surabaya Raya dan Jawa Timur. Menghadirkan berita cepat, tajam dan terpercaya. Mengawal setiap peristiwa, menghubungkan aspirasi masyarakat, serta menjadi referensi utama bagi pembaca yang ingin memahami perkembangan daerah secara ...',
                'Radar Surabaya adalah media digital yang menjadi denyut informasi Surabaya Raya dan Jawa Timur. Menghadirkan berita cepat, tajam dan terpercaya. Mengawal setiap peristiwa, menghubungkan aspirasi masyarakat, serta menjadi referensi utama bagi pembaca yang ingin memahami perkembangan daerah secara ...',
                'https://cdn-jpr.jawapos.com/images/11/2026/01/23/namira-2590344769.jpg',
                'Dimas Mahendra',
                283,
                26,
                'https://radarsurabaya.jawapos.com/surabaya/2601230024/resolusi-2026-namira-eco-print-surabaya-gaungkan-back-to-nature-ajak-anak-muda-lebih-peduli-lingkungan'
            ],
            [
                'Air Hujan Kota Surabaya Terkontaminasi Mikroplastik: Ecoton Himbau Warga Tidak Telan Air Hujan Secara Langsung - ECOTON',
                'Berita Lokal',
                '14 July 2026',
                '4 menit baca',
                'Surabaya, November 2025 — Penelitian terbaru yang dipimpin oleh Lembaga Kajian Ekologi dan Konservasi Lahan Basah (Ecoton) mengungkap bahwa air hujan di Kota Surabaya telah terkontaminasi mikroplastik pada seluruh lokasi […]',
                'Surabaya, November 2025 — Penelitian terbaru yang dipimpin oleh Lembaga Kajian Ekologi dan Konservasi Lahan Basah (Ecoton) mengungkap bahwa air hujan di Kota Surabaya telah terkontaminasi mikroplastik pada seluruh lokasi […]',
                'https://ecoton.or.id/wp-content/uploads/2025/11/WhatsApp-Image-2025-11-14-at-16.12.54-scaled.jpeg',
                'ECOTON NEWS',
                432,
                26,
                'https://ecoton.or.id/air-hujan-kota-surabaya-terkontaminasi-mikroplastik-ecoton-himbau-warga-tidak-telan-air-hujan-secara-langsung/'
            ],
            [
                'Surabaya Panas dengan Suhu Tembus 33 Derajat Celsius',
                'Berita Lokal',
                '14 July 2026',
                '3 menit baca',
                'Cuaca Surabaya 26 Mei 2026, udara kabur, suhu mencapai 33°C, kelembapan 57-97%. Hujan ringan di Bangkalan, Mojokerto cerah berawan. Waspadai perubahan cuaca!',
                'Cuaca Surabaya 26 Mei 2026, udara kabur, suhu mencapai 33°C, kelembapan 57-97%. Hujan ringan di Bangkalan, Mojokerto cerah berawan. Waspadai perubahan cuaca!',
                'https://akcdn.detik.net.id/api/wm/2026/03/29/ilusrasi-musim-panas-di-kota-surabaya-1774761615523_169.jpeg?wid=60&w=1200&v=1&t=jpeg',
                'https://www.facebook.com/detikcom',
                450,
                18,
                'https://www.detik.com/jatim/berita/d-8504622/surabaya-panas-dengan-suhu-tembus-33-derajat-celsius'
            ],
            [
                'DLH Surabaya Temukan Warga Buang Rumen ke Kali, Satu Orang Kena Tipiring',
                'Berita Lokal',
                '14 July 2026',
                '4 menit baca',
                'Patroli yang dilakukan Dinas Lingkungan Hidup (DLH) Kota Surabaya masih menemukan warga yang mencuci dan membuang rumen atau kotoran hewan di Kali Surabaya, tepatnya Taman Asreboyo, Rabu (27/5/2026).',
                'Patroli yang dilakukan Dinas Lingkungan Hidup (DLH) Kota Surabaya masih menemukan warga yang mencuci dan membuang rumen atau kotoran hewan di Kali Surabaya, tepatnya Taman Asreboyo, Rabu (27/5/2026).',
                'https://www.suarasurabaya.net/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-27-at-12.45.15-PM-e1779861215749.jpeg',
                'suarasurabaya.net',
                403,
                27,
                'https://www.suarasurabaya.net/kelanakota/2026/dlh-surabaya-temukan-warga-buang-rumen-ke-kali-satu-orang-kena-tipiring/'
            ],
            [
                'Ascott Waterplace Surabaya Luncurkan \'One Stay One Tree\', Ajak Tamu Ikut Kurangi Emisi Karbon',
                'Berita Lokal',
                '14 July 2026',
                '7 menit baca',
                'Ascott Waterplace Surabaya luncurkan program \'One Stay One Tree\' saat Hari Bumi, ajak tamu kurangi emisi lewat adopsi dan penanaman pohon.',
                'Ascott Waterplace Surabaya luncurkan program \'One Stay One Tree\' saat Hari Bumi, ajak tamu kurangi emisi lewat adopsi dan penanaman pohon.',
                'https://cms.disway.id/uploads/d0185d8dac98f884a4b14a2cc1152122.jpeg',
                'harian.disway.id',
                250,
                26,
                'https://harian.disway.id/read/943491/ascott-waterplace-surabaya-luncurkan-one-stay-one-tree-ajak-tamu-ikut-kurangi-emisi-karbon/15'
            ],
            [
                '5 Things to Watch in Climate and Environment in 2026',
                'Berita Global',
                '14 July 2026',
                '7 menit baca',
                '2026 is a crucial year for climate action, cooperation, sustainable cities and science. Here is what to look out for this year.',
                '2026 is a crucial year for climate action, cooperation, sustainable cities and science. Here is what to look out for this year.',
                'https://unu.edu/sites/default/files/styles/twtr_image/public/2026-01/Inline%20Media%20%E2%80%93%20Single%20Image%20944x531px%2817%29.png?itok=Erh7xT97',
                'United Nations University',
                443,
                16,
                'https://unu.edu/ehs/article/5-things-watch-climate-and-environment-2026'
            ],
            [
                'Berita Lingkungan Global dari jatimnet.com',
                'Berita Global',
                '14 July 2026',
                '5 menit baca',
                'Akses langsung artikel lengkap untuk membaca berita seputar lingkungan hidup.',
                'Akses langsung artikel lengkap untuk membaca berita seputar lingkungan hidup.',
                'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
                'jatimnet.com',
                232,
                14,
                'https://jatimnet.com/kenapa-generasi-muda-mulai-malu-buang-sampah-sembarangan'
            ],
            [
                'World Environment Day 2026 to activate \'50 Cities at 50°C\' - EnviroNews - latest environment news, climate change, renewable energy',
                'Berita Global',
                '14 July 2026',
                '6 menit baca',
                'Extreme heat is becoming one of the fastest growing risks for cities worldwide. Many urban areas are already approaching, or will soon face,50°C-equivalent conditions that threaten health, infrastructure and daily life. But cities are also leading with solutions. The “50 Cities at 50°C” or ...',
                'Extreme heat is becoming one of the fastest growing risks for cities worldwide. Many urban areas are already approaching, or will soon face,50°C-equivalent conditions that threaten health, infrastructure and daily life. But cities are also leading with solutions. The “50 Cities at 50°C” or ...',
                'https://www.environewsnigeria.com/wp-content/uploads/2018/11/Accra.jpg',
                'Michael Simire',
                435,
                25,
                'https://www.environewsnigeria.com/world-environment-day-2026-to-activate-50-cities-at-50c/'
            ],
            [
                'Perjanjian Laut Lepas PBB Mulai Berlaku, Upaya Besar Lindungi Samudera',
                'Berita Global',
                '14 July 2026',
                '3 menit baca',
                'High Seas Treaty atau BBNJA berlaku mulai Sabtu (17/1/2026). Perjanjian PBB ini jadi tonggak perlindungan laut lepas dan keanekaragaman hayati.',
                'High Seas Treaty atau BBNJA berlaku mulai Sabtu (17/1/2026). Perjanjian PBB ini jadi tonggak perlindungan laut lepas dan keanekaragaman hayati.',
                'https://asset.kompas.com/crops/S3OuFNeHIZ_3uFlqE40XuwPQ_7U=/0x0:995x663/1200x675/data/photo/2025/09/05/68ba88c0e13ae.png',
                'KOMPAS.com',
                321,
                19,
                'https://lestari.kompas.com/read/2026/01/16/191723886/perjanjian-laut-lepas-pbb-mulai-berlaku-upaya-besar-lindungi-samudera?page=all'
            ],
            [
                'Solar and wind power are actually cheaper than the lowest-cost fossil fuels',
                'Berita Global',
                '14 July 2026',
                '6 menit baca',
                'The new data was backed by additional multi-agency reporting from the United Nations.',
                'The new data was backed by additional multi-agency reporting from the United Nations.',
                'https://cdn.prod.website-files.com/5f6cc9cd16d59d990c8fca33/6a0490bde700eba221af3f3e_solar-power-wind-energy-more-affordable.jpg',
                'goodgoodgood.co',
                209,
                5,
                'https://www.goodgoodgood.co/articles/solar-power-wind-energy-cheaper'
            ],
            [
                'Ketika Perang Membuat Bumi Makin Panas',
                'Berita Global',
                '14 July 2026',
                '5 menit baca',
                'Selama kebijakan luar negeri masih didikte oleh kepentingan bahan bakar fosil, selama itu pula perang dan krisis iklim akan terus saling memakan.',
                'Selama kebijakan luar negeri masih didikte oleh kepentingan bahan bakar fosil, selama itu pula perang dan krisis iklim akan terus saling memakan.',
                'https://assetd.kompas.id/eCTXcDPbyqhA1hOEtDF53nfbCeU=/1024x576/smart/filters:format(webp):quality(80)/https://cdn-dam.kompas.id/images/2026/03/27/9115cdbf7dd837217c7fbe3e1f8ec459-20260327_Opini_Digital_1.jpg',
                'Kompas.id',
                232,
                11,
                'https://www.kompas.id/artikel/ketika-perang-semakin-membakar-bumi'
            ],
            [
                'Dampak Konflik AS-Iran Jadi Ancaman \'Kiamat\' Bagi Ekosistem Laut Ini',
                'Berita Global',
                '14 July 2026',
                '7 menit baca',
                'Seiring berlanjutnya konflik, para ilmuwan semakin khawatir tentang dampak tumpahan minyak terhadap hewan di wilayah tersebut.',
                'Seiring berlanjutnya konflik, para ilmuwan semakin khawatir tentang dampak tumpahan minyak terhadap hewan di wilayah tersebut.',
                'https://akcdn.detik.net.id/visual/2015/09/01/1b274397-e1dc-412f-80f5-527cb561290d_169.jpg?w=1200',
                'internasional',
                187,
                30,
                'https://www.cnnindonesia.com/internasional/20260419161656-120-1349701/dampak-konflik-as-iran-jadi-ancaman-kiamat-bagi-ekosistem-laut-ini'
            ],
            [
                'Tren Fast Fashion, Dari Gaya Hidup Jadi Ancaman Bencana Lingkungan Global',
                'Berita Global',
                '14 July 2026',
                '5 menit baca',
                'Radar Surabaya adalah media digital yang menjadi denyut informasi Surabaya Raya dan Jawa Timur. Menghadirkan berita cepat, tajam dan terpercaya. Mengawal setiap peristiwa, menghubungkan aspirasi masyarakat, serta menjadi referensi utama bagi pembaca yang ingin memahami perkembangan daerah secara ...',
                'Radar Surabaya adalah media digital yang menjadi denyut informasi Surabaya Raya dan Jawa Timur. Menghadirkan berita cepat, tajam dan terpercaya. Mengawal setiap peristiwa, menghubungkan aspirasi masyarakat, serta menjadi referensi utama bagi pembaca yang ingin memahami perkembangan daerah secara ...',
                'https://cdn-jpr.jawapos.com/images/11/2025/10/20/WhatsApp-Image-2025-10-20-at-045911_eb44420e-3595611048.jpg',
                'Muhammad Firman Syah',
                222,
                29,
                'https://radarsurabaya.jawapos.com/hobi-lifestyle/2510200023/tren-fast-fashion-dari-gaya-hidup-jadi-ancaman-bencana-lingkungan-global'
            ],
            [
                'Pajak Karbon Uni Eropa Resmi Berlaku, Apa Dampaknya?',
                'Berita Global',
                '14 July 2026',
                '3 menit baca',
                'Uni Eropa mulai menerapkan pajak karbon atau CBAM pada 2026. Ekspor baja, semen, dan aluminium ke Eropa dikenakan biaya emisi karbon dioksida.',
                'Uni Eropa mulai menerapkan pajak karbon atau CBAM pada 2026. Ekspor baja, semen, dan aluminium ke Eropa dikenakan biaya emisi karbon dioksida.',
                'https://asset.kompas.com/crops/wwPaY8-F5aCWruqrynTKBn__t34=/0x1:1920x1281/1200x675/data/photo/2025/04/19/680356a50606b.jpg',
                'KOMPAS.com',
                436,
                22,
                'https://lestari.kompas.com/read/2026/01/02/165353086/pajak-karbon-uni-eropa-resmi-berlaku-apa-dampaknya?page=all'
            ],
            [
                'Gelombang Panas Ekstrem Landa India dan Pakistan pada Mei 2026',
                'Berita Global',
                '14 July 2026',
                '4 menit baca',
                'Suhu udara di India dan Pakistan mencapai 50 derajat Celsius akibat gelombang panas dini yang dipicu fenomena El Nino kuat sejak awal April 2026.',
                'Suhu udara di India dan Pakistan mencapai 50 derajat Celsius akibat gelombang panas dini yang dipicu fenomena El Nino kuat sejak awal April 2026.',
                'https://cdn.babelinsight.id/media/images/2026/05/zJmqrmFIfE.jpeg?location=1&width=&height=&quality=&fit=1',
                'Babel Insight',
                417,
                8,
                'https://www.babelinsight.id/gelombang-panas-ekstrem-india-pakistan'
            ],
            [
                'Alih Fungsi Lahan di Asia Tenggara Picu Krisis Polusi Udara, RI Paling Dirugikan',
                'Berita Global',
                '14 July 2026',
                '4 menit baca',
                'Alih fungsi lahan di Asia Tenggara erat kaitannya dengan sekitar 13.000 kematian tambahan pada tahun 2018 saja.',
                'Alih fungsi lahan di Asia Tenggara erat kaitannya dengan sekitar 13.000 kematian tambahan pada tahun 2018 saja.',
                'https://asset.kompas.com/crops/ActWJG0nysFJoS4kQ6PpUAGPraw=/0x0:999x666/1200x675/data/photo/2025/10/14/68ee2666746a1.jpg',
                'KOMPAS.com',
                396,
                16,
                'https://lestari.kompas.com/read/2026/05/26/172436186/alih-fungsi-lahan-di-asia-tenggara-picu-krisis-polusi-udara-ri-paling'
            ],
            [
                'Asia-Pasifik Terancam Gagal Capai Target SDG PBB',
                'Berita Global',
                '14 July 2026',
                '7 menit baca',
                'Wilayah Asia-Pasifik diperkirakan akan gagal mencapai 103 dari 117 target pembangunan berkelanjutan (SDG) tahun 2030.',
                'Wilayah Asia-Pasifik diperkirakan akan gagal mencapai 103 dari 117 target pembangunan berkelanjutan (SDG) tahun 2030.',
                'https://asset.kompas.com/crops/TkoIroG0Ajy9IDvGtGglMd-vpug=/0x0:6000x4000/1200x675/data/photo/2025/12/09/69381a430ffc7.jpg',
                'KOMPAS.com',
                324,
                30,
                'https://lestari.kompas.com/read/2026/02/20/151900686/asia-pasifik-terancam-gagal-capai-target-sdg-pbb?page=all'
            ],
        ];

        foreach ($newsData as $row) {
            $stmt->execute($row);
        }
    }

    // Seeding: ecocontact_members
    $checkContacts = $pdo->query("SELECT COUNT(*) FROM ecocontact_members")->fetchColumn();
    if ($checkContacts == 0) {
        $stmt = $pdo->prepare("
            INSERT INTO ecocontact_members (name, role, program, instansi, email, phone, office_hours, avatar, sort_order) VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            'Azza Nuriah Widowati, M.Pd.', 'Guru & Peneliti', 'S3 Pendidikan Sains', 'Universitas Negeri Surabaya',
            'azzanuriahw@gmail.com', '081554319722', '08.00 - 15.00 WIB', './azza.jpg', 0
        ]);
        $stmt->execute([
            'Prof. Dr. Endang Susantini, M.Pd.', 'Promotor', '', 'Universitas Negeri Surabaya',
            '', '', '', './prof endang.jpg', 1
        ]);
        $stmt->execute([
            'Prof. Dr. Utiya Azizah, M.Pd.', 'Co-Promotor', '', 'Universitas Negeri Surabaya',
            '', '', '', './prof utiya.jpg', 2
        ]);
    }

    // Seeding: room_contacts (salin dari ecocontact_members ke kelas default bila belum ada kontak sama sekali)
    $checkRoomContacts = $pdo->query("SELECT COUNT(*) FROM room_contacts")->fetchColumn();
    if ($checkRoomContacts == 0) {
        $firstRoomId = $pdo->query("SELECT id FROM rooms ORDER BY id ASC LIMIT 1")->fetchColumn();
        if ($firstRoomId) {
            $pdo->prepare("
                INSERT INTO room_contacts (room_id, name, role, instansi, email, phone, office_hours, avatar_url, sort_order)
                SELECT ?, name, role, instansi, email, phone, office_hours, avatar, sort_order FROM ecocontact_members
            ")->execute([$firstRoomId]);
        }
    }
} catch (PDOException $e) {
    error_log('Failed to auto-migrate/seed database: ' . $e->getMessage());
}

// ── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

/**
 * Sends a JSON response and halts script execution.
 */
function sendJson(array $data, int $status_code = 200): void {
    header('Content-Type: application/json; charset=utf-8');
    // PERFORMANCE: Cache-Control prevents browsers from caching API responses
    header('Cache-Control: no-store, no-cache, must-revalidate');
    http_response_code($status_code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Parses and returns the JSON request body as an associative array.
 */
function getRequestBody(): array {
    $input = file_get_contents('php://input');
    $data  = json_decode($input, true);
    return is_array($data) ? $data : [];
}

/**
 * Returns the currently authenticated user ID from session, or null.
 */
function getAuthUserId(): ?int {
    return isset($_SESSION['user']['id']) ? (int)$_SESSION['user']['id'] : null;
}

/**
 * Requires authentication — sends 401 and halts if not logged in.
 */
function requireAuth(): int {
    $uid = getAuthUserId();
    if ($uid === null) {
        sendJson([
            'success' => false,
            'message' => 'Sesi tidak aktif. Silakan masuk terlebih dahulu.',
        ], 401);
    }
    return $uid;
}

/**
 * Requires admin role — sends 401 if not logged in or 403 if not admin.
 */
function requireAdmin(): int {
    $uid = requireAuth();
    if (isset($_SESSION['user']['email']) && strtolower(trim($_SESSION['user']['email'])) === 'admin@gmail.com') {
        $_SESSION['user']['role'] = 'admin';
    }
    if (($_SESSION['user']['role'] ?? '') !== 'admin') {
        sendJson([
            'success' => false,
            'message' => 'Akses ditolak. Endpoint ini hanya untuk Administrator.'
        ], 403);
    }
    return $uid;
}
