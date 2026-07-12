<?php
// api/import-data.php
// TEMPORARY: Hapus file ini + database/data_export.sql setelah selesai!

$secret = 'gas2026import';
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

$sql_file = __DIR__ . '/../database/data_export.sql';
if (!file_exists($sql_file)) {
    die("❌ File data_export.sql tidak ditemukan!");
}

$sql = file_get_contents($sql_file);

// Split SQL into individual statements
$statements = array_filter(
    array_map('trim', explode(";\n", $sql)),
    fn($s) => !empty($s) && !str_starts_with($s, '--') && !str_starts_with($s, '/*')
);

$success = 0;
$errors  = [];

// Disable FK checks during import
$pdo->exec("SET FOREIGN_KEY_CHECKS=0");
$pdo->exec("SET NAMES utf8mb4");

foreach ($statements as $i => $stmt) {
    if (empty(trim($stmt))) continue;
    try {
        $pdo->exec($stmt);
        $success++;
    } catch (PDOException $e) {
        $errors[] = "❌ Statement " . ($i + 1) . ": " . $e->getMessage() . "\n   SQL: " . substr($stmt, 0, 80) . "...";
    }
}

$pdo->exec("SET FOREIGN_KEY_CHECKS=1");

echo "=============================\n";
echo "Done: $success statements executed.\n";
echo "Errors: " . count($errors) . "\n";
if (!empty($errors)) {
    echo "\nDetail errors:\n";
    foreach ($errors as $err) {
        echo $err . "\n";
    }
} else {
    echo "✅ Data berhasil diimpor!\n";
    echo "⚠️  PENTING: Hapus api/import-data.php dan database/data_export.sql dari repo!\n";
}
