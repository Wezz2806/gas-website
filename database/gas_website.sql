-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 27 Bulan Mei 2026 pada 17.46
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gas_website`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `eco_challenge_comments`
--

CREATE TABLE `eco_challenge_comments` (
  `id` int(11) NOT NULL,
  `evaluation_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `eco_challenge_comments`
--

INSERT INTO `eco_challenge_comments` (`id`, `evaluation_id`, `student_id`, `content`, `created_at`) VALUES
(3, 1, 1, 'tes', '2026-05-26 16:39:57');

-- --------------------------------------------------------

--
-- Struktur dari tabel `eco_challenge_evaluations`
--

CREATE TABLE `eco_challenge_evaluations` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `evaluation_text` text NOT NULL,
  `published_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `eco_challenge_evaluations`
--

INSERT INTO `eco_challenge_evaluations` (`id`, `teacher_id`, `evaluation_text`, `published_at`, `updated_at`) VALUES
(1, 2, 'Secara keseluruhan, hasil test menunjukkan pemahaman yang baik terhadap materi ekoenzim dan kimia hijau.', '2026-05-25 20:52:24', '2026-05-25 20:52:24');

-- --------------------------------------------------------

--
-- Struktur dari tabel `eco_contact_messages`
--

CREATE TABLE `eco_contact_messages` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `student_name` varchar(100) NOT NULL,
  `subject` varchar(300) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `replied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `eco_creation_videos`
--

CREATE TABLE `eco_creation_videos` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `title` varchar(300) NOT NULL,
  `category` varchar(100) NOT NULL DEFAULT 'Umum',
  `duration` varchar(10) DEFAULT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reject_reason` varchar(500) DEFAULT NULL,
  `views` int(11) NOT NULL DEFAULT 0,
  `likes` int(11) NOT NULL DEFAULT 0,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `eco_creation_videos`
--

INSERT INTO `eco_creation_videos` (`id`, `student_id`, `title`, `category`, `duration`, `filename`, `original_name`, `status`, `reject_reason`, `views`, `likes`, `submitted_at`, `approved_at`) VALUES
(3, 1, 'tes', 'Sains Rumah', '02:47', 'video_1_1779811779.mp4', 'YTDown_YouTube_K3BI-Oke-OFFICIAL-MUSIC-VIDEO_Media_1GGadUpfXVM_006_144p.mp4', 'approved', NULL, 7, 1, '2026-05-26 16:09:39', '2026-05-26 16:09:39');

-- --------------------------------------------------------

--
-- Struktur dari tabel `eco_creation_video_comments`
--

CREATE TABLE `eco_creation_video_comments` (
  `id` int(11) NOT NULL,
  `video_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `eco_creation_video_comments`
--

INSERT INTO `eco_creation_video_comments` (`id`, `video_id`, `student_id`, `content`, `created_at`) VALUES
(1, 3, 1, 'tes', '2026-05-26 16:16:01');

-- --------------------------------------------------------

--
-- Struktur dari tabel `eco_points_log`
--

CREATE TABLE `eco_points_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `points` smallint(6) NOT NULL,
  `reason` varchar(200) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `meetings`
--

CREATE TABLE `meetings` (
  `id` varchar(50) NOT NULL,
  `number` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT 'science',
  `status` enum('completed','ongoing','scheduled') DEFAULT 'scheduled',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `meetings`
--

INSERT INTO `meetings` (`id`, `number`, `title`, `description`, `icon`, `status`, `updated_at`) VALUES
('m1', 1, 'Kickoff & Pengadaan', 'Menentukan tujuan dan mencari bahan organik mentah untuk fermentasi.', 'groups', 'completed', '2026-05-25 17:49:11'),
('m2', 2, 'Kontrol Proses', 'Memantau tingkat pH dan menetapkan protokol pengenceran harian.', 'science', 'ongoing', '2026-05-25 17:49:11'),
('m3', 3, 'Persiapan Enzim Aktif', 'Memanen konsentrat yang telah terfermentasi dan pengenceran untuk pembuatan sabun.', 'biotech', 'scheduled', '2026-05-25 17:49:11'),
('m4', 4, 'Pengemasan Produk', 'Meracik formula sabun enzim, pelabelan, dan presentasi produk kepada komunitas sekolah.', 'inventory', 'scheduled', '2026-05-25 17:49:11');

-- --------------------------------------------------------

--
-- Struktur dari tabel `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `student_submissions`
--

