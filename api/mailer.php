<?php
// api/mailer.php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Muat autoloader Composer
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

/**
 * Mengirimkan email OTP lupa password menggunakan PHPMailer.
 * 
 * @param string $toEmail Email tujuan
 * @param string $otpCode Kode OTP 6 digit
 * @param string $fullName Nama lengkap pengguna
 * @return bool True jika berhasil, False jika gagal
 */
function sendOtpEmail($toEmail, $otpCode, $fullName) {
    // Membaca file .env secara sederhana jika ada
    $smtp_host = 'smtp.gmail.com';
    $smtp_port = 587;
    $smtp_user = ''; // Masukkan email SMTP Anda
    $smtp_pass = ''; // Masukkan App Password SMTP Anda
    $smtp_from_name = 'GAS Platform';

    $env_file = __DIR__ . '/../.env';
    if (file_exists($env_file)) {
        $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            if ($key === 'SMTP_HOST') $smtp_host = $value;
            if ($key === 'SMTP_PORT') $smtp_port = (int)$value;
            if ($key === 'SMTP_USERNAME') $smtp_user = $value;
            if ($key === 'SMTP_PASSWORD') $smtp_pass = $value;
            if ($key === 'SMTP_FROM_NAME') $smtp_from_name = $value;
        }
    }

    // Jika username dan password SMTP kosong, kita buat log simulasi OTP
    // Ini sangat membantu agar pendevelopan tidak stuck ketika belum ada akun SMTP rill!
    if (empty($smtp_user) || empty($smtp_pass)) {
        $log_dir = __DIR__ . '/../logs';
        if (!is_dir($log_dir)) {
            mkdir($log_dir, 0777, true);
        }
        $log_msg = "[" . date('Y-m-d H:i:s') . "] SIMULASI EMAIL OTP ke $toEmail ($fullName): $otpCode\n";
        file_put_contents($log_dir . '/otp_emails.log', $log_msg, FILE_APPEND);
        return true; // Simulasikan sukses pengiriman
    }

    $mail = new PHPMailer(true);

    try {
        // Konfigurasi Server SMTP
        $mail->isSMTP();
        $mail->Host       = $smtp_host;
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtp_user;
        $mail->Password   = $smtp_pass;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $smtp_port;
        $mail->CharSet    = 'UTF-8';

        // Pengirim & Penerima
        $mail->setFrom($smtp_user, $smtp_from_name);
        $mail->addAddress($toEmail, $fullName);

        // Konten Email
        $mail->isHTML(true);
        $mail->Subject = '🌱 Kode OTP Reset Password - GAS Website';
        
        // Template Desain Premium bertema Hijau Lingkungan (GAS)
        $mail->Body    = "
        <div style='font-family: \"Inter\", sans-serif, Arial; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid rgba(21, 66, 18, 0.15); border-radius: 16px; background-color: #F9F9F6; box-shadow: 0 4px 12px rgba(0,0,0,0.03);'>
            <div style='text-align: center; padding-bottom: 20px; border-bottom: 3px solid #154212;'>
                <span style='font-size: 32px;'>🌱</span>
                <h2 style='color: #154212; margin: 5px 0 0 0; font-family: \"Montserrat\", Arial; font-weight: 700;'>GAS Website</h2>
                <p style='color: #42493e; font-size: 14px; margin: 5px 0 0 0;'>Green Academic & Sustainability Platform</p>
            </div>
            <div style='padding: 25px 0;'>
                <p style='color: #1a1c1c; font-size: 16px; margin-top: 0;'>Halo <strong>$fullName</strong>,</p>
                <p style='color: #42493e; font-size: 14px; line-height: 1.6; margin-bottom: 20px;'>Kami menerima permintaan untuk melakukan pengaturan ulang sandi (reset password) akun Anda di GAS Website. Silakan gunakan kode OTP berikut untuk melanjutkan verifikasi:</p>
                
                <div style='text-align: center; margin: 30px 0;'>
                    <span style='display: inline-block; font-family: \"JetBrains Mono\", monospace, Courier; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #154212; background-color: #E8F5E9; padding: 16px 32px; border: 2px dashed #91f78e; border-radius: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);'>$otpCode</span>
                </div>
                
                <p style='color: #b3261e; font-size: 12px; font-weight: 700; margin-bottom: 20px;'>⚠️ PENTING: Kode ini berlaku selama 15 menit dan hanya dapat digunakan satu kali. Jangan berikan kode ini kepada pihak manapun termasuk tim GAS Website.</p>
                <p style='color: #42493e; font-size: 14px; line-height: 1.6; margin-bottom: 0;'>Jika Anda tidak merasa meminta pengaturan ulang password ini, harap abaikan email ini dengan aman. Sandi Anda tidak akan berubah.</p>
            </div>
            <div style='text-align: center; padding-top: 20px; border-top: 1px solid rgba(21, 66, 18, 0.1); color: #8e928a; font-size: 12px;'>
                <p style='margin: 0;'>© " . date('Y') . " GAS Website. All rights reserved.</p>
                <p style='margin: 6px 0 0 0; font-style: italic; color: #154212; font-weight: 500;'>\"Satu aksi kecil hari ini, untuk bumi berkelanjutan esok hari.\" 🌍</p>
            </div>
        </div>
        ";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Gagal mengirim email OTP: " . $mail->ErrorInfo);
        return false;
    }
}
