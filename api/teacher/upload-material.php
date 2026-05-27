<?php
// api/teacher/upload-material.php

require_once '../config.php';

// Pastikan hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan. Gunakan POST.'
    ], 405);
}

// Proteksi Sesi & Akses Guru
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'teacher') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Tindakan ini hanya boleh dilakukan oleh Guru.'
    ], 403);
}

$user_id = $_SESSION['user']['id'];
$meeting_id = $_POST['meeting_id'] ?? '';

if (empty($meeting_id)) {
    sendJson([
        'success' => false,
        'message' => 'ID Pertemuan tidak boleh kosong.'
    ], 400);
}

// Validasi File Upload
if (!isset($_FILES['material_file']) || $_FILES['material_file']['error'] !== UPLOAD_ERR_OK) {
    sendJson([
        'success' => false,
        'message' => 'Tidak ada berkas yang diunggah atau terjadi kesalahan upload.'
    ], 400);
}

$file = $_FILES['material_file'];
$fileName = $file['name'];
$fileTmp = $file['tmp_name'];
$fileSize = $file['size'];
$fileType = $file['type'];

// Batasi ukuran file (maks 15MB)
if ($fileSize > 15 * 1024 * 1024) {
    sendJson([
        'success' => false,
        'message' => 'Ukuran berkas terlalu besar. Maksimum adalah 15MB.'
    ], 400);
}

// Batasi ekstensi file (hanya pdf, doc, docx, ppt, pptx, zip)
$allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip'];
$fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

if (!in_array($fileExt, $allowedExtensions)) {
    sendJson([
        'success' => false,
        'message' => 'Format berkas tidak diizinkan. Hanya menerima: ' . implode(', ', $allowedExtensions)
    ], 400);
}

// Buat direktori penyimpanan di workspace
$uploadDir = __DIR__ . '/../../uploads/materials/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Buat nama file unik
$uniqueFileName = 'material_' . $meeting_id . '_' . time() . '.' . $fileExt;
$destination = $uploadDir . $uniqueFileName;

if (move_uploaded_file($fileTmp, $destination)) {
    try {
        // Cek apakah data materi untuk meeting ini sudah ada
        $checkStmt = $pdo->prepare("SELECT id, filename FROM teacher_materials WHERE meeting_id = :meeting_id");
        $checkStmt->execute(['meeting_id' => $meeting_id]);
        $existing = $checkStmt->fetch();

        if ($existing) {
            // Hapus berkas lama jika ada
            $oldFile = $uploadDir . $existing['filename'];
            if (is_file($oldFile)) {
                unlink($oldFile);
            }

            // Update database
            $stmt = $pdo->prepare("
                UPDATE teacher_materials 
                SET filename = :filename, original_name = :original_name, created_at = CURRENT_TIMESTAMP 
                WHERE meeting_id = :meeting_id
            ");
            $stmt->execute([
                'filename' => $uniqueFileName,
                'original_name' => $fileName,
                'meeting_id' => $meeting_id
            ]);
        } else {
            // Insert baru ke database
            $stmt = $pdo->prepare("
                INSERT INTO teacher_materials (teacher_id, meeting_id, filename, original_name) 
                VALUES (:teacher_id, :meeting_id, :filename, :original_name)
            ");
            $stmt->execute([
                'teacher_id' => $user_id,
                'meeting_id' => $meeting_id,
                'filename' => $uniqueFileName,
                'original_name' => $fileName
            ]);
        }

        sendJson([
            'success' => true,
            'message' => 'Buku Panduan / Materi LKM berhasil diunggah.',
            'filename' => $uniqueFileName,
            'original_name' => $fileName
        ]);

    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mencatat data ke database: ' . $e->getMessage()
        ], 500);
    }
} else {
    sendJson([
        'success' => false,
        'message' => 'Gagal memindahkan berkas yang diunggah ke server.'
    ], 500);
}
