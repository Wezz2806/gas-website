<?php
// api/ecoupdate.php

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM ecoupdate_news ORDER BY id DESC");
        $news = $stmt->fetchAll();
        sendJson([
            'success' => true,
            'news' => $news
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengambil data berita: ' . $e->getMessage()
        ], 500);
    }
} elseif ($method === 'POST') {
    // PROTEKSI ADMIN
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        sendJson([
            'success' => false,
            'message' => 'Akses ditolak. Hanya Administrator yang dapat mengedit EcoUpdate.'
        ], 403);
    }

    $body = getRequestBody();
    $action = isset($body['action']) ? $body['action'] : '';

    // Aksi hapus berita
    if ($action === 'delete') {
        $id = isset($body['id']) ? (int)$body['id'] : null;
        if (!$id) {
            sendJson([
                'success' => false,
                'message' => 'ID berita wajib disertakan untuk menghapus.'
            ], 400);
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM ecoupdate_news WHERE id = :id");
            $stmt->execute(['id' => $id]);
            sendJson([
                'success' => true,
                'message' => 'Berita berhasil dihapus.'
            ]);
        } catch (PDOException $e) {
            sendJson([
                'success' => false,
                'message' => 'Gagal menghapus berita: ' . $e->getMessage()
            ], 500);
        }
    } else {
        // Tambah atau Edit berita
        $id = isset($body['id']) ? (int)$body['id'] : null;
        $title = isset($body['title']) ? trim($body['title']) : '';
        $category = isset($body['category']) ? trim($body['category']) : 'Berita Lokal';
        $description = isset($body['description']) ? trim($body['description']) : '';
        $content = isset($body['content']) ? trim($body['content']) : '';
        $cover_url = isset($body['cover_url']) ? trim($body['cover_url']) : '';
        $author = isset($body['author']) ? trim($body['author']) : '';
        $url = isset($body['url']) ? trim($body['url']) : '';

        if (empty($title) || empty($description) || empty($content) || empty($cover_url)) {
            sendJson([
                'success' => false,
                'message' => 'Judul, deskripsi singkat, isi lengkap, dan URL cover berita wajib diisi.'
            ], 400);
        }

        if (empty($author)) {
            $author = $_SESSION['user']['full_name'];
        }

        try {
            if ($id) {
                // Update berita
                $stmt = $pdo->prepare("
                    UPDATE ecoupdate_news 
                    SET title = :title, category = :category, description = :description, 
                        content = :content, cover_url = :cover_url, author = :author, url = :url
                    WHERE id = :id
                ");
                $stmt->execute([
                    'title' => $title,
                    'category' => $category,
                    'description' => $description,
                    'content' => $content,
                    'cover_url' => $cover_url,
                    'author' => $author,
                    'url' => $url,
                    'id' => $id
                ]);
                sendJson([
                    'success' => true,
                    'message' => 'Berita berhasil diperbarui.'
                ]);
            } else {
                // Tambah berita baru
                $date = date('d F Y'); // Format tanggal lokal, misal 30 June 2026
                $read_time = ceil(str_word_count($content) / 200) . ' menit baca';
                
                $stmt = $pdo->prepare("
                    INSERT INTO ecoupdate_news (title, category, date, read_time, description, content, cover_url, author, url)
                    VALUES (:title, :category, :date, :read_time, :description, :content, :cover_url, :author, :url)
                ");
                $stmt->execute([
                    'title' => $title,
                    'category' => $category,
                    'date' => $date,
                    'read_time' => $read_time,
                    'description' => $description,
                    'content' => $content,
                    'cover_url' => $cover_url,
                    'author' => $author,
                    'url' => $url
                ]);
                sendJson([
                    'success' => true,
                    'message' => 'Berita baru berhasil ditambahkan.'
                ]);
            }
        } catch (PDOException $e) {
            sendJson([
                'success' => false,
                'message' => 'Gagal memproses data berita: ' . $e->getMessage()
            ], 500);
        }
    }
} elseif ($method === 'DELETE') {
    // PROTEKSI ADMIN
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        sendJson([
            'success' => false,
            'message' => 'Akses ditolak.'
        ], 403);
    }

    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if (!$id) {
        sendJson([
            'success' => false,
            'message' => 'ID berita tidak valid.'
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM ecoupdate_news WHERE id = :id");
        $stmt->execute(['id' => $id]);
        sendJson([
            'success' => true,
            'message' => 'Berita berhasil dihapus.'
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal menghapus berita: ' . $e->getMessage()
        ], 500);
    }
} else {
    sendJson([
        'success' => false,
        'message' => 'Metode request tidak diizinkan.'
    ], 405);
}
