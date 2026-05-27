-- ============================================================
--  GAS Website — Database Migration v1 → v2
--  Jalankan script ini jika database gas_website sudah ada
--  dan ingin diperbarui TANPA menghapus data yang ada.
--
--  Cara menjalankan:
--    phpMyAdmin → Database gas_website → SQL → Paste & Run
--  atau via terminal:
--    mysql -u root gas_website < database/migrate_v2.sql
-- ============================================================

USE gas_website;

-- ── 1. Tambah kolom last_login ke users (jika belum ada) ─────────────────────
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL AFTER google_id;

-- ── 2. Tambah INDEX yang hilang di users ─────────────────────────────────────
ALTER TABLE users
    ADD INDEX IF NOT EXISTS idx_role          (role),
    ADD INDEX IF NOT EXISTS idx_eco_points    (eco_points DESC),
    ADD INDEX IF NOT EXISTS idx_auth_provider (auth_provider);

-- ── 3. Perbaiki INDEX password_resets ────────────────────────────────────────
-- Hapus index lama yang terpisah, ganti dengan covering index
ALTER TABLE password_resets
    DROP INDEX IF EXISTS idx_email,
    DROP INDEX IF EXISTS idx_otp;

ALTER TABLE password_resets
    ADD INDEX IF NOT EXISTS idx_email_otp (email, otp_code),
    ADD INDEX IF NOT EXISTS idx_expires   (expires_at);

-- ── 4. Tambah covering index ke student_submissions ───────────────────────────
ALTER TABLE student_submissions
    ADD INDEX IF NOT EXISTS idx_student_meeting (student_id, meeting_id),
    ADD INDEX IF NOT EXISTS idx_status          (status),
    ADD INDEX IF NOT EXISTS idx_meeting_status  (meeting_id, status);

-- ── 5. HAPUS tabel yang sudah tidak digunakan ────────────────────────────────
DROP TABLE IF EXISTS teacher_materials;
DROP TABLE IF EXISTS quiz_questions;

-- ── 6. Perbaiki tabel meetings ───────────────────────────────────────────────
-- Hapus kolom created_by yang tidak perlu lagi
ALTER TABLE meetings
    DROP FOREIGN KEY IF EXISTS meetings_ibfk_1;
ALTER TABLE meetings
    DROP COLUMN IF EXISTS created_by;

-- Seed data jika tabel meetings kosong
INSERT IGNORE INTO meetings (id, number, title, description, icon, status) VALUES
  ('m1', 1, 'Kickoff & Pengadaan',     'Menentukan tujuan dan mencari bahan organik mentah untuk fermentasi.',                    'groups',    'completed'),
  ('m2', 2, 'Kontrol Proses',          'Memantau tingkat pH dan menetapkan protokol pengenceran harian.',                         'science',   'ongoing'),
  ('m3', 3, 'Persiapan Enzim Aktif',  'Memanen konsentrat yang telah terfermentasi dan pengenceran untuk pembuatan sabun.',      'biotech',   'scheduled'),
  ('m4', 4, 'Pengemasan Produk',       'Meracik formula sabun enzim, pelabelan, dan presentasi produk kepada komunitas sekolah.', 'inventory', 'scheduled');

-- ── 7. Buat tabel-tabel BARU yang belum ada ───────────────────────────────────
CREATE TABLE IF NOT EXISTS eco_challenge_evaluations (
    id              INT        AUTO_INCREMENT PRIMARY KEY,
    teacher_id      INT        NOT NULL,
    evaluation_text TEXT       NOT NULL,
    published_at    TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS eco_challenge_comments (
    id             INT        AUTO_INCREMENT PRIMARY KEY,
    evaluation_id  INT        NOT NULL,
    student_id     INT        NOT NULL,
    content        TEXT       NOT NULL,
    created_at     TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluation_id) REFERENCES eco_challenge_evaluations(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id)    REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_evaluation (evaluation_id),
    INDEX idx_student    (student_id)
);

CREATE TABLE IF NOT EXISTS eco_creation_videos (
    id            INT          AUTO_INCREMENT PRIMARY KEY,
    student_id    INT          NOT NULL,
    title         VARCHAR(300) NOT NULL,
    category      VARCHAR(100) NOT NULL DEFAULT 'Umum',
    duration      VARCHAR(10)  DEFAULT NULL,
    filename      VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    status        ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    reject_reason VARCHAR(500) DEFAULT NULL,
    views         INT          NOT NULL DEFAULT 0,
    likes         INT          NOT NULL DEFAULT 0,
    submitted_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at   TIMESTAMP    NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student    (student_id),
    INDEX idx_status     (status),
    INDEX idx_approved_at (approved_at DESC)
);

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
    INDEX idx_student  (student_id),
    INDEX idx_is_read  (is_read),
    INDEX idx_created  (created_at DESC)
);

CREATE TABLE IF NOT EXISTS eco_points_log (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    points     SMALLINT     NOT NULL,
    reason     VARCHAR(200) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user    (user_id),
    INDEX idx_created (created_at DESC)
);

-- ── Selesai ───────────────────────────────────────────────────────────────────
SELECT 'Migrasi database v2 berhasil!' AS status;
