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
    getenv('RAILWAY_ENVIRONMENT') !== false ||
    (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'localhost') === false && strpos($_SERVER['HTTP_HOST'], '127.0.0.1') === false) ||
    (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
);

// Set CORS headers dynamically based on Origin header to prevent CORS issues
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost:5173',
    'https://gas-website.netlify.app',
    'https://gaslearn.netlify.app',
    'https://gas-website-production-46db.up.railway.app',
];

if (in_array($origin, $allowed_origins)) {
    $allowed_origin = $origin;
} else {
    $allowed_origin = getenv('FRONTEND_URL') ?: 'https://gaslearn.netlify.app';
}
header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
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

// Auto migration: Update schema constraints and tables
try {
    // 1. Clean up legacy role values to prevent ALTER TABLE failure
    try {
        $pdo->exec("DELETE FROM users WHERE role = 'teacher' AND id = 9999");
        $pdo->exec("UPDATE users SET role = 'student' WHERE role = 'teacher'");
        $pdo->exec("ALTER TABLE users MODIFY COLUMN role ENUM('student', 'admin') NOT NULL DEFAULT 'student'");
    } catch (PDOException $ex) {
        error_log('Users role migration failed: ' . $ex->getMessage());
    }

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

    // Seeding default evaluation if an admin exists
    $adminId = $pdo->query("SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1")->fetchColumn();
    if ($adminId) {
        $pdo->exec("INSERT IGNORE INTO eco_challenge_evaluations (id, teacher_id, evaluation_text) VALUES (1, $adminId, 'Evaluasi Kimia Hijau')");
    }

    // Auto-migration: ecopedia_books
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ecopedia_books (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(300) NOT NULL,
            category VARCHAR(100) DEFAULT '',
            tag_class VARCHAR(100) DEFAULT '',
            icon VARCHAR(50) DEFAULT 'science',
            description TEXT,
            content TEXT,
            pdf_url VARCHAR(500) DEFAULT '#',
            flip_url VARCHAR(500) DEFAULT NULL,
            cover_url VARCHAR(500) DEFAULT ''
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Auto-migration: ecoupdate_news
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ecoupdate_news (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(300) NOT NULL,
            category VARCHAR(150) NOT NULL,
            date VARCHAR(100) NOT NULL,
            read_time VARCHAR(50) NOT NULL,
            description TEXT NOT NULL,
            content TEXT NOT NULL,
            cover_url VARCHAR(500) NOT NULL,
            author VARCHAR(150) NOT NULL,
            likes INT NOT NULL DEFAULT 0,
            comments_count INT NOT NULL DEFAULT 0,
            url VARCHAR(500) DEFAULT ''
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Auto-migration: ecocontact_members
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ecocontact_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            role VARCHAR(100) NOT NULL,
            program VARCHAR(150) DEFAULT '',
            instansi VARCHAR(250) NOT NULL,
            email VARCHAR(150) DEFAULT '',
            phone VARCHAR(50) DEFAULT '',
            office_hours VARCHAR(100) DEFAULT '',
            avatar VARCHAR(500) DEFAULT '',
            sort_order INT NOT NULL DEFAULT 0
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Auto-migration: ecolab_meetings
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS ecolab_meetings (
            id VARCHAR(50) PRIMARY KEY,
            number INT NOT NULL,
            title VARCHAR(300) NOT NULL,
            description TEXT,
            icon VARCHAR(50) DEFAULT 'science',
            status VARCHAR(50) DEFAULT 'scheduled',
            embed_url VARCHAR(500) DEFAULT '',
            download_url VARCHAR(500) DEFAULT ''
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Auto-migration: sustainability_journals
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS sustainability_journals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            row_index INT NOT NULL,
            tanggal VARCHAR(100) DEFAULT '',
            warna VARCHAR(100) DEFAULT '',
            aroma VARCHAR(100) DEFAULT '',
            gas VARCHAR(100) DEFAULT '',
            alasan TEXT,
            solusi TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_student_row (student_id, row_index)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Auto-migration: student_surveys
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS student_surveys (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            answers TEXT NOT NULL,
            feedback TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_student_survey (student_id)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Auto-migration: student_tests
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS student_tests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            answers TEXT NOT NULL,
            current_step INT DEFAULT 1,
            submitted TINYINT DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_student_test (student_id)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Auto-migration: test_cases
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS test_cases (
            id INT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content_json LONGTEXT NOT NULL,
            questions_json LONGTEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ");

    // Seed test_cases if empty
    $checkTestCases = $pdo->query("SELECT COUNT(*) FROM test_cases")->fetchColumn();
    if ($checkTestCases == 0) {
        $casesData = [
            [
                1,
                "KASUS 1: Dari Botol ke Mikroplastik yang Kembali ke Meja Makan Kita",
                json_encode([
                    [
                        "type" => "paragraph",
                        "value" => "Setiap pagi, kantin sekolah dipenuhi murid yang membeli minuman dalam botol plastik sekali pakai. Dalam sehari, satu sekolah dapat menghasilkan ratusan botol plastik berbahan PET (polyethylene terephthalate). Tren menunjukkan peningkatan produksi plastik global meningkat dari ±200 juta ton (2000) menjadi lebih dari 400 juta ton (2024) melonjak dua kali lipat karena tuntutan masyarakat terhadap konsumsi kemasan sekali pakai."
                    ],
                    [
                        "type" => "paragraph",
                        "value" => "Namun sampah plastik ini berakhir langsung dibuang, sebagian dibuang ke tempat sampah, tetapi tidak sedikit yang tercecer di lingkungan dan terbawa air hujan menuju selokan."
                    ],
                    [
                        "type" => "paragraph",
                        "value" => "Data dari Kementerian Lingkungan Hidup dan Kehutanan (KLHK) menunjukkan bahwa Indonesia menghasilkan sekitar 68,5 juta ton sampah per tahun, dengan plastik mencapai ±17%. Di kota besar seperti Surabaya, sebagian sampah plastik ini berakhir di sungai yang bermuara ke laut. Plastik yang tidak terkelola akan terpapar sinar UV dan mengalami degradasi fisik menjadi mikroplastik."
                    ],
                    [
                        "type" => "paragraph",
                        "value" => "Mikroplastik ini masuk ke rantai makanan melalui organisme air seperti plankton dan ikan kecil. Studi global oleh UNEP menunjukkan bahwa mikroplastik telah ditemukan dalam air minum, garam, dan bahkan tubuh manusia. Ironisnya, plastik yang awalnya digunakan untuk kenyamanan manusia justru kembali sebagai ancaman kesehatan dan lingkungan. Di sisi lain, kebiasaan konsumsi praktis terus meningkat. Tanpa perubahan perilaku dan inovasi material, pencemaran ini akan semakin sulit dikendalikan."
                    ]
                ], JSON_UNESCAPED_UNICODE),
                json_encode([
                    ["id" => "q1", "label" => "1. Berdasarkan kasus diatas di jelaskan jika plastik menyumbang 17% sampah di Indonesia. Jelaskan mengapa plastik sekali pakai dapat menyebabkan pencemaran lingkungan yang berkepanjangan! Hubungkan jawabanmu dengan sifat-sifat plastik dalam kehidupan sehari-hari dan dampaknya terhadap lingkungan."],
                    ["id" => "q2", "label" => "2. Identifikasilah faktor-faktor utama yang menyebabkan meningkatnya pencemaran plastik sekali pakai di lingkungan sekolah dan perkotaan. Jelaskan hubungan antara faktor tersebut dengan buruknya akumulasi plastik di lingkungan!"],
                    ["id" => "q3", "label" => "3. Analisislah dampak keberadaan mikroplastik terhadap organisme hidup dengan meninjau aspek kimia (interaksi dengan zat berbahaya) dan ekologi (rantai makanan). Jelaskan bagaimana proses tersebut dapat berdampak pada manusia!"],
                    ["id" => "q4", "label" => "4. Rancanglah solusi alternatif untuk mengurangi penggunaan plastik sekali pakai di lingkungan sekolah dengan menerapkan minimal dua prinsip green chemistry!"]
                ], JSON_UNESCAPED_UNICODE)
            ],
            [
                2,
                "KASUS 2: Limbah Deterjen Rumah Tangga",
                json_encode([
                    [
                        "type" => "paragraph",
                        "value" => "Di kawasan aliran Sungai Cikarang Bekasi Laut (CBL), aktivitas rumah tangga menjadi salah satu sumber utama pencemaran air. Setiap hari, masyarakat menggunakan deterjen untuk mencuci pakaian dan peralatan rumah tangga. Air limbah cucian yang mengandung surfaktan dan fosfat langsung dialirkan ke saluran drainase tanpa pengolahan lalu bermuara ke sungai yang juga dimanfaatkan untuk kebutuhan sehari-hari."
                    ],
                    [
                        "type" => "paragraph",
                        "value" => "Surfaktan dalam deterjen memiliki sifat hidrofilik dan hidrofobik yang efektif mengangkat kotoran, tetapi juga berpotensi mengganggu organisme air. Sementara itu, fosfat berperan sebagai “nutrisi” bagi alga. Ketika jumlahnya berlebih terjadi eutrofikasi atau ledakan pertumbuhan alga yang menutupi permukaan air. Akibatnya cahaya matahari terhalang dan kadar oksigen terlarut menurun drastis."
                    ],
                    [
                        "type" => "table",
                        "value" => [
                            "headers" => ["Jenis Deterjen", "Kandungan Fosfat (%)", "Biodegradabilitas", "Dampak Lingkungan"],
                            "rows" => [
                                ["Deterjen konvensional", "20–35%", "Rendah", "Tinggi (eutrofikasi)"],
                                ["Deterjen rendah fosfat", "5–10%", "Sedang", "Sedang"],
                                ["Deterjen ramah lingkungan", "<1%", "Tinggi", "Rendah"]
                            ]
                        ]
                    ]
                ], JSON_UNESCAPED_UNICODE),
                json_encode([
                    ["id" => "q5", "label" => "5. Berdasarkan data kualitas air dan penjelasan tentang surfaktan dalam kasus, jelaskan bagaimana sifat kimia surfaktan dapat memengaruhi kualitas air sungai!"],
                    ["id" => "q6", "label" => "6. Perhatikan data kadar fosfat dan kondisi air pada kasus. Jelaskan hubungan antara peningkatan kadar fosfat dengan terjadinya eutrofikasi di perairan!"],
                    ["id" => "q7", "label" => "7. Berdasarkan narasi kasus, identifikasi: a. Sumber utama pencemaran air, b. Zat kimia yang berperan dalam pencemaran. Jelaskan alasan Anda!"],
                    ["id" => "q8", "label" => "8. Jelaskan salah satu solusi adalah penggunaan deterjen ramah lingkungan. Evaluasilah solusi tersebut berdasarkan prinsip green chemistry!"]
                ], JSON_UNESCAPED_UNICODE)
            ],
            [
                3,
                "KASUS 3: Pestisida Kimia: Panen Melimpah atau Lingkungan Terancam?",
                json_encode([
                    [
                        "type" => "paragraph",
                        "value" => "Pertanian sayur di Jawa Timur rutin menggunakan pestisida kimia sintetis untuk mengatasi serangan hama ulat dan wereng. Dalam satu musim tanam, penyemprotan dilakukan hingga 8–12 kali demi menjaga hasil panen tetap tinggi. Salah satu pestisida yang digunakan mengandung senyawa organofosfat yang bersifat toksik dan relatif persisten di lingkungan."
                    ],
                    [
                        "type" => "paragraph",
                        "value" => "Namun, dalam beberapa tahun terakhir, masyarakat mulai mengeluhkan perubahan lingkungan. Populasi lebah penyerbuk menurun drastis, ikan di saluran irigasi sering ditemukan mati, dan beberapa petani mengalami gejala pusing serta iritasi kulit setelah penyemprotan. Hasil uji sederhana menunjukkan adanya residu pestisida pada sayuran yang melebihi batas aman."
                    ],
                    [
                        "type" => "paragraph",
                        "value" => "Di sisi lain, petani menghadapi dilema jika harus memilih tanpa pestisida maka risiko gagal panen meningkat dan berdampak pada ekonomi mereka. Penggunaan pestisida memang meningkatkan produktivitas tetapi juga memicu pencemaran tanah, air, serta berpotensi membahayakan kesehatan manusia melalui rantai makanan."
                    ],
                    [
                        "type" => "paragraph",
                        "value" => "Diagram Tren Penggunaan Pestisida (Indonesia) - 2018 (45000), 2019 (48500), 2020 (52000), 2021 (55000), 2022 (58000)"
                    ]
                ], JSON_UNESCAPED_UNICODE),
                json_encode([
                    ["id" => "q9", "label" => "9. Berdasarkan data pada kasus, residu pestisida pada sayuran melebihi batas aman dan terjadi penurunan populasi organisme seperti lebah dan ikan. Jelaskan bagaimana sifat kimia pestisida sintetis dapat menyebabkan dampak tersebut terhadap lingkungan dan organisme hidup!"],
                    ["id" => "q10", "label" => "10. Petani masih bergantung pada pestisida kimia untuk menjaga hasil panen. Rancang satu solusi berbasis prinsip green chemistry yang dapat digunakan sebagai alternatif pestisida kimia, serta jelaskan alasan ilmiahnya!"],
                    ["id" => "q11", "label" => "11. Pestisida yang bersifat lipofilik dapat masuk ke rantai makanan dan mengalami peningkatan konsentrasi. Analisis bagaimana proses ini terjadi dari lingkungan hingga ke manusia, serta kaitkan dengan dampaknya terhadap kesehatan!"]
                ], JSON_UNESCAPED_UNICODE)
            ]
        ];

        $insertStmt = $pdo->prepare("INSERT INTO test_cases (id, title, content_json, questions_json) VALUES (?, ?, ?, ?)");
        foreach ($casesData as $c) {
            $insertStmt->execute($c);
        }
    }

    // Ensure student_submissions meeting_id has the correct collation to prevent illegal mix of collations on JOIN
    try {
        $pdo->exec("ALTER TABLE student_submissions MODIFY meeting_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL");
    } catch (PDOException $e) {
        // Table might not exist yet during initial setup
    }

    // Seeding: ecolab_meetings
    $checkMeetings = $pdo->query("SELECT COUNT(*) FROM ecolab_meetings")->fetchColumn();
    if ($checkMeetings == 0) {
        $pdo->exec("
            INSERT INTO ecolab_meetings (id, number, title, description, icon, status, embed_url, download_url) VALUES
            ('m1', 1, 'Mengapa green chemistry penting?', 'Lembar Kerja Murid 1: Menganalisis urgensi dan prinsip dasar Green Chemistry.', 'groups', 'completed', 'https://drive.google.com/file/d/11an9PvFIlJnrJniqR2Z_k8W4hudX2yM_/preview', 'https://drive.google.com/file/d/11an9PvFIlJnrJniqR2Z_k8W4hudX2yM_/view?usp=sharing'),
            ('m2', 2, 'Integrasi Prinsip Green Chemistry dalam Masalah Lingkungan', 'Lembar Kerja Murid 2: Memahami integrasi Green Chemistry dalam penyelesaian isu lingkungan.', 'science', 'ongoing', 'https://drive.google.com/file/d/1leOTPkIbRbEH8Lsy28B1yCnoeykc9RaQ/preview', 'https://drive.google.com/file/d/1leOTPkIbRbEH8Lsy28B1yCnoeykc9RaQ/view?usp=sharing'),
            ('m3', 3, 'Aksi Nyata Berkelanjutan Berbasis Prinsip Green Chemistry', 'Lembar Kerja Murid 3: Merancang dan melaksanakan aksi nyata berkelanjutan berbasis kimia hijau.', 'biotech', 'scheduled', 'https://drive.google.com/file/d/18Y8klb4fEvTAy5AZL8--ihxX2df1rffg/preview', 'https://drive.google.com/file/d/18Y8klb4fEvTAy5AZL8--ihxX2df1rffg/view?usp=sharing'),
            ('m4', 4, 'Agents of Change: Sampah Organik menjadi Solusi Organik', 'Lembar Kerja Murid 4: Mengembangkan solusi organik dari pengolahan limbah sampah organik sekitar.', 'inventory', 'scheduled', 'https://drive.google.com/file/d/14bqlkq9CD9DXx7N2VmzjdDxluy0RFgO5/preview', 'https://drive.google.com/file/d/14bqlkq9CD9DXx7N2VmzjdDxluy0RFgO5/view?usp=sharing')
        ");
    }


    // Seeding: ecopedia_books
    $checkBooks = $pdo->query("SELECT COUNT(*) FROM ecopedia_books")->fetchColumn();
    if ($checkBooks == 0) {
        $pdo->exec("
            INSERT INTO ecopedia_books (id, title, category, tag_class, icon, description, content, pdf_url, flip_url, cover_url) VALUES
            ('green-chemistry', 'Solusi Sat-Set untuk Penyelamatan Bumi: Green Chemistry dan Keberlanjutan Lingkungan', '', 'bg-primary-container text-on-primary-fixed', 'science', '', 'Buku ini menyajikan 12 prinsip pokok Kimia Hijau (Green Chemistry) untuk mengurangi atau menonaktifkan penggunaan zat kimia berbahaya. Buku ini mengajarkan bagaimana rancangan molekul organik dapat disintesis menggunakan biokatalis alamiah dengan memaksimalkan atom economy, meminimalkan limbah pencemaran air, dan mengoptimalkan sirkulasi bahan ramah lingkungan untuk masa depan industri global.', '#', 'https://online.fliphtml5.com/azzanuriahw/Buku-Ajar-1---Green-Chemistry/', './Cover Buku 1.png'),
            ('ecoenzyme', 'Bukan Sihir, Cuma Sains: Keajaiban Eco Enzyme yang Bikin Geleng Kepala', '', 'bg-secondary-container text-on-secondary-container', 'compost', '', 'Panduan luar biasa ini menjelaskan langkah demi langkah untuk memfermentasi sisa kulit buah segar dan sayuran bersama gula merah/molase di air bersih dengan rasio emas 1:3:10. Selama 3 bulan berjalan, mikroba pengurai menghasilkan cairan multi-manfaat yang kaya akan asam asetat, amilase, lipase, dan enzim aktif lainnya yang berguna sebagai pembersih alami, disinfektan bebas toksin, serta pupuk organik penyubur tanah.', '#', 'https://online.fliphtml5.com/azzanuriahw/Buku-Ajar-2---Ecoenzyme/', './Cover Buku 2.png')
        ");
    }

    // Seeding: ecoupdate_news
    $checkNews = $pdo->query("SELECT COUNT(*) FROM ecoupdate_news")->fetchColumn();
    if ($checkNews == 0) {
        $stmt = $pdo->prepare("
            INSERT INTO ecoupdate_news (title, category, date, read_time, description, content, cover_url, author, likes, comments_count, url) VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            'Ratusan Perempuan Surabaya Deklarasikan “She Heroes” di CFD Tunjungan',
            'Berita Lokal', '26 April 2026', '5 menit baca',
            'Sekitar 500 perempuan memadati kawasan Car Free Day Jalan Tunjungan untuk mengikuti Deklarasi Gerakan “She Heroes” sebagai upaya menekan timbulan sampah plastik sekali pakai.',
            'Sekitar 500 perempuan memadati kawasan Car Free Day Jalan Tunjungan untuk mengikuti Deklarasi Gerakan “She Heroes”. Gerakan ini mengajak perempuan mulai beralih dari pembalut sekali pakai menuju produk ramah lingkungan sebagai upaya menekan timbulan sampah plastik yang sulit terurai. Asisten Pemerintahan dan Kesejahteraan Rakyat Kota Surabaya, M. Fikser, menegaskan bahwa sampah pembalut sekali pakai menjadi ancaman nyata bagi sungai and lingkungan karena butuh waktu hingga 500 tahun untuk terurai. Bumbi bersama Tunas Hijau menghadirkan alternatif ramah lingkungan sebagai solusi nyata bagi satu juta perempuan usia produktif di Surabaya demi masa depan ekologis kota yang berkelanjutan.',
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
            'Tunas Hijau ID', 412, 18,
            'https://tunashijau.id/ratusan-perempuan-surabaya-deklarasikan-she-heroes-di-cfd-tunjungan/'
        ]);
        
        $stmt->execute([
            'Penjualan Mobil Listrik di Surabaya Naik 4 Kali Lipat pada Awal 2026',
            'Berita Lokal', '19 Mei 2026', '4 menit baca',
            'Penjualan kendaraan listrik (EV) di Kota Surabaya mengalami kenaikan drastis hingga lebih dari empat kali lipat pada kuartal pertama 2026 berkat efisiensi biaya dan kemudahan perawatan.',
            'Indomobil Dealers Group terus mendorong percepatan adopsi kendaraan listrik (EV) di Indonesia melalui gelaran pameran otomotif. CEO Indomobil Dealers Group, Santiko Wardoyo, menyatakan bahwa kendaraan listrik sangat ekonomis and efisien dari sisi bahan bakar serta perawatan pasca-penjualan yang jauh lebih murah karena tidak memerlukan oli. Untuk menunjang hal ini, PLN UID Jawa Timur berkomitmen dengan menyediakan sekitar 300 stasiun pengisian daya (SPKLU) yang tersebar luas demi meningkatkan kepercayaan masyarakat menggunakan kendaraan ramah lingkungan.',
            'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
            'Lukman Hakim', 356, 22,
            'httpsSurabaya.inews.id/read/691788/penjualan-mobil-listrik-di-surabaya-naik-4-kali-lipat-pada-awal-2026'
        ]);
        
        $stmt->execute([
            'Resolusi 2026 Namira Eco Print Surabaya: Gaungkan “Back to Nature”, Ajak Anak Muda Lebih Peduli Lingkungan',
            'Berita Lokal', '23 Januari 2026', '5 menit baca',
            'Menyambut tahun 2026, Namira Eco Print Surabaya mengusung tema "Back to Nature" dengan meluncurkan koleksi warna-warna alami dan mengajak generasi muda lebih peduli terhadap kelestarian alam.',
            'Menyambut tahun 2026, Namira Eco Print menegaskan komitmennya untuk terus bergerak bersama alam melalui koleksi bernuansa "Back to Nature". Owner Namira Eco Print, Yayuk Eko Agustin, menyampaikan bahwa konsep ini diwujudkan dengan eksplorasi tanaman mangrove dan pewarna alami seperti rebusan bubuk kayu lockwood yang memunculkan warna biru lembut. Namira memegang komitmen teguh: siapa yang memetik daun wajib menanam kembali. Diharapkan produk fesyen ini dapat menjadi sarana edukasi bagi Gen Z dan Gen Alpha untuk mulai menghargai alam di sekitar mereka.',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
            'Dimas Mahendra', 289, 14,
            'https://radarsurabaya.jawapos.com/surabaya/2601230024/resolusi-2026-namira-eco-print-surabaya-gaungkan-back-to-nature-ajak-anak-muda-lebih-peduli-lingkungan'
        ]);
        
        $stmt->execute([
            'Air Hujan Kota Surabaya Terkontaminasi Mikroplastik: Ecoton Himbau Warga Tidak Telan Air Hujan Secara Langsung',
            'Berita Lokal', '23 November 2025', '5 menit baca',
            'Penelitian terbaru dari Ecoton bersama jejaring GrowGreen, Jejak, dan River Warrior mengungkap air hujan di Surabaya terkontaminasi mikroplastik, dengan konsentrasi tertinggi di daerah Pakis Gelora dan Tanjung Perak.',
            'Penelitian terbaru dari Lembaga Kajian Ekologi dan Konservasi Lahan Basah (Ecoton) bersama komunitas GrowGreen dan Jejak menunjukkan bahwa seluruh sampel air hujan di Kota Surabaya telah terkontaminasi oleh mikroplastik jenis fiber. Konsentrasi tertinggi ditemukan di Pakis Gelora dengan 356 partikel per liter and Tanjung Perak dengan 309 partikel per liter. Kontaminasi ini dipicu oleh pembakaran sampah terbuka, gesekan ban kendaraan dengan aspal, serta evaporasi uap air laut yang tercemar plastik. Ecoton mengimbau masyarakat tidak menelan air hujan secara langsung demi kesehatan.',
            'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=800&q=80',
            'Ecoton News', 512, 37,
            'https://ecoton.or.id/air-hujan-kota-surabaya-terkontaminasi-mikroplastik-ecoton-himbau-warga-tidak-telan-air-hujan-secara-langsung/'
        ]);
        
        $stmt->execute([
            '5 Things to Watch in Climate and Environment in 2026',
            'Berita Global', '21 Januari 2026', '6 menit baca',
            'Tahun 2026 menjadi momen krusial bagi aksi iklim global, kerja sama internasional, perkotaan berkelanjutan, dan keberpihakan pada sains.',
            'United Nations University merilis lima tren lingkungan global utama yang wajib diperhatikan sepanjang tahun 2026: (1) peningkatan suhu bumi global yang mendekati overshoot 1.5 derajat Celcius, (2) negosiasi COP 31 di Turki mengenai kelanjutan target pendanaan iklim developing nations, (3) upaya penyelarasan tiga konvensi Rio Conventions (Iklim, Biodiversitas, dan Lahan Degradasi), (4) peran strategis kepemimpinan perkotaan dalam transisi berkelanjutan yang adil di World Urban Forum Baku, serta (5) pentingnya mempertahankan komitmen kolaborasi ilmiah internasional berbasis data dan sains terpercaya.',
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
            'United Nations University', 624, 45,
            'https://unu.edu/ehs/article/5-things-watch-climate-and-environment-2026'
        ]);
    }

    // Seeding: ecocontact_members
    $checkContacts = $pdo->query("SELECT COUNT(*) FROM ecocontact_members")->fetchColumn();
    if ($checkContacts == 0) {
        $stmt = $pdo->prepare("
            INSERT INTO ecocontact_members (name, role, program, instansi, email, phone, office_hours, avatar, sort_order) VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            'Azza Nuriah Widowati, M.Pd.', 'Guru & Peneliti', 'S3 Pendidikan Sains', 'Universitas Negeri Surabaya',
            'azzanuriahw@gmail.com', '081554319722', '08.00 - 15.00 WIB', './azza.jpg', 0
        ]);
        $stmt->execute([
            'Prof. Dr. Endang Susantini, M.Pd.', 'Promotor', '', 'Universitas Negeri Surabaya',
            '', '', '', './prof endang.jpg', 1
        ]);
        $stmt->execute([
            'Prof. Dr. Utiya Azizah, M.Pd.', 'Co-Promotor', '', 'Universitas Negeri Surabaya',
            '', '', '', './prof utiya.jpg', 2
        ]);
    }
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
