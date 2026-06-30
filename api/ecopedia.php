<?php
// api/ecopedia.php

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM ecopedia_books");
        $books = $stmt->fetchAll();
        sendJson([
            'success' => true,
            'books' => $books
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengambil data buku: ' . $e->getMessage()
        ], 500);
    }
} elseif ($method === 'POST') {
    // PROTEKSI ADMIN
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        sendJson([
            'success' => false,
            'message' => 'Akses ditolak. Hanya Administrator yang dapat mengubah data EcoPedia.'
        ], 403);
    }

    $body = getRequestBody();
    $action = isset($body['action']) ? trim($body['action']) : '';

    if ($action === 'delete') {
        $id = isset($body['id']) ? trim($body['id']) : '';
        if (empty($id)) {
            sendJson([
                'success' => false,
                'message' => 'ID buku wajib diisi untuk menghapus.'
            ], 400);
        }
        try {
            $stmt = $pdo->prepare("DELETE FROM ecopedia_books WHERE id = :id");
            $stmt->execute(['id' => $id]);
            sendJson([
                'success' => true,
                'message' => 'Buku berhasil dihapus.'
            ]);
        } catch (PDOException $e) {
            sendJson([
                'success' => false,
                'message' => 'Gagal menghapus buku: ' . $e->getMessage()
            ], 500);
        }
        exit;
    }

    $id = isset($body['id']) ? trim($body['id']) : '';
    $title = isset($body['title']) ? trim($body['title']) : '';
    $flip_url = isset($body['flip_url']) ? trim($body['flip_url']) : '';
    $cover_url = isset($body['cover_url']) ? trim($body['cover_url']) : '';
    
    if (empty($id) || empty($title) || empty($flip_url)) {
        sendJson([
            'success' => false,
            'message' => 'ID, judul buku, dan link e-book wajib diisi.'
        ], 400);
    }

    try {
        // Cek apakah buku sudah ada
        $stmtCheck = $pdo->prepare("SELECT id FROM ecopedia_books WHERE id = :id");
        $stmtCheck->execute(['id' => $id]);
        $exists = $stmtCheck->fetch();

        if ($exists) {
            // Update
            $stmt = $pdo->prepare("
                UPDATE ecopedia_books 
                SET title = :title, flip_url = :flip_url, cover_url = :cover_url
                WHERE id = :id
            ");
            $stmt->execute([
                'title' => $title,
                'flip_url' => $flip_url,
                'cover_url' => $cover_url,
                'id' => $id
            ]);
            sendJson([
                'success' => true,
                'message' => 'Buku EcoPedia berhasil diperbarui.'
            ]);
        } else {
            // Insert baru
            $stmt = $pdo->prepare("
                INSERT INTO ecopedia_books (id, title, flip_url, cover_url, pdf_url, tag_class, icon, content)
                VALUES (:id, :title, :flip_url, :cover_url, '#', 'bg-primary-container text-on-primary-fixed', 'science', '')
            ");
            $stmt->execute([
                'id' => $id,
                'title' => $title,
                'flip_url' => $flip_url,
                'cover_url' => $cover_url
            ]);
            sendJson([
                'success' => true,
                'message' => 'Buku EcoPedia baru berhasil ditambahkan.'
            ]);
        }
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal memproses data buku: ' . $e->getMessage()
        ], 500);
    }
} else {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan.'
    ], 405);
}
