-- ============================================================
--  GAS Website — Database Schema (Revisi 2)
--  Dibuat ulang: Mei 2026
--  Perubahan dari v1:
--    - Hapus: teacher_materials (modul guru dihapus)
--    - Hapus: quiz_questions (posttest kini pakai Google Form)
--    - Hapus: kolom role teacher dari ENUM users (tetap ada 'teacher' untuk admin)
--    - Tambah: eco_challenge_comments (kolom evaluasi + komentar siswa)
--    - Tambah: eco_creation_videos (unggahan video siswa)
--    - Tambah: eco_contact_messages (pesan siswa ke guru)
--    - Tambah: INDEX tambahan untuk query umum
--    - Tambah: kolom last_login di users
-- ============================================================

CREATE DATABASE IF NOT EXISTS gas_website
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gas_website;

-- ── TABEL PENGGUNA ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            INT            AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(100)   NOT NULL,
    email         VARCHAR(150)   NOT NULL UNIQUE,
    password_hash VARCHAR(255)   DEFAULT NULL,   -- NULL jika login via Google
    role          ENUM('student','admin') NOT NULL DEFAULT 'student',
    avatar_url    VARCHAR(500)   DEFAULT NULL,
    eco_points    INT            NOT NULL DEFAULT 0,
    streak        INT            NOT NULL DEFAULT 0,
    auth_provider ENUM('local','google') NOT NULL DEFAULT 'local',
    google_id     VARCHAR(255)   DEFAULT NULL UNIQUE,
    last_login    TIMESTAMP      NULL,
    last_checkin  DATE           DEFAULT NULL,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email        (email),
    INDEX idx_role         (role),
    INDEX idx_eco_points   (eco_points DESC),   -- untuk leaderboard
    INDEX idx_auth_provider (auth_provider)
);

-- ── TABEL RESET PASSWORD (OTP) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_resets (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(150) NOT NULL,
    otp_code   VARCHAR(6)   NOT NULL,
    expires_at TIMESTAMP    NOT NULL,
    used       TINYINT(1)   NOT NULL DEFAULT 0,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_email_otp (email, otp_code),   -- covering index untuk lookup cepat
    INDEX idx_expires   (expires_at)          -- untuk cleanup expired OTPs
);

-- ── TABEL PENGUMPULAN TUGAS LKM SISWA ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_submissions (
    id            INT          AUTO_INCREMENT PRIMARY KEY,
    student_id    INT          NOT NULL,
    meeting_id    VARCHAR(10)  NOT NULL,          -- m1, m2, m3, m4
    filename      VARCHAR(255) NOT NULL,           -- nama file di server
    original_name VARCHAR(255) NOT NULL,           -- nama file asli dari siswa
    grade         TINYINT UNSIGNED DEFAULT NULL,   -- nilai 0-100 dari guru
    teacher_comment TEXT        DEFAULT NULL,      -- catatan/masukan dari guru
    status        ENUM('pending','graded') NOT NULL DEFAULT 'pending',
    submitted_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    graded_at     TIMESTAMP    NULL,

    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_student_meeting (student_id, meeting_id),  -- covering index
    INDEX idx_status          (status),
    INDEX idx_meeting_status  (meeting_id, status)       -- untuk filter guru
);

