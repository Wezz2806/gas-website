import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError: (error: string) => void;
}

export default function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');

  // 1. Membaca Google Client ID dari file konfigurasi atau env
  // Karena kita berada di React client-side, kita bisa menggunakan import.meta.env.VITE_GOOGLE_CLIENT_ID
  // atau fallback ke string default jika pengguna belum mengkonfigurasinya.
  useEffect(() => {
    // Kita gunakan fallback client ID agar aplikasi tidak langsung error di awal, 
    // tetapi memberikan panduan jika belum dikonfigurasi.
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '825964426545-plkspl2p880j9v37s927p945d82ks901.apps.googleusercontent.com'; // Contoh Client ID placeholder
    setGoogleClientId(clientId);
  }, []);

  // 2. Memuat SDK Google Identity Services secara dinamis
  useEffect(() => {
    if (window.google) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => onError('Gagal memuat SDK login Google. Silakan periksa koneksi internet Anda.');
    
    document.body.appendChild(script);

    return () => {
      // Tidak menghapus script agar bisa digunakan kembali jika berpindah halaman
    };
  }, [onError]);

  // 3. Menginisialisasi dan merender Tombol Google resmi setelah script dimuat
  useEffect(() => {
    if (!scriptLoaded || !googleClientId || !buttonRef.current || !window.google) return;

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: any) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            onError('Google Sign-In tidak memberikan kredensial yang valid.');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'signin_with',
        shape: 'pill',
        logo_alignment: 'left',
      });
    } catch (err: any) {
      console.error('Error menginisialisasi Google Sign-In:', err);
      onError('Terjadi kesalahan saat mempersiapkan tombol masuk Google.');
    }
  }, [scriptLoaded, googleClientId, onSuccess, onError]);

  return (
    <div className="flex flex-col items-center justify-center w-full my-4">
      {!scriptLoaded ? (
        <div className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-500 w-[320px]">
          <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
          <span>Menyiapkan Google Sign-In...</span>
        </div>
      ) : (
        <div ref={buttonRef} className="w-[320px] h-[40px] flex justify-center animate-in fade-in duration-300"></div>
      )}
    </div>
  );
}

// Tambahkan deklarasi tipe window global agar TypeScript tidak komplain
declare global {
  interface Window {
    google?: any;
  }
}
