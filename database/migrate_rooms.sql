-- ============================================================
-- Migration: Sistem Kelas (Rooms) untuk GAS Website
-- Tanggal: Oktober 2026
-- ============================================================

-- 1. Tabel Rooms (Kelas)
CREATE TABLE IF NOT EXISTS rooms (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    name                 VARCHAR(200) NOT NULL,
    description          TEXT,
    room_key             VARCHAR(50) NOT NULL UNIQUE,
    cover_image          VARCHAR(500) DEFAULT NULL,
    created_by           INT NOT NULL,
    gamification_enabled TINYINT(1) NOT NULL DEFAULT 0,
    is_active            TINYINT(1) NOT NULL DEFAULT 1,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_room_key   (room_key),
    INDEX idx_created_by (created_by),
    INDEX idx_is_active  (is_active)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Tabel Room Members (Murid dalam Kelas)
CREATE TABLE IF NOT EXISTS room_members (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    room_id    INT NOT NULL,
    user_id    INT NOT NULL,
    joined_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_membership (room_id, user_id),
    INDEX idx_room (room_id),
    INDEX idx_user (user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Tabel Room EcoPedia (Materi per Kelas)
CREATE TABLE IF NOT EXISTS room_ecopedia (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    room_id     INT NOT NULL,
    title       VARCHAR(300) NOT NULL,
    category    VARCHAR(100) DEFAULT 'Umum',
    cover_url   VARCHAR(500) DEFAULT '',
    description TEXT,
    content     LONGTEXT,
    pdf_url     VARCHAR(500) DEFAULT '#',
    flip_url    VARCHAR(500) DEFAULT '',
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_room (room_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Tabel Room Meetings (Pertemuan & LKM EcoLab per Kelas)
CREATE TABLE IF NOT EXISTS room_meetings (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    room_id      INT NOT NULL,
    meeting_code VARCHAR(50) NOT NULL DEFAULT 'm1',
    number       INT NOT NULL DEFAULT 1,
    title        VARCHAR(300) NOT NULL,
    description  TEXT,
    icon         VARCHAR(50) DEFAULT 'science',
    status       VARCHAR(50) DEFAULT 'scheduled',
    embed_url    VARCHAR(500) DEFAULT '',
    download_url VARCHAR(500) DEFAULT '',
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_room (room_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. Tambah kolom room_id ke tabel-tabel existing jika belum ada
ALTER TABLE student_submissions ADD COLUMN room_id INT DEFAULT NULL;
ALTER TABLE eco_creation_videos ADD COLUMN room_id INT DEFAULT NULL;
ALTER TABLE eco_challenge_evaluations ADD COLUMN room_id INT DEFAULT NULL;
ALTER TABLE eco_challenge_comments ADD COLUMN room_id INT DEFAULT NULL;
ALTER TABLE eco_points_log ADD COLUMN room_id INT DEFAULT NULL;
ALTER TABLE sustainability_journals ADD COLUMN room_id INT DEFAULT NULL;
ALTER TABLE student_tests ADD COLUMN room_id INT DEFAULT NULL;
ALTER TABLE student_surveys ADD COLUMN room_id INT DEFAULT NULL;

-- 6. Tambah indeks untuk room_id
CREATE INDEX idx_submission_room ON student_submissions(room_id);
CREATE INDEX idx_video_room ON eco_creation_videos(room_id);
CREATE INDEX idx_comment_room ON eco_challenge_comments(room_id);
