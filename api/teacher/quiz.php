<?php
// api/teacher/quiz.php

require_once '../config.php';

// Pastikan session aktif
if (!isset($_SESSION['user'])) {
    sendJson([
        'success' => false,
        'message' => 'Sesi tidak aktif. Silakan login.'
    ], 401);
}

$user_role = $_SESSION['user']['role'];
$user_id = $_SESSION['user']['id'];
$method = $_SERVER['REQUEST_METHOD'];

// Handle GET: Boleh diakses oleh Guru, Admin, maupun Siswa (untuk kuis interaktif)
if ($method === 'GET') {
    try {
        // Cek jika data kosong, auto-populate dengan default kuis
        $countStmt = $pdo->query("SELECT COUNT(*) FROM quiz_questions");
        if ($countStmt->fetchColumn() == 0) {
            $defaultQuestions = [
                [
                    'Prinsip utama dalam Kimia Hijau (Green Chemistry) adalah...',
                    'Membuang limbah sejauh mungkin dari perkotaan ke perairan bebas',
                    'Mendesain proses kimia tanpa menghasilkan zat limbah berbahaya',
                    'Meningkatkan pembakaran batubara berteknologi tinggi secara maksimal',
                    'Membatasi ekspor produk sirkuler agar tidak bersaing di pasar luar',
                    1, 20, $user_id
                ],
                [
                    'Apa bahan baku organik utama yang difermentasi melingkar untuk menghasilkan ekoenzim?',
                    'Sampah botol plastik, kertas koran bekas, pecahan kaca, dan logam karat',
                    'Sisa kulit buah segar/sayur, gula (merah tebu/molase), dan air bersih',
                    'Limbah detergen mandi cair, minyak goreng jelantah bekas, dan tepung kanji',
                    'Kotoran padat hewan ternak, ampas kelapa kering diperas, dan ragi roti aktif',
                    1, 20, $user_id
                ],
                [
                    'Berapa rasio standar yang direkomendasikan untuk wadah fermentasi ekoenzim (Gula : Limbah Buah : Air)?',
                    '1 bagian Gula : 3 bagian Limbah Buah : 10 bagian Air',
                    '10 bagian Gula : 3 bagian Limbah Buah : 1 bagian Air',
                    '5 bagian Gula : 5 bagian Limbah Buah : 5 bagian Air',
                    '2 bagian Gula : 4 bagian Limbah Buah : 8 bagian Air',
                    0, 20, $user_id
                ],
                [
                    'Energi terbarukan manakah yang memanfaatkan panel fotovoltaik berefisiensi tinggi dari penemuan Graphene di EcoLab?',
                    'Turbin Angin Lepas Pantai Laut Utara',
                    'Pembangkit Listrik Biomassa Limbah Padat',
                    'Sel Surya Graphene Terobosan Efisiensi 40%',
                    'Pembangkit Arus Pasang Surut Air Samudra',
                    2, 20, $user_id
                ],
                [
                    'Rewilding kota (Urban Rewilding) bertujuan utama untuk...',
                    'Membangun pusat pembelanjaan modern megah berbasis fasad kaca',
                    'Menanam rumput sintetis karpet di sepanjang trotoar jalan tol',
                    'Mengenangkan vegetasi liar lokal demi meningkatkan keanekaragaman hayati dan menurunkan urban heat island',
                    'Menghilangkan habitat serangga penyerbuk dan mengusir burung migran',
                    2, 20, $user_id
                ]
            ];

            $insertStmt = $pdo->prepare("
                INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, points, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            foreach ($defaultQuestions as $q) {
                $insertStmt->execute($q);
            }
        }

        // Ambil semua soal
        $stmt = $pdo->query("SELECT * FROM quiz_questions ORDER BY id ASC");
        $questions = $stmt->fetchAll();

        sendJson([
            'success' => true,
            'questions' => $questions
        ]);

    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal mengambil soal kuis: ' . $e->getMessage()
        ], 500);
    }
}

// Proteksi Aksi Tulis (POST/PUT/DELETE): Hanya Guru/Admin
if ($user_role !== 'teacher' && $user_role !== 'admin') {
    sendJson([
        'success' => false,
        'message' => 'Akses ditolak. Tindakan ini hanya boleh dilakukan oleh Guru.'
    ], 403);
}

// Handle POST: Tambah Soal Baru
if ($method === 'POST') {
    $data = getRequestBody();

    if (empty($data['question']) || empty($data['option_a']) || empty($data['option_b']) || empty($data['option_c']) || empty($data['option_d']) || !isset($data['correct_answer'])) {
        sendJson([
            'success' => false,
            'message' => 'Pertanyaan, keempat opsi pilihan, dan indeks jawaban benar wajib diisi.'
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, points, created_by) 
            VALUES (:question, :option_a, :option_b, :option_c, :option_d, :correct_answer, :points, :created_by)
        ");
        $stmt->execute([
            'question' => $data['question'],
            'option_a' => $data['option_a'],
            'option_b' => $data['option_b'],
            'option_c' => $data['option_c'],
            'option_d' => $data['option_d'],
            'correct_answer' => (int)$data['correct_answer'],
            'points' => (int)($data['points'] ?? 20),
            'created_by' => $user_id
        ]);

        sendJson([
            'success' => true,
            'message' => 'Soal kuis baru berhasil ditambahkan.'
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal menambahkan soal kuis: ' . $e->getMessage()
        ], 500);
    }
}

// Handle PUT: Update Soal
if ($method === 'PUT') {
    $data = getRequestBody();

    if (empty($data['id']) || empty($data['question']) || empty($data['option_a']) || empty($data['option_b']) || empty($data['option_c']) || empty($data['option_d']) || !isset($data['correct_answer'])) {
        sendJson([
            'success' => false,
            'message' => 'ID, Pertanyaan, keempat opsi, dan jawaban benar wajib diisi.'
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE quiz_questions 
            SET question = :question, 
                option_a = :option_a, 
                option_b = :option_b, 
                option_c = :option_c, 
                option_d = :option_d, 
                correct_answer = :correct_answer, 
                points = :points 
            WHERE id = :id
        ");
        $stmt->execute([
            'question' => $data['question'],
            'option_a' => $data['option_a'],
            'option_b' => $data['option_b'],
            'option_c' => $data['option_c'],
            'option_d' => $data['option_d'],
            'correct_answer' => (int)$data['correct_answer'],
            'points' => (int)($data['points'] ?? 20),
            'id' => (int)$data['id']
        ]);

        sendJson([
            'success' => true,
            'message' => 'Soal kuis berhasil diperbarui.'
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal memperbarui soal kuis: ' . $e->getMessage()
        ], 500);
    }
}

// Handle DELETE: Hapus Soal
if ($method === 'DELETE') {
    $data = getRequestBody();

    if (empty($data['id'])) {
        sendJson([
            'success' => false,
            'message' => 'ID Soal tidak boleh kosong.'
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM quiz_questions WHERE id = :id");
        $stmt->execute(['id' => (int)$data['id']]);

        sendJson([
            'success' => true,
            'message' => 'Soal kuis berhasil dihapus.'
        ]);
    } catch (PDOException $e) {
        sendJson([
            'success' => false,
            'message' => 'Gagal menghapus soal kuis: ' . $e->getMessage()
        ], 500);
    }
}
