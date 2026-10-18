-- ============================================================
-- Migration: Sistem Penugasan Kelas (Assignments) untuk GAS Website
-- Tanggal: Oktober 2026
-- ============================================================

USE gas_website;

-- 1. Tabel Penugasan Kelas
CREATE TABLE IF NOT EXISTS room_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT,
    due_date DATETIME NULL,
    max_points INT NOT NULL DEFAULT 100,
    attachment_path VARCHAR(500) DEFAULT NULL,
    attachment_name VARCHAR(255) DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_assign_room (room_id),
    INDEX idx_assign_due (due_date),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Tabel Pengumpulan Tugas Murid
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    room_id INT NOT NULL,
    student_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    notes TEXT DEFAULT NULL,
    status ENUM('submitted','graded') NOT NULL DEFAULT 'submitted',
    grade INT DEFAULT NULL,
    feedback TEXT DEFAULT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY unique_assign_student (assignment_id, student_id),
    INDEX idx_asub_assign (assignment_id),
    INDEX idx_asub_student (student_id),
    INDEX idx_asub_room (room_id),
    FOREIGN KEY (assignment_id) REFERENCES room_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Tabel Kolom Komentar / Diskusi Penugasan
CREATE TABLE IF NOT EXISTS assignment_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_acomm_assign (assignment_id),
    INDEX idx_acomm_user (user_id),
    FOREIGN KEY (assignment_id) REFERENCES room_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
