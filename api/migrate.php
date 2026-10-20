<?php
// api/migrate.php
require_once 'config.php';

// Memerlukan role admin untuk memicu migrasi secara manual
requireAdmin();

require_once __DIR__ . '/migrations.php';
runDatabaseMigrations($pdo);

$migrationVersion = 'v5';
$migrationFlag = sys_get_temp_dir() . '/gas_db_migrated_' . $migrationVersion . '.flag';
@file_put_contents($migrationFlag, (string)time());

sendJson([
    'success' => true,
    'message' => 'Migrasi dan inisialisasi database GAS Website berhasil dijalankan.',
    'version' => $migrationVersion,
    'timestamp' => date('Y-m-d H:i:s')
]);
