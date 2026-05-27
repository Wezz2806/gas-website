<?php
// api/debug-db.php
// FILE SEMENTARA UNTUK DEBUG - HAPUS SETELAH SELESAI!
header('Content-Type: application/json');

$db_host = getenv('MYSQLHOST')     ?: 'NOT SET';
$db_name = getenv('MYSQLDATABASE') ?: 'NOT SET';
$db_user = getenv('MYSQLUSER')     ?: 'NOT SET';
$db_pass = getenv('MYSQLPASSWORD') ?: 'NOT SET';
$db_port = getenv('MYSQLPORT')     ?: 'NOT SET';

// Jangan tampilkan password di output
echo json_encode([
    'env' => [
        'MYSQLHOST'     => $db_host,
        'MYSQLDATABASE' => $db_name,
        'MYSQLUSER'     => $db_user,
        'MYSQLPASSWORD' => $db_pass !== 'NOT SET' ? '***SET***' : 'NOT SET',
        'MYSQLPORT'     => $db_port,
        'RAILWAY_ENV'   => getenv('RAILWAY_ENVIRONMENT') ?: 'NOT SET',
    ],
    'connection_test' => null,
    'error' => null,
]);

// Coba koneksi
try {
    $pdo = new PDO(
        "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $result = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode([
        'env' => [
            'MYSQLHOST'     => $db_host,
            'MYSQLDATABASE' => $db_name,
            'MYSQLUSER'     => $db_user,
            'MYSQLPASSWORD' => '***SET***',
            'MYSQLPORT'     => $db_port,
        ],
        'connection_test' => 'SUCCESS',
        'tables' => $result,
        'error' => null,
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'env' => [
            'MYSQLHOST'     => $db_host,
            'MYSQLDATABASE' => $db_name,
            'MYSQLUSER'     => $db_user,
            'MYSQLPASSWORD' => $db_pass !== 'NOT SET' ? '***SET***' : 'NOT SET',
            'MYSQLPORT'     => $db_port,
        ],
        'connection_test' => 'FAILED',
        'error' => $e->getMessage(),
    ]);
}
