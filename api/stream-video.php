<?php
// api/stream-video.php
require_once 'config.php';

$filename = $_GET['filename'] ?? '';

// Sanitasi nama file untuk menghindari directory traversal
if (empty($filename) || preg_match('/[^a-zA-Z0-9_\.-]/', $filename)) {
    http_response_code(400);
    sendJson(['success' => false, 'message' => 'Nama file tidak valid.'], 400);
}

$file_path = dirname(__DIR__) . '/uploads/videos/' . $filename;

if (!file_exists($file_path)) {
    http_response_code(404);
    sendJson(['success' => false, 'message' => 'File video tidak ditemukan.'], 404);
}

// Buka file video
$size = filesize($file_path);
$fp = @fopen($file_path, 'rb');
if (!$fp) {
    http_response_code(500);
    sendJson(['success' => false, 'message' => 'Gagal membuka file video.'], 500);
}

// Deteksi Content-Type berdasarkan ekstensi file
$ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
$mime_types = [
    'mp4' => 'video/mp4',
    'webm' => 'video/webm',
    'ogg' => 'video/ogg',
    'mov' => 'video/quicktime',
    'avi' => 'video/x-msvideo',
    'mkv' => 'video/x-matroska'
];
$content_type = $mime_types[$ext] ?? 'video/mp4';

// Bersihkan output buffer jika ada untuk menghindari data corrupt
if (ob_get_level()) {
    ob_end_clean();
}

// Set header penting untuk streaming dan CORS
header("Content-Type: $content_type");
header("Accept-Ranges: bytes");

// Pengaturan default untuk pengiriman file penuh
$start = 0;
$end = $size - 1;
$length = $size;

// Tangani HTTP Range requests (penting untuk browser seperti Safari, Chrome, Edge)
if (isset($_SERVER['HTTP_RANGE'])) {
    $c_start = $start;
    $c_end = $end;

    list(, $range) = explode('=', $_SERVER['HTTP_RANGE'], 2);
    if (strpos($range, ',') !== false) {
        header('HTTP/1.1 416 Requested Range Not Satisfiable');
        header("Content-Range: bytes $start-$end/$size");
        exit();
    }
    
    if ($range == '-') {
        $c_start = 0;
    } else {
        $parts = explode('-', $range);
        $c_start = intval($parts[0]);
        $c_end = (isset($parts[1]) && is_numeric($parts[1])) ? intval($parts[1]) : $size - 1;
    }
    
    $c_end = ($c_end > $end) ? $end : $c_end;
    if ($c_start > $c_end || $c_start > $size - 1 || $c_end >= $size) {
        header('HTTP/1.1 416 Requested Range Not Satisfiable');
        header("Content-Range: bytes $start-$end/$size");
        exit();
    }
    
    $start = $c_start;
    $end = $c_end;
    $length = $end - $start + 1;
    
    fseek($fp, $start);
    header('HTTP/1.1 206 Partial Content');
    header("Content-Range: bytes $start-$end/$size");
}

header("Content-Length: $length");

// Kirim file dalam bentuk chunk (8KB) untuk menghemat penggunaan memory RAM server
$buffer_size = 8192;
$bytes_sent = 0;

while (!feof($fp) && $bytes_sent < $length && (connection_status() == 0)) {
    $to_read = min($buffer_size, $length - $bytes_sent);
    $buffer = fread($fp, $to_read);
    echo $buffer;
    flush();
    $bytes_sent += strlen($buffer);
}

fclose($fp);
exit();
