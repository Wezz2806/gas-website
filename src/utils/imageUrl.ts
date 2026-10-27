// src/utils/imageUrl.ts

/**
 * Peta fallback gambar test bawaan untuk menjamin gambar selalu muncul
 * bahkan jika server backend /uploads belum tersinkronisasi atau mengembalikan 404.
 */
export const TEST_IMAGE_FALLBACK_MAP: Record<string, string> = {
  // Kasus 1
  'test_img_6a566d83ad09f.jpg': '/test/kasus1_sampah_plastik.jpg',
  'test_img_6a566d83ad191.png': '/test/kasus1_alur_mikroplastik.png',
  'test_1784049193_2135.png': '/test/kasus1_alur_mikroplastik.png',
  'kasus1_sampah_plastik.jpg': '/test/kasus1_sampah_plastik.jpg',
  'kasus1_alur_mikroplastik.png': '/test/kasus1_alur_mikroplastik.png',

  // Kasus 2
  'test_img_6a566eb4b7d3b.jpg': '/test/kasus2_busa_sungai.jpg',
  'test_1784049364_6790.png': '/test/kasus2_alur_eutrofikasi.png',
  'kasus2_busa_sungai.jpg': '/test/kasus2_busa_sungai.jpg',
  'kasus2_alur_eutrofikasi.png': '/test/kasus2_alur_eutrofikasi.png',

  // Kasus 3
  'test_img_6a566f5939ea0.jpg': '/test/kasus3_penggunaan_pestisida.jpg',
  'test_img_6a566f5939c82.png': '/test/kasus3_tren_pestisida.png',
  'kasus3_penggunaan_pestisida.jpg': '/test/kasus3_penggunaan_pestisida.jpg',
  'kasus3_tren_pestisida.png': '/test/kasus3_tren_pestisida.png',

  // Kasus 4
  'test_img_6a566fb75d5c2.jpg': '/test/kasus4_pabrik_gas.jpg',
  'kasus4_pabrik_gas.jpg': '/test/kasus4_pabrik_gas.jpg',

  // Kasus 5
  'test_1784049713_5733.png': '/test/kasus5_proses_pembakaran.png',
  'test_1784049721_5026.png': '/test/kasus5_energi_perubahan_iklim.png',
  'kasus5_proses_pembakaran.png': '/test/kasus5_proses_pembakaran.png',
  'kasus5_energi_perubahan_iklim.png': '/test/kasus5_energi_perubahan_iklim.png',
};

/**
 * Mencari URL cadangan lokal jika path gambar cocok dengan kasus test bawaan.
 */
export function getTestImageFallback(path: string | null | undefined): string | null {
  if (!path || typeof path !== 'string') return null;
  const filename = path.split('/').pop() || path;
  if (TEST_IMAGE_FALLBACK_MAP[filename]) {
    return TEST_IMAGE_FALLBACK_MAP[filename];
  }
  for (const [key, fallbackUrl] of Object.entries(TEST_IMAGE_FALLBACK_MAP)) {
    if (path.includes(key)) {
      return fallbackUrl;
    }
  }
  return null;
}

/**
 * Menyelesaikan path gambar menjadi URL yang dapat dimuat oleh browser.
 */
export function getImageUrl(path: string | null | undefined, defaultFallback = ''): string {
  if (!path || typeof path !== 'string') return defaultFallback;
  const trimmed = path.trim();
  if (!trimmed) return defaultFallback;

  // Jika sudah URL absolut atau blob/data URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Jika mengacu pada file statis bawaan public/test
  const fallback = getTestImageFallback(trimmed);
  
  // Normalisasi path dengan leading slash
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
  const BACKEND_URL = (typeof API_BASE === 'string' ? API_BASE.replace(/\/api\/?$/, '') : '') || '';

  // Jika URL backend didefinisikan secara absolut (misal https://backend.railway.app)
  // dan path adalah /uploads/..., arahkan ke backend
  if (BACKEND_URL && BACKEND_URL.startsWith('http') && cleanPath.startsWith('/uploads/')) {
    return `${BACKEND_URL}${cleanPath}`;
  }

  // Jika ada fallback lokal di public/ dan path awalnya adalah uploads test yang berisiko 404
  if (fallback && cleanPath.startsWith('/uploads/test/')) {
    // Kita coba gunakan URL backend terlebih dahulu, tetapi jika sama-sama relatif gunakan fallback langsung
    if (!BACKEND_URL || !BACKEND_URL.startsWith('http')) {
      return fallback;
    }
  }

  return cleanPath;
}

/**
 * Event handler onError untuk tag <img> agar otomatis beralih ke gambar cadangan
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, customFallback?: string) {
  const target = e.currentTarget;
  const currentSrc = target.src || '';
  const fallback = customFallback || getTestImageFallback(currentSrc) || getTestImageFallback(target.getAttribute('src'));

  if (fallback && !currentSrc.endsWith(fallback)) {
    target.src = fallback;
    return;
  }

  // Jika sudah mencoba fallback atau tidak ada fallback, gunakan inline SVG visual placeholder
  target.onerror = null; // Mencegah infinite loop
  target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="%23f1f5f9"><rect width="400" height="250" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2" rx="12"/><text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="%2364748b">Ilustrasi Kasus Soal</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="11" fill="%2394a3b8">GAS Website - Pembelajaran CASUAL</text></svg>`;
}
