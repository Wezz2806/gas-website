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

// Detect environment — Railway otomatis set RAILWAY_ENVIRONMENT=production
$is_production = (
    getenv('ENVIRONMENT') === 'production' ||
    getenv('RAILWAY_ENVIRONMENT') !== false
);

// Set CORS headers dynamically based on Origin header to prevent CORS issues
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost:5173',
    'https://gas-website.netlify.app',
    'https://gaslearn.netlify.app'
];

if (in_array($origin, $allowed_origins)) {
    $allowed_origin = $origin;
} else {
    $allowed_origin = getenv('FRONTEND_URL') ?: 'https://gaslearn.netlify.app';
}
header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

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
        'domain'   => '',
        'secure'   => $is_production, // HTTPS-only di production
        'httponly' => true,
        // PENTING: 'None' wajib untuk cross-origin (Netlify ↔ Railway)
        // 'Lax' tidak akan bisa kirim cookie lintas domain
        'samesite' => $is_production ? 'None' : 'Lax',
    ]);
    session_start();
}

// ── DATABASE CONNECTION ──────────────────────────────────────────────────────
// Development (XAMPP): nilai default localhost/root/etc.
// Production (Railway): Railway inject otomatis MYSQLHOST, MYSQLUSER, dst.
$db_host = getenv('MYSQLHOST')     ?: getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('MYSQLDATABASE') ?: getenv('DB_NAME') ?: 'gas_website';
$db_user = getenv('MYSQLUSER')     ?: getenv('DB_USER') ?: 'root';
$db_pass = getenv('MYSQLPASSWORD') ?: getenv('DB_PASS') ?: '';
$db_port = getenv('MYSQLPORT')     ?: getenv('DB_PORT') ?: '3306';

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

// Auto migration: Create video comments table if not exists
try {
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

    // Ensure default teacher and evaluation row exist for eco_challenge_comments foreign key constraint
    $pdo->exec("INSERT IGNORE INTO users (id, full_name, email, role) VALUES (9999, 'Sistem Guru', 'sistem.guru@gas.website', 'teacher')");
    $pdo->exec("INSERT IGNORE INTO eco_challenge_evaluations (id, teacher_id, evaluation_text) VALUES (1, 9999, 'Evaluasi Kimia Hijau')");
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
