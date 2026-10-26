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

// ── AUTO-MIGRATION RUNNER (ONCE PER CONTAINER/DEPLOYMENT LIFECYCLE) ──────────
// Menjalankan migrasi dan seeding hanya satu kali saat container/server dimulai.
// Ini mencegah eksekusi puluhan query DDL (CREATE/ALTER) yang lambat di setiap request HTTP.
$migrationVersion = 'v6';
$migrationFlag = sys_get_temp_dir() . '/gas_db_migrated_' . $migrationVersion . '.flag';

if (!file_exists($migrationFlag)) {
    $lockFilePath = sys_get_temp_dir() . '/gas_migration.lock';
    $lockFile = @fopen($lockFilePath, 'c+');
    if ($lockFile && flock($lockFile, LOCK_EX)) {
        if (!file_exists($migrationFlag)) {
            require_once __DIR__ . '/migrations.php';
            runDatabaseMigrations($pdo);
            @file_put_contents($migrationFlag, (string)time());
        }
        flock($lockFile, LOCK_UN);
        fclose($lockFile);
    } else if (!file_exists($migrationFlag)) {
        require_once __DIR__ . '/migrations.php';
        runDatabaseMigrations($pdo);
        @file_put_contents($migrationFlag, (string)time());
    }
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