CREATE TABLE `student_submissions` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `meeting_id` varchar(50) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `grade` tinyint(4) DEFAULT NULL,
  `teacher_comment` text DEFAULT NULL,
  `status` enum('pending','graded') DEFAULT 'pending',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `graded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('student','teacher','admin') DEFAULT 'student',
  `avatar_url` varchar(500) DEFAULT NULL,
  `eco_points` int(11) DEFAULT 0,
  `streak` int(11) DEFAULT 0,
  `auth_provider` enum('local','google') DEFAULT 'local',
  `google_id` varchar(255) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_checkin` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `avatar_url`, `eco_points`, `streak`, `auth_provider`, `google_id`, `last_login`, `created_at`, `updated_at`, `last_checkin`) VALUES
(1, 'akun tes', 'tes@gmail.com', '$2y$10$/zofsIa.6ER3oF9bggsKiOoUUd7OEatrM30/DEiX/lBmDNeCAt9iK', 'student', '/uploads/avatars/avatar_1_1779813551.jpg', 0, 2, 'local', NULL, NULL, '2026-05-24 02:45:04', '2026-05-27 15:09:54', '2026-05-27'),
(2, 'Guru GAS', 'teacher@gas.id', '\\/lD3qs0nziHMs/YQN.0oIuwsYbbG7vjvcYnMHt2t2lfOW5a5i', 'teacher', NULL, 100, 5, 'local', NULL, NULL, '2026-05-24 02:57:01', '2026-05-24 02:57:01', NULL);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `eco_challenge_comments`
--
ALTER TABLE `eco_challenge_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_evaluation` (`evaluation_id`),
  ADD KEY `idx_student` (`student_id`);

--
-- Indeks untuk tabel `eco_challenge_evaluations`
--
ALTER TABLE `eco_challenge_evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indeks untuk tabel `eco_contact_messages`
--
ALTER TABLE `eco_contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indeks untuk tabel `eco_creation_videos`
--
ALTER TABLE `eco_creation_videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_approved_at` (`approved_at`);

--
-- Indeks untuk tabel `eco_creation_video_comments`
--
ALTER TABLE `eco_creation_video_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_video` (`video_id`),
  ADD KEY `idx_student` (`student_id`);

--
-- Indeks untuk tabel `eco_points_log`
--
ALTER TABLE `eco_points_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indeks untuk tabel `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email_otp` (`email`,`otp_code`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indeks untuk tabel `student_submissions`
--
ALTER TABLE `student_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_meeting` (`meeting_id`),
  ADD KEY `idx_student_meeting` (`student_id`,`meeting_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_meeting_status` (`meeting_id`,`status`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `google_id` (`google_id`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_eco_points` (`eco_points`),
  ADD KEY `idx_auth_provider` (`auth_provider`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `eco_challenge_comments`
--
ALTER TABLE `eco_challenge_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `eco_challenge_evaluations`
--
ALTER TABLE `eco_challenge_evaluations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `eco_contact_messages`
--
ALTER TABLE `eco_contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `eco_creation_videos`
--
ALTER TABLE `eco_creation_videos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `eco_creation_video_comments`
--
ALTER TABLE `eco_creation_video_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `eco_points_log`
--
ALTER TABLE `eco_points_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `student_submissions`
--
ALTER TABLE `student_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `eco_challenge_comments`
--
ALTER TABLE `eco_challenge_comments`
  ADD CONSTRAINT `eco_challenge_comments_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `eco_challenge_evaluations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `eco_challenge_comments_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `eco_challenge_evaluations`
--
ALTER TABLE `eco_challenge_evaluations`
  ADD CONSTRAINT `eco_challenge_evaluations_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `eco_contact_messages`
--
ALTER TABLE `eco_contact_messages`
  ADD CONSTRAINT `eco_contact_messages_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `eco_creation_videos`
--
ALTER TABLE `eco_creation_videos`
  ADD CONSTRAINT `eco_creation_videos_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `eco_creation_video_comments`
--
ALTER TABLE `eco_creation_video_comments`
  ADD CONSTRAINT `eco_creation_video_comments_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `eco_creation_videos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `eco_creation_video_comments_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `eco_points_log`
--
ALTER TABLE `eco_points_log`
  ADD CONSTRAINT `eco_points_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `student_submissions`
--
ALTER TABLE `student_submissions`
  ADD CONSTRAINT `student_submissions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