-- ── TABEL AGENDA PERTEMUAN/MEETINGS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meetings (
    id          VARCHAR(10)  NOT NULL PRIMARY KEY,   -- m1, m2, m3, m4
    number      TINYINT      NOT NULL,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    icon        VARCHAR(50)  NOT NULL DEFAULT 'science',
    status      ENUM('completed','ongoing','scheduled') NOT NULL DEFAULT 'scheduled',
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed data awal untuk 4 meeting ekoenzim
INSERT IGNORE INTO meetings (id, number, title, description, icon, status) VALUES
  ('m1', 1, 'Kickoff & Pengadaan',     'Menentukan tujuan dan mencari bahan organik mentah untuk fermentasi.',                    'groups',    'completed'),
  ('m2', 2, 'Kontrol Proses',          'Memantau tingkat pH dan menetapkan protokol pengenceran harian.',                         'science',   'ongoing'),
  ('m3', 3, 'Persiapan Enzim Aktif',  'Memanen konsentrat yang telah terfermentasi dan pengenceran untuk pembuatan sabun.',      'biotech',   'scheduled'),
  ('m4', 4, 'Pengemasan Produk',       'Meracik formula sabun enzim, pelabelan, dan presentasi produk kepada komunitas sekolah.', 'inventory', 'scheduled');

-- ── TABEL KOLOM EVALUASI ECOCHALLENGE ────────────────────────────────────────
-- Menyimpan teks evaluasi guru dan komentar diskusi siswa
CREATE TABLE IF NOT EXISTS eco_challenge_evaluations (
    id            INT        AUTO_INCREMENT PRIMARY KEY,
    teacher_id    INT        NOT NULL,                  -- guru yang menulis evaluasi
    evaluation_text TEXT     NOT NULL,
    published_at  TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS eco_challenge_comments (
    id             INT          AUTO_INCREMENT PRIMARY KEY,
    evaluation_id  INT          NOT NULL,
    student_id     INT          NOT NULL,
    content        TEXT         NOT NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (evaluation_id) REFERENCES eco_challenge_evaluations(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id)    REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_evaluation (evaluation_id),
    INDEX idx_student    (student_id)
);

-- ── TABEL UNGGAHAN VIDEO ECOCREATION ─────────────────────────────────────────
-- Video diunggah siswa, ditinjau guru sebelum tampil
CREATE TABLE IF NOT EXISTS eco_creation_videos (
    id            INT          AUTO_INCREMENT PRIMARY KEY,
    student_id    INT          NOT NULL,
    title         VARCHAR(300) NOT NULL,
    category      VARCHAR(100) NOT NULL DEFAULT 'Umum',
    duration      VARCHAR(10)  DEFAULT NULL,               -- format MM:SS
    filename      VARCHAR(255) NOT NULL,                    -- nama file di server
    original_name VARCHAR(255) NOT NULL,
    status        ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    reject_reason VARCHAR(500) DEFAULT NULL,
    views         INT          NOT NULL DEFAULT 0,
    likes         INT          NOT NULL DEFAULT 0,
    submitted_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at   TIMESTAMP    NULL,

    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_student (student_id),
    INDEX idx_status  (status),
    INDEX idx_approved_at (approved_at DESC)   -- untuk urutan galeri terbaru
);

-- ── TABEL PESAN ECOCONTACT (Siswa → Guru) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS eco_contact_messages (
    id           INT          AUTO_INCREMENT PRIMARY KEY,
    student_id   INT          NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    subject      VARCHAR(300) NOT NULL,
    message      TEXT         NOT NULL,
    is_read      TINYINT(1)   NOT NULL DEFAULT 0,
    replied_at   TIMESTAMP    NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_student   (student_id),
    INDEX idx_is_read   (is_read),
    INDEX idx_created   (created_at DESC)
);

-- ── TABEL ECO-POINTS LOG (Opsional — untuk audit trail) ──────────────────────
-- Mencatat setiap penambahan eco-points beserta alasannya
CREATE TABLE IF NOT EXISTS eco_points_log (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    points     SMALLINT     NOT NULL,                  -- bisa negatif
    reason     VARCHAR(200) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_user    (user_id),
    INDEX idx_created (created_at DESC)
);

-- ── TABEL ECO-CREATION VIDEO COMMENTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS eco_creation_video_comments (
    id          INT          AUTO_INCREMENT PRIMARY KEY,
    video_id    INT          NOT NULL,
    student_id  INT          NOT NULL,
    content     TEXT         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (video_id) REFERENCES eco_creation_videos(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_video   (video_id),
    INDEX idx_student (student_id)
);
