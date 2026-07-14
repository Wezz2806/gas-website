import { Book, Meeting, VideoItem, NewsArticle, VideoCreation, QuizQuestion } from './types';

export const initialBooks: Book[] = [
  {
    id: 'green-chemistry',
    title: 'Solusi Sat-Set untuk Penyelamatan Bumi: Green Chemistry dan Keberlanjutan Lingkungan',
    category: '',
    tagClass: 'bg-primary-container text-on-primary-fixed',
    icon: 'science',
    description: '',
    content: 'Buku ini menyajikan 12 prinsip pokok Kimia Hijau (Green Chemistry) untuk mengurangi atau menonaktifkan penggunaan zat kimia berbahaya. Buku ini mengajarkan bagaimana rancangan molekul organik dapat disintesis menggunakan biokatalis alamiah dengan memaksimalkan atom economy, meminimalkan limbah pencemaran air, dan mengoptimalkan sirkulasi bahan ramah lingkungan untuk masa depan industri global.',
    coverUrl: './Cover Buku 1.png',
    pdfUrl: '#',
    flipUrl: 'https://online.fliphtml5.com/azzanuriahw/Buku-Ajar-1---Green-Chemistry/'
  },
  {
    id: 'ecoenzyme',
    title: 'Bukan Sihir, Cuma Sains: Keajaiban Eco Enzyme yang Bikin Geleng Kepala',
    category: '',
    tagClass: 'bg-secondary-container text-on-secondary-container',
    icon: 'compost',
    description: '',
    content: 'Panduan luar biasa ini menjelaskan langkah demi langkah untuk memfermentasi sisa kulit buah segar dan sayuran bersama gula merah/molase di air bersih dengan rasio emas 1:3:10. Selama 3 bulan berjalan, mikroba pengurai menghasilkan cairan multi-manfaat yang kaya akan asam asetat, amilase, lipase, dan enzim aktif lainnya yang berguna sebagai pembersih alami, disinfektan bebas toksin, serta pupuk organik penyubur tanah.',
    coverUrl: './Cover Buku 2.png',
    pdfUrl: '#',
    flipUrl: 'https://online.fliphtml5.com/azzanuriahw/Buku-Ajar-2---Ecoenzyme/'
  }
];

export const initialMeetings: Meeting[] = [
  {
    id: 'm1',
    number: 1,
    title: 'Mengapa green chemistry penting?',
    description: 'Lembar Kerja Murid 1: Menganalisis urgensi dan prinsip dasar Green Chemistry.',
    icon: 'groups',
    status: 'completed'
  },
  {
    id: 'm2',
    number: 2,
    title: 'Integrasi Prinsip Green Chemistry dalam Masalah Lingkungan',
    description: 'Lembar Kerja Murid 2: Memahami integrasi Green Chemistry dalam penyelesaian isu lingkungan.',
    icon: 'science',
    status: 'ongoing'
  },
  {
    id: 'm3',
    number: 3,
    title: 'Aksi Nyata Berkelanjutan Berbasis Prinsip Green Chemistry',
    description: 'Lembar Kerja Murid 3: Merancang dan melaksanakan aksi nyata berkelanjutan berbasis kimia hijau.',
    icon: 'biotech',
    status: 'scheduled'
  },
  {
    id: 'm4',
    number: 4,
    title: 'Agents of Change: Sampah Organik menjadi Solusi Organik',
    description: 'Lembar Kerja Murid 4: Mengembangkan solusi organik dari pengolahan limbah sampah organik sekitar.',
    icon: 'inventory',
    status: 'scheduled'
  }
];

export const initialVideos: VideoItem[] = [
  {
    id: 'v1',
    title: 'Tutorial Ekoenzim',
    category: 'DASAR',
    duration: '12:45 min',
    description: 'Panduan komprehensif tentang rasio gula, air, dan limbah organik yang benar untuk fermentasi yang sempurna.',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFMO5WexFqVuoDG1cEApGHvk89g7c_T83MYaAW029RqlqKqTf7Z-hc_LnqX_TsiBiZhA0AMVNy6EkrNzvHSIs27pexj9ikWFNAgj9zH3Z9t_ZadkIoN97GX1WY8cS7c3_hIkuZZvac7icxtYCIGhq5l01EIKGMncNtelwRniMOOAMe93KuNTCQ2K8IT_DKoE3aCWuWM__34KQm-DE-L0a4rfkRAsuvBFBl_vjcUy4P3s1fPjzX3KvKP1q3Nrzo6Yiii6uLDpmOQu4e'
  },
  {
    id: 'v2',
    title: 'Pembuatan Sabun Ekoenzim',
    category: 'LANJUTAN',
    duration: '18:20 min',
    description: 'Masterclass langkah demi langkah tentang penggunaan sabun proses dingin menggunakan ekoenzim matang sebagai agen pembersih alami.',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXKmdSHKI87aQTAXZsPKHlcm-Gf9ebbKQiB8ijs8BYCOseNmMpS-9o0aYU_7w6WeqcodAQyrJYWfO9cfXmuAZ4Nb_IQ9JWHvv_tbGW94-yKB09-BtZdBZMJrNtAZuJOU4HUmid39Mjkegy-Aaz5heNph8pD4N1hIbfD3FAeH0OIo_LZbUq2R9ycjW4wHtMNTWyMJC5Atpsz8LR9jS6iI3JvBopCOBxv4_VXqY9gDzekc5yLELvSAb5CNCYzdr4cb8VxFGLQIt9dpnN'
  }
];

export const initialNews: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Berita Lingkungan Lokal dari metrotvnews.com',
    category: 'Berita Lokal',
    date: '14 July 2026',
    readTime: '5 menit baca',
    description: 'Akses langsung artikel lengkap untuk membaca berita seputar lingkungan hidup.',
    content: 'Akses langsung artikel lengkap untuk membaca berita seputar lingkungan hidup.',
    coverUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    author: 'metrotvnews.com',
    likes: 376,
    commentsCount: 13,
    url: 'https://www.metrotvnews.com/play/b1oCOX23-sidak-adipura-menteri-hanif-soroti-tumpukan-sampah-di-sungai-dan-tps-liar-surabaya'
  },
  {
    id: 'news-2',
    title: 'Peringati Hari Bumi, ECOTON Hiasi Manequin dengan Sachet | Pilar.ID',
    category: 'Berita Lokal',
    date: '14 July 2026',
    readTime: '3 menit baca',
    description: 'Surabaya (pilar.id) - Dalam memperingati Hari Bumi yang jatuh pada 22 April. Yayasan ECOTON bersama beberapa komunitas, mahasiswa dan lainnya turun aksi di depan gedung Grahadi, Surabaya, Jumat (22/4/2022) Pada aksi kali ini, berdasar penjelasan Kholid Basyaiban, selaku Koordinator Lapangan (Kor...',
    content: 'Surabaya (pilar.id) - Dalam memperingati Hari Bumi yang jatuh pada 22 April. Yayasan ECOTON bersama beberapa komunitas, mahasiswa dan lainnya turun aksi di depan gedung Grahadi, Surabaya, Jumat (22/4/2022) Pada aksi kali ini, berdasar penjelasan Kholid Basyaiban, selaku Koordinator Lapangan (Kor...',
    coverUrl: 'https://www.pilar.id/wp-content/uploads/2022/04/6FF30E25-402F-477C-8E99-0BC84BC132D0.jpeg',
    author: 'https://www.facebook.com/mediapilarID/',
    likes: 388,
    commentsCount: 21,
    url: 'https://www.pilar.id/peringati-hari-bumi-ecoton-hiasi-manequin-dengan-sachet/'
  },
  {
    id: 'news-3',
    title: 'Pemkot Surabaya Terbitkan Perwali Pengurangan Penggunaan Kantong Plastik - Pemerintah Kota Surabaya',
    category: 'Berita Lokal',
    date: '14 July 2026',
    readTime: '3 menit baca',
    description: 'Pemkot Surabaya Terbitkan Perwali Pengurangan Penggunaan Kantong Plastik',
    content: 'Pemkot Surabaya Terbitkan Perwali Pengurangan Penggunaan Kantong Plastik',
    coverUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    author: 'surabaya.go.id',
    likes: 184,
    commentsCount: 20,
    url: 'https://surabaya.go.id/id/berita/65759/pemkot-surabaya-terbitkan-perwali-pengurangan-penggunaan-kantong-plastik'
  },
  {
    id: 'news-4',
    title: '6 Taman dan Jalur Hijau di Kota Surabaya Rusak Akibat Fenomena Koin Jagat, Pemkot Surabaya Lakukan Tindakan Tegas - Pemerintah Kota Surabaya',
    category: 'Berita Lokal',
    date: '14 July 2026',
    readTime: '6 menit baca',
    description: '6 Taman dan Jalur Hijau di Kota Surabaya Rusak Akibat Fenomena Koin Jagat, Pemkot Surabaya Lakukan Tindakan Tegas',
    content: '6 Taman dan Jalur Hijau di Kota Surabaya Rusak Akibat Fenomena Koin Jagat, Pemkot Surabaya Lakukan Tindakan Tegas',
    coverUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    author: 'surabaya.go.id',
    likes: 277,
    commentsCount: 13,
    url: 'https://www.surabaya.go.id/id/berita/23345/6-taman-dan-jalur-hijau-di-kota-surabaya-rusak-akibat-fenomena-koin-jagat-pemkot-surabaya-lakukan-tindakan-tegas'
  },
  {
    id: 'news-5',
    title: 'Jaga Kebersihan Lingkungan, Ratusan Siswa SD-SMP Rutin Bersih-bersih Pantai Nambangan - Pemerintah Kota Surabaya',
    category: 'Berita Lokal',
    date: '14 July 2026',
    readTime: '6 menit baca',
    description: 'Jaga Kebersihan Lingkungan, Ratusan Siswa SD-SMP Rutin Bersih-bersih Pantai Nambangan',
    content: 'Jaga Kebersihan Lingkungan, Ratusan Siswa SD-SMP Rutin Bersih-bersih Pantai Nambangan',
    coverUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    author: 'surabaya.go.id',
    likes: 295,
    commentsCount: 29,
    url: 'https://surabaya.go.id/id/berita/10882/jaga-kebersihan-lingkungan-ratusan-siswa-sd-smp-rutin-bersih-bersih-pantai-nambangan'
  },
  {
    id: 'news-6',
    title: 'Ratusan Perempuan Surabaya Deklarasikan “She Heroes” di CFD Tunjungan',
    category: 'Berita Lokal',
    date: '14 July 2026',
    readTime: '6 menit baca',
    description: 'Sekitar 500 perempuan memadati kawasan Car Free Day Jalan Tunjungan untuk mengikuti Deklarasi Gerakan “She Heroes”, Minggu (26/4/2026) . Gerakan …',
    content: 'Sekitar 500 perempuan memadati kawasan Car Free Day Jalan Tunjungan untuk mengikuti Deklarasi Gerakan “She Heroes”, Minggu (26/4/2026) . Gerakan …',
    coverUrl: 'https://tunashijau.id/wp-content/uploads/2026/04/she-changes.webp',
    author: 'Tunas Hijau ID',
    likes: 336,
    commentsCount: 10,
    url: 'https://tunashijau.id/ratusan-perempuan-surabaya-deklarasikan-she-heroes-di-cfd-tunjungan/'
  },
  {
    id: 'news-7',
    title: 'Penjualan Mobil Listrik di Surabaya Naik 4 Kali Lipat pada Awal 2026',
    category: 'Berita Lokal',
    date: '14 July 2026',
    readTime: '7 menit baca',
    description: 'Menurutnya, penggunaan kendaraan listrik di Jakarta relatif lebih cepat berkembang karena didukung kebijakan ganjil genap.',
    content: 'Menurutnya, penggunaan kendaraan listrik di Jakarta relatif lebih cepat berkembang karena didukung kebijakan ganjil genap.',
    coverUrl: 'https://img.inews.co.id/media/600/files/networks/2026/05/19/638da_mobil-listrik.jpg',
    author: 'https://surabaya.inews.id/',
    likes: 382,
    commentsCount: 7,
    url: 'https://surabaya.inews.id/read/691788/penjualan-mobil-listrik-di-surabaya-naik-4-kali-lipat-pada-awal-2026'
  },
  {
    id: 'news-8',
    title: 'Resolusi 2026 Namira Eco Print Surabaya: Gaungkan “Back to Nature”, Ajak Anak Muda Lebih Peduli Lingkungan',
    category: 'Berita Lokal',
    date: '14 July 2026',
    readTime: '6 menit baca',
    description: 'Radar Surabaya adalah media digital yang menjadi denyut informasi Surabaya Raya dan Jawa Timur. Menghadirkan berita cepat, tajam dan terpercaya. Mengawal setiap peristiwa, menghubungkan aspirasi masyarakat, serta menjadi referensi utama bagi pembaca yang ingin memahami perkembangan daerah secara ...',
    content: 'Radar Surabaya adalah media digital yang menjadi denyut informasi Surabaya Raya dan Jawa Timur. Menghadirkan berita cepat, tajam dan terpercaya. Mengawal setiap peristiwa, menghubungkan aspirasi masyarakat, serta menjadi referensi utama bagi pembaca yang ingin memahami perkembangan daerah secara ...',
    coverUrl: 'https://cdn-jpr.jawapos.com/images/11/2026/01/23/namira-2590344769.jpg',
    author: 'Dimas Mahendra',
    likes: 283,
    commentsCount: 26,
    url: 'https://radarsurabaya.jawapos.com/surabaya/2601230024/resolusi-2026-namira-eco-print-surabaya-gaungkan-back-to-nature-ajak-anak-muda-lebih-peduli-lingkungan'
  },
  {
    id: 'news-9',
    title: 'Air Hujan Kota Surabaya Terkontaminasi Mikroplastik: Ecoton Himbau Warga Tidak Telan Air Hujan Secara Langsung - ECOTON',
    category: 'Berita Lokal',
    date: '14 July 2026',
    readTime: '4 menit baca',
    description: 'Surabaya, November 2025 — Penelitian terbaru yang dipimpin oleh Lembaga Kajian Ekologi dan Konservasi Lahan Basah (Ecoton) mengungkap bahwa air hujan di Kota Surabaya telah terkontaminasi mikroplastik pada seluruh lokasi […]',
    content: 'Surabaya, November 2025 — Penelitian terbaru yang dipimpin oleh Lembaga Kajian Ekologi dan Konservasi Lahan Basah (Ecoton) mengungkap bahwa air hujan di Kota Surabaya telah terkontaminasi mikroplastik pada seluruh lokasi […]',
    coverUrl: 'https://ecoton.or.id/wp-content/uploads/2025/11/WhatsApp-Image-2025-11-14-at-16.12.54-scaled.jpeg',
    author: 'ECOTON NEWS',
    likes: 432,
    commentsCount: 26,
    url: 'https://ecoton.or.id/air-hujan-kota-surabaya-terkontaminasi-mikroplastik-ecoton-himbau-warga-tidak-telan-air-hujan-secara-langsung/'
  },
  {
    id: 'news-10',
    title: 'Surabaya Panas dengan Suhu Tembus 33 Derajat Celsius',
    category: 'Berita Lokal',
    date: '14 July 2026',
    readTime: '3 menit baca',
    description: 'Cuaca Surabaya 26 Mei 2026, udara kabur, suhu mencapai 33°C, kelembapan 57-97%. Hujan ringan di Bangkalan, Mojokerto cerah berawan. Waspadai perubahan cuaca!',
    content: 'Cuaca Surabaya 26 Mei 2026, udara kabur, suhu mencapai 33°C, kelembapan 57-97%. Hujan ringan di Bangkalan, Mojokerto cerah berawan. Waspadai perubahan cuaca!',
    coverUrl: 'https://akcdn.detik.net.id/api/wm/2026/03/29/ilusrasi-musim-panas-di-kota-surabaya-1774761615523_169.jpeg?wid=60&w=1200&v=1&t=jpeg',
    author: 'https://www.facebook.com/detikcom',
    likes: 450,
    commentsCount: 18,
    url: 'https://www.detik.com/jatim/berita/d-8504622/surabaya-panas-dengan-suhu-tembus-33-derajat-celsius'
  },
  {
    id: 'news-11',
    title: 'DLH Surabaya Temukan Warga Buang Rumen ke Kali, Satu Orang Kena Tipiring',
    category: 'Berita Lokal',
    date: '14 July 2026',
    readTime: '4 menit baca',
    description: 'Patroli yang dilakukan Dinas Lingkungan Hidup (DLH) Kota Surabaya masih menemukan warga yang mencuci dan membuang rumen atau kotoran hewan di Kali Surabaya, tepatnya Taman Asreboyo, Rabu (27/5/2026).',
    content: 'Patroli yang dilakukan Dinas Lingkungan Hidup (DLH) Kota Surabaya masih menemukan warga yang mencuci dan membuang rumen atau kotoran hewan di Kali Surabaya, tepatnya Taman Asreboyo, Rabu (27/5/2026).',
    coverUrl: 'https://www.suarasurabaya.net/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-27-at-12.45.15-PM-e1779861215749.jpeg',
    author: 'suarasurabaya.net',
    likes: 403,
    commentsCount: 27,
    url: 'https://www.suarasurabaya.net/kelanakota/2026/dlh-surabaya-temukan-warga-buang-rumen-ke-kali-satu-orang-kena-tipiring/'
  },
  {
    id: 'news-12',
    title: 'Ascott Waterplace Surabaya Luncurkan \'One Stay One Tree\', Ajak Tamu Ikut Kurangi Emisi Karbon',
    category: 'Berita Lokal',
    date: '14 July 2026',
    readTime: '7 menit baca',
    description: 'Ascott Waterplace Surabaya luncurkan program \'One Stay One Tree\' saat Hari Bumi, ajak tamu kurangi emisi lewat adopsi dan penanaman pohon.',
    content: 'Ascott Waterplace Surabaya luncurkan program \'One Stay One Tree\' saat Hari Bumi, ajak tamu kurangi emisi lewat adopsi dan penanaman pohon.',
    coverUrl: 'https://cms.disway.id/uploads/d0185d8dac98f884a4b14a2cc1152122.jpeg',
    author: 'harian.disway.id',
    likes: 250,
    commentsCount: 26,
    url: 'https://harian.disway.id/read/943491/ascott-waterplace-surabaya-luncurkan-one-stay-one-tree-ajak-tamu-ikut-kurangi-emisi-karbon/15'
  },
  {
    id: 'news-13',
    title: '5 Things to Watch in Climate and Environment in 2026',
    category: 'Berita Global',
    date: '14 July 2026',
    readTime: '7 menit baca',
    description: '2026 is a crucial year for climate action, cooperation, sustainable cities and science. Here is what to look out for this year.',
    content: '2026 is a crucial year for climate action, cooperation, sustainable cities and science. Here is what to look out for this year.',
    coverUrl: 'https://unu.edu/sites/default/files/styles/twtr_image/public/2026-01/Inline%20Media%20%E2%80%93%20Single%20Image%20944x531px%2817%29.png?itok=Erh7xT97',
    author: 'United Nations University',
    likes: 443,
    commentsCount: 16,
    url: 'https://unu.edu/ehs/article/5-things-watch-climate-and-environment-2026'
  },
  {
    id: 'news-14',
    title: 'Berita Lingkungan Global dari jatimnet.com',
    category: 'Berita Global',
    date: '14 July 2026',
    readTime: '5 menit baca',
    description: 'Akses langsung artikel lengkap untuk membaca berita seputar lingkungan hidup.',
    content: 'Akses langsung artikel lengkap untuk membaca berita seputar lingkungan hidup.',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    author: 'jatimnet.com',
    likes: 232,
    commentsCount: 14,
    url: 'https://jatimnet.com/kenapa-generasi-muda-mulai-malu-buang-sampah-sembarangan'
  },
  {
    id: 'news-15',
    title: 'World Environment Day 2026 to activate \'50 Cities at 50°C\' - EnviroNews - latest environment news, climate change, renewable energy',
    category: 'Berita Global',
    date: '14 July 2026',
    readTime: '6 menit baca',
    description: 'Extreme heat is becoming one of the fastest growing risks for cities worldwide. Many urban areas are already approaching, or will soon face,50°C-equivalent conditions that threaten health, infrastructure and daily life. But cities are also leading with solutions. The “50 Cities at 50°C” or ...',
    content: 'Extreme heat is becoming one of the fastest growing risks for cities worldwide. Many urban areas are already approaching, or will soon face,50°C-equivalent conditions that threaten health, infrastructure and daily life. But cities are also leading with solutions. The “50 Cities at 50°C” or ...',
    coverUrl: 'https://www.environewsnigeria.com/wp-content/uploads/2018/11/Accra.jpg',
    author: 'Michael Simire',
    likes: 435,
    commentsCount: 25,
    url: 'https://www.environewsnigeria.com/world-environment-day-2026-to-activate-50-cities-at-50c/'
  },
  {
    id: 'news-16',
    title: 'Perjanjian Laut Lepas PBB Mulai Berlaku, Upaya Besar Lindungi Samudera',
    category: 'Berita Global',
    date: '14 July 2026',
    readTime: '3 menit baca',
    description: 'High Seas Treaty atau BBNJA berlaku mulai Sabtu (17/1/2026). Perjanjian PBB ini jadi tonggak perlindungan laut lepas dan keanekaragaman hayati.',
    content: 'High Seas Treaty atau BBNJA berlaku mulai Sabtu (17/1/2026). Perjanjian PBB ini jadi tonggak perlindungan laut lepas dan keanekaragaman hayati.',
    coverUrl: 'https://asset.kompas.com/crops/S3OuFNeHIZ_3uFlqE40XuwPQ_7U=/0x0:995x663/1200x675/data/photo/2025/09/05/68ba88c0e13ae.png',
    author: 'KOMPAS.com',
    likes: 321,
    commentsCount: 19,
    url: 'https://lestari.kompas.com/read/2026/01/16/191723886/perjanjian-laut-lepas-pbb-mulai-berlaku-upaya-besar-lindungi-samudera?page=all'
  },
  {
    id: 'news-17',
    title: 'Solar and wind power are actually cheaper than the lowest-cost fossil fuels',
    category: 'Berita Global',
    date: '14 July 2026',
    readTime: '6 menit baca',
    description: 'The new data was backed by additional multi-agency reporting from the United Nations.',
    content: 'The new data was backed by additional multi-agency reporting from the United Nations.',
    coverUrl: 'https://cdn.prod.website-files.com/5f6cc9cd16d59d990c8fca33/6a0490bde700eba221af3f3e_solar-power-wind-energy-more-affordable.jpg',
    author: 'goodgoodgood.co',
    likes: 209,
    commentsCount: 5,
    url: 'https://www.goodgoodgood.co/articles/solar-power-wind-energy-cheaper'
  },
  {
    id: 'news-18',
    title: 'Ketika Perang Membuat Bumi Makin Panas',
    category: 'Berita Global',
    date: '14 July 2026',
    readTime: '5 menit baca',
    description: 'Selama kebijakan luar negeri masih didikte oleh kepentingan bahan bakar fosil, selama itu pula perang dan krisis iklim akan terus saling memakan.',
    content: 'Selama kebijakan luar negeri masih didikte oleh kepentingan bahan bakar fosil, selama itu pula perang dan krisis iklim akan terus saling memakan.',
    coverUrl: 'https://assetd.kompas.id/eCTXcDPbyqhA1hOEtDF53nfbCeU=/1024x576/smart/filters:format(webp):quality(80)/https://cdn-dam.kompas.id/images/2026/03/27/9115cdbf7dd837217c7fbe3e1f8ec459-20260327_Opini_Digital_1.jpg',
    author: 'Kompas.id',
    likes: 232,
    commentsCount: 11,
    url: 'https://www.kompas.id/artikel/ketika-perang-semakin-membakar-bumi'
  },
  {
    id: 'news-19',
    title: 'Dampak Konflik AS-Iran Jadi Ancaman \'Kiamat\' Bagi Ekosistem Laut Ini',
    category: 'Berita Global',
    date: '14 July 2026',
    readTime: '7 menit baca',
    description: 'Seiring berlanjutnya konflik, para ilmuwan semakin khawatir tentang dampak tumpahan minyak terhadap hewan di wilayah tersebut.',
    content: 'Seiring berlanjutnya konflik, para ilmuwan semakin khawatir tentang dampak tumpahan minyak terhadap hewan di wilayah tersebut.',
    coverUrl: 'https://akcdn.detik.net.id/visual/2015/09/01/1b274397-e1dc-412f-80f5-527cb561290d_169.jpg?w=1200',
    author: 'internasional',
    likes: 187,
    commentsCount: 30,
    url: 'https://www.cnnindonesia.com/internasional/20260419161656-120-1349701/dampak-konflik-as-iran-jadi-ancaman-kiamat-bagi-ekosistem-laut-ini'
  },
  {
    id: 'news-20',
    title: 'Tren Fast Fashion, Dari Gaya Hidup Jadi Ancaman Bencana Lingkungan Global',
    category: 'Berita Global',
    date: '14 July 2026',
    readTime: '5 menit baca',
    description: 'Radar Surabaya adalah media digital yang menjadi denyut informasi Surabaya Raya dan Jawa Timur. Menghadirkan berita cepat, tajam dan terpercaya. Mengawal setiap peristiwa, menghubungkan aspirasi masyarakat, serta menjadi referensi utama bagi pembaca yang ingin memahami perkembangan daerah secara ...',
    content: 'Radar Surabaya adalah media digital yang menjadi denyut informasi Surabaya Raya dan Jawa Timur. Menghadirkan berita cepat, tajam dan terpercaya. Mengawal setiap peristiwa, menghubungkan aspirasi masyarakat, serta menjadi referensi utama bagi pembaca yang ingin memahami perkembangan daerah secara ...',
    coverUrl: 'https://cdn-jpr.jawapos.com/images/11/2025/10/20/WhatsApp-Image-2025-10-20-at-045911_eb44420e-3595611048.jpg',
    author: 'Muhammad Firman Syah',
    likes: 222,
    commentsCount: 29,
    url: 'https://radarsurabaya.jawapos.com/hobi-lifestyle/2510200023/tren-fast-fashion-dari-gaya-hidup-jadi-ancaman-bencana-lingkungan-global'
  },
  {
    id: 'news-21',
    title: 'Pajak Karbon Uni Eropa Resmi Berlaku, Apa Dampaknya?',
    category: 'Berita Global',
    date: '14 July 2026',
    readTime: '3 menit baca',
    description: 'Uni Eropa mulai menerapkan pajak karbon atau CBAM pada 2026. Ekspor baja, semen, dan aluminium ke Eropa dikenakan biaya emisi karbon dioksida.',
    content: 'Uni Eropa mulai menerapkan pajak karbon atau CBAM pada 2026. Ekspor baja, semen, dan aluminium ke Eropa dikenakan biaya emisi karbon dioksida.',
    coverUrl: 'https://asset.kompas.com/crops/wwPaY8-F5aCWruqrynTKBn__t34=/0x1:1920x1281/1200x675/data/photo/2025/04/19/680356a50606b.jpg',
    author: 'KOMPAS.com',
    likes: 436,
    commentsCount: 22,
    url: 'https://lestari.kompas.com/read/2026/01/02/165353086/pajak-karbon-uni-eropa-resmi-berlaku-apa-dampaknya?page=all'
  },
  {
    id: 'news-22',
    title: 'Gelombang Panas Ekstrem Landa India dan Pakistan pada Mei 2026',
    category: 'Berita Global',
    date: '14 July 2026',
    readTime: '4 menit baca',
    description: 'Suhu udara di India dan Pakistan mencapai 50 derajat Celsius akibat gelombang panas dini yang dipicu fenomena El Nino kuat sejak awal April 2026.',
    content: 'Suhu udara di India dan Pakistan mencapai 50 derajat Celsius akibat gelombang panas dini yang dipicu fenomena El Nino kuat sejak awal April 2026.',
    coverUrl: 'https://cdn.babelinsight.id/media/images/2026/05/zJmqrmFIfE.jpeg?location=1&width=&height=&quality=&fit=1',
    author: 'Babel Insight',
    likes: 417,
    commentsCount: 8,
    url: 'https://www.babelinsight.id/gelombang-panas-ekstrem-india-pakistan'
  },
  {
    id: 'news-23',
    title: 'Alih Fungsi Lahan di Asia Tenggara Picu Krisis Polusi Udara, RI Paling Dirugikan',
    category: 'Berita Global',
    date: '14 July 2026',
    readTime: '4 menit baca',
    description: 'Alih fungsi lahan di Asia Tenggara erat kaitannya dengan sekitar 13.000 kematian tambahan pada tahun 2018 saja.',
    content: 'Alih fungsi lahan di Asia Tenggara erat kaitannya dengan sekitar 13.000 kematian tambahan pada tahun 2018 saja.',
    coverUrl: 'https://asset.kompas.com/crops/ActWJG0nysFJoS4kQ6PpUAGPraw=/0x0:999x666/1200x675/data/photo/2025/10/14/68ee2666746a1.jpg',
    author: 'KOMPAS.com',
    likes: 396,
    commentsCount: 16,
    url: 'https://lestari.kompas.com/read/2026/05/26/172436186/alih-fungsi-lahan-di-asia-tenggara-picu-krisis-polusi-udara-ri-paling'
  },
  {
    id: 'news-24',
    title: 'Asia-Pasifik Terancam Gagal Capai Target SDG PBB',
    category: 'Berita Global',
    date: '14 July 2026',
    readTime: '7 menit baca',
    description: 'Wilayah Asia-Pasifik diperkirakan akan gagal mencapai 103 dari 117 target pembangunan berkelanjutan (SDG) tahun 2030.',
    content: 'Wilayah Asia-Pasifik diperkirakan akan gagal mencapai 103 dari 117 target pembangunan berkelanjutan (SDG) tahun 2030.',
    coverUrl: 'https://asset.kompas.com/crops/TkoIroG0Ajy9IDvGtGglMd-vpug=/0x0:6000x4000/1200x675/data/photo/2025/12/09/69381a430ffc7.jpg',
    author: 'KOMPAS.com',
    likes: 324,
    commentsCount: 30,
    url: 'https://lestari.kompas.com/read/2026/02/20/151900686/asia-pasifik-terancam-gagal-capai-target-sdg-pbb?page=all'
  },
];

export const initialCreations: VideoCreation[] = [
  {
    id: 'c-1',
    title: 'Inisiatif Kebun Vertikal: Pertanian Perkotaan 2.0',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB37JSCtSxo6Qp7805Fr6hRR_s7fA-web1zawMWurvOTaNOlhQhlt3061OhtqpKTZf4QQ-8p-eTgdPeMMaxZir5SNTnQxIj7Qrup0MhRQuiKivjrw9jrLJ9HNdowF4W-3hFeNUZZaf6JRDq-fZoFDugH5OJbt3w5Y66kL0PA_W-EOvlc2yzaY7FRZJgFbTKGuKH7iho1tjvdSHAzhtK0t_wfo4oV28GnYJK5SLmKO8KMJ-WNtDvFWAk_D4E6E10UEC0dUcZf9JTDzZr',
    author: 'Sarah Jenkins',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtRaF3N8yCBiYfLhuRpzfcdjfE7CHzcuQRfQpBFIbGIHz4ol-yq5s2ontlbkkO1PE3vyXwPXFrdVH0LVL-2_34uafPrXxR9ppQAK9-V23jX8lDmtIxfdoK5pddLNa9k2a-ZlqjSYnO2UNMgSEyWmQG9lBIAmF4N1drnsAinDqbVhmouTuNl6WVftABSp0KZuFPKDcGwbIKY7d5qgYMCw3hcqJfZNsRK1tBuzVr5wBlzQxv86YHEWrcGZ92Ne3vtu-PqL23edAmHUkR',
    likes: 4200,
    views: '4.2rb',
    timeAgo: '2 hari yang lalu',
    duration: '12:15',
    category: 'Proyek Unggulan',
    comments: [
      {
        id: 'comm-1',
        author: 'Liam Chen',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6cEaKx1C0sIh61AsblPJHH0IDPu64ffVtheWyHZUBaZBOX5m9Ivef4rq2JoI1L_LjihBIvEcjsdeYF2At6bt91s-yUJZCE0hjpV2CuLqN3wRazrewAb89Wz9BS3rzhedQ5Yr18eQSLUD5wEIH6-BIM0S43waHcCpD-X_rrVb6UqpCWRK55Ht8wS68VvkG0P9nDIHScaCzomkLIJ65YUQk0amWzEuBRk7C1M5J-GytpPWUaLjuvu8HM420GEcKcmdDHKSjzylBwbFN',
        content: 'Ini sangat inspiratif! Bagaimana Anda menangani irigasi untuk tingkat yang lebih tinggi? Saya kesulitan dengan tekanan air pada prototipe skala kecil saya.',
        timeAgo: '5 jam yang lalu',
        likes: 12
      },
      {
        id: 'comm-2',
        author: 'Maya Rodriguez',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpC7Pdgs_peq6ZXc9-NpeoTD_u3X44e1-LFitnzUnA9fU8ekOyoBtrET3_k5k5W3Ncu1BtNnapSBDhjVHNy_OhwJJ42aHrQ1dhFUWh8Ubu0k7e9ouxiUZ4GkQjzZaHaRXzZpPPN3VC05LZyDIViItvemIPYiHzq4Hk0rEouIeT862bwb2OEpfnJd7Kbh6Yn78vAQ4I9qrJjBlPP4gpNtN0J98yz00bpEBMz8oHSO6HBVMm3R0uCOE2iyvrDcxt-X-Kxzb6juScUbg3',
        content: 'Bagian tentang integrasi energi terbarukan sungguh mengubah perspektif. Menantikan lebih banyak EcoCreations seperti ini!',
        timeAgo: '12 jam yang lalu',
        likes: 8
      }
    ]
  },
  {
    id: 'c-2',
    title: 'Ekosistem Terrarium Mandiri',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp7dUy2883-xPYLFLBJPkwWuv5Gfh8PLLc9ixBxBmiQ0bzvHTGXhP27eW_96NxrpCtgRN7AV0zDjYSq9gh5xPazVJqgFIcQ1_Y3QoC8lg9rPQCVsFdW1nqIdGxJviF7_qMJLV8OPO9kzwRIShzYFSQV_hRro3z4GbS5t5rgBB8ALhHW_lj0UTEdo2MbH9XliTO7lh0cbytL2zTA3qY0z9ts8AjuqG51l2ikCSMnzshsooS2mz72lBP8BFrySz7sVub9u9uxiLqMBcV',
    author: 'Chloe Wu',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADaD1IMsiirL-_2mKV3evTSLkoNl0cbYQk7N1pfkO8lp_P08WuO9QyUUsVFo5VwwkFCLoSMtdLGj6BghJ6LenbzTRJUM2qVWWhNT-MvhbbspXBUd4aUVtob5e1YLMtr066ADgjLSgAEqNmKes-sFCeWs--2maE0ae7oUb_7PRddYgvZ7U_sYSIhX6GRp6BqOTOrGWTqyryuciM7SSg_ktyODZn0w_Lq2uHjxp7X0YQd3o3UcmJG-bBZTqzFdC3TVLEcFePobC_VFhI',
    likes: 124,
    views: '1.2rb',
    timeAgo: '5 hari yang lalu',
    duration: '5:30',
    category: 'Sains Rumah',
    comments: []
  },
  {
    id: 'c-3',
    title: 'Masa Depan Surya: Panel Transparan',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCapnXYibO_avC8empkrCWlO6Bbiqe-sjXsnWeYcJ_w1NVVqAamOti069NE7X7_0bBM1r6_Ke6f1ctk4Me_q8_jsTwuSBpWpQW7PW8gWZJO6-m6EoTkVHKlp9ZbsqTSGYeZGEnqBWT-Kip9aOfrht66NhH_4dthFep_hckJNhmjFGBiRZIZ9U2ELvY3zMCxKlxKYv-ON2F98-rbP9OKhQVvGiJ6mJA8AYSZPn52QSzlT6q22JmJt17tYwx9SqDo3Dp22sz5W6Ln16n',
    author: 'Mark Davis',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKRV3VflcrKMSzlpL1T067ovnRgGimrdMoICEAPNSwLiy-NLvXpmt-mpqB9MdD21upshiXaTyuCnYCLAcVhd8dQjbR8nMdvjAWkbihwWOfOFhRU4mURPRn76l2ISs0vTK_4D65jrXBx1M4Zl-YXOk_ERjk6gVwqmyBaq77LP9M852BaMnKNwIYYpIGHWgd-g9sZAH8yxR3TvJBzBHUEs7iuFoBsmRn12a7xd5u9n2WyhRyR-82YD9vsmqtBzOV4yw2OCxwVXQLFj4h',
    likes: 543,
    views: '3.1rb',
    timeAgo: '1 minggu yang lalu',
    duration: '10:15',
    category: 'Teknologi',
    comments: []
  },
  {
    id: 'c-4',
    title: 'Pembersihan Laut: Prototipe Robotik',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyQaMqq1MqJsveNizUi4-IRU2HKinOivkr6EOsn_J_S31LPy_GC9HNqe8ViQ_rQEYZuK6M1q1agFCM8148bDTdqNOjw3sGle7Inhb3p1Gey6FNchGXv1EY5ix-2-m0hZpU-Vm_G_R-wlbOhSYhoOKTRpf8f-xJsNJgB_ZbqLg9uUz5Ue97FRSNNftzMVGN1IVPh7vAd8oFTdIMHt6WW5gLNim4rMsKVx9EMuURfLbdlUtQSlMbJVP-RE_iRy17d9w2f05kKyHI-9tZ',
    author: 'Alex Rivera',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCI0uE7gI7HwKSqy7-CvMR03tEuSbVfRcDsKGmM20mQsZ96XT1MGkdMZ_ZFeApgFQLEezCLXhxaxy8d0PO9oyD9TpphPiWxIp4NNIjXw6UP3yHbvgaFelcnFFZB-jTN_sd8zaPTjFNcMdilj0sBw5ZUF_FwKQEJGeM8yucHvJOEAgT1FXCYyJgaV3JxloL25n9zkeYADvDHfzYOz8AtB_09zU9sjDFbVwFhj7pFeisZzzErUdaLs_rJQhcaZe3lZFbtLFX1wNkpSTtW',
    likes: 981,
    views: '8.4rb',
    timeAgo: '3 minggu yang lalu',
    duration: '3:45',
    category: 'Robotik',
    comments: []
  },
  {
    id: 'c-5',
    title: 'Kompos Komunitas 101',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPZ87LLjSOHVSiC51wNHozGFwKqZZwESly6y5rTRSv6HKWgXH_M--SXvVO3_MNfKj2YS94oIKl8gAeT9UveWemIT_oobKl3Ej_mM60tMaVEFA1FMPo60GcEV3MhY4B4GuEs_EAmPG_z8R4Mf76Ky4X1DexVy37P7EWpV4ODilWNweaF2qlFcgoh90ihDzNtvTSJ2KfYIB-PQkXfSDhJ3qnj_xaL_2sCyi6vp28a0xPJaUakx4Wixo8A0Sve4D6D37Wv50TaeEcuxsC',
    author: 'Sophie Lane',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJS_T6kt8uYCB8eJTeZSBTDq3-obBciI2VZ00wDXxCcXuYQT3mzFLVI0yO2jkqndm4zCaOFmjKP9df4gsCu9X0EgcxAFJU92xCAQGmLmJxK1SdH8zh5cgr9XWQOcHEDyVcxgSh51_sCmfMrmZi_yi9eDaZjgVp10zsOJVttEp3QYI3JU1KtQr92pea73WGdaaWbmsJNuOdMFyuNkKD3SlK03kcVHaiH4rAr-hQwtTSH-hssdLwSrZfqVvaTKeCO5d7PkNM5lsvtQkM',
    likes: 312,
    views: '2.5rb',
    timeAgo: '1 bulan yang lalu',
    duration: '7:20',
    category: 'Komunias',
    comments: []
  }
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'Prinsip utama dalam Kimia Hijau (Green Chemistry) adalah...',
    options: [
      'Membuang limbah sejauh mungkin dari perkotaan ke perairan bebas',
      'Mendesain proses kimia tanpa menghasilkan zat limbah berbahaya',
      'Meningkatkan pembakaran batubara berteknologi tinggi secara maksimal',
      'Membatasi ekspor produk sirkuler agar tidak bersaing di pasar luar'
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    question: 'Apa bahan baku organik utama yang difermentasi melingkar untuk menghasilkan ekoenzim?',
    options: [
      'Sampah botol plastik, kertas koran bekas, pecahan kaca, dan logam karat',
      'Sisa kulit buah segar/sayur, gula (merah tebu/molase), dan air bersih',
      'Limbah detergen mandi cair, minyak goreng jelantah bekas, dan tepung kanji',
      'Kotoran padat hewan ternak, ampas kelapa kering diperas, dan ragi roti aktif'
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: 'Berapa rasio standar yang direkomendasikan untuk wadah fermentasi ekoenzim (Gula : Limbah Buah : Air)?',
    options: [
      '1 bagian Gula : 3 bagian Limbah Buah : 10 bagian Air',
      '10 bagian Gula : 3 bagian Limbah Buah : 1 bagian Air',
      '5 bagian Gula : 5 bagian Limbah Buah : 5 bagian Air',
      '2 bagian Gula : 4 bagian Limbah Buah : 8 bagian Air'
    ],
    correctAnswer: 0
  },
  {
    id: 4,
    question: 'Energi terbarukan manakah yang memanfaatkan panel fotovoltaik berefisiensi tinggi dari penemuan Graphene di EcoLab?',
    options: [
      'Turbin Angin Lepas Pantai Laut Utara',
      'Pembangkit Listrik Biomassa Limbah Padat',
      'Sel Surya Graphene Terobosan Efisiensi 40%',
      'Pembangkit Arus Pasang Surut Air Samudra'
    ],
    correctAnswer: 2
  },
  {
    id: 5,
    question: 'Rewilding kota (Urban Rewilding) bertujuan utama untuk...',
    options: [
      'Membangun pusat pembelanjaan modern megah berbasis fasad kaca',
      'Menanam rumput sintetis karpet di sepanjang trotoar jalan tol',
      'Mengembalikan vegetasi liar lokal demi meningkatkan keanekaragaman hayati dan menurunkan urban heat island',
      'Menghilangkan habitat serangga penyerbuk dan mengusir burung migran'
    ],
    correctAnswer: 2
  }
];

export const localNewsList = [
  {
    id: 'l-1',
    title: 'Dewan Kota setujui proyek hutan kota seluas 2.000 hektar',
    timeAgo: '2 jam yang lalu',
    alt: 'Dewan Kota setujui proyek hutan kota',
    imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrA0nISsb_dgYtCwMt1pdjap_qc0L4chCsAUbgQIaowzFi-n9G_oMZrHo2XGJxZFY-BzUul2OiaweVwchACSJ2KQqL4ZWnYRyJeQ3cGkXH_lFt36mgrYlFI7FW5e94qte75wsmCLXZZZpNXVEHDT5BRfzpAwAXJZQtf4XhpS_av16iv_0v_-WT1PtRkievwPYWle7kpJ289Bcf3AHO7h7yRSWHR3zrI6P3oo7Mr80muoba44bKRUZ6HT60V7mRtMgOQFp6BTI61ceW'
  },
  {
    id: 'l-2',
    title: 'Pabrik manufaktur lokal beralih 100% ke tenaga surya',
    timeAgo: '5 jam yang lalu',
    alt: 'Pabrik manufaktur lokal beralih 100% ke tenaga surya',
    imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVm8JPSme8KNX94UPWAuWKJNaAY_6EsXoBvRfApYF8IkhsrauCaFRq4rEMS--PpiuYih472jBOi82WB5Zo3j_rdzc9C6Z2glB5eHWbuMCeAOixjIlUbrADQADbmu2yOs3eDTDzKaWf-mR2FgUtsTBrJ46eXzjZhv01D4mYSLgx06Mptr-clqXVQH1GOx9c82furDLhykqUohKdMgzlA-9792GVRlm5ABZMo2kmefMFZ7P_nsY6iqM-fpYq-3YP_t_6iSwTEkixw6g3'
  }
];

export const faqsList = [
  {
    question: 'Bagaimana saya bisa memulai proyek keberlanjutan di sekolah saya?',
    answer: "Anda dapat menggunakan toolkit 'EcoCreation' kami untuk menemukan panduan langkah-demi-langkah pengomposan di seluruh kampus, audit energi mandiri, dan inisiatif kantin bebas wadah plastik sekali pakai. Kami juga menyediakan templat proposal presentasi praktis untuk diajukan kepada bapak/ibu kepala sekolah dan komite."
  },
  {
    question: "Bagaimana cara melakukan presensi kehadiran harian?",
    answer: "Anda dapat melakukan presensi kehadiran harian dengan mengklik tombol 'Kirim Presensi Kehadiran' di dasbor Anda sekali setiap hari untuk mencatat partisipasi dan mengklaim bonus harian +20 Eco-Points."
  },
  {
    question: 'Bagaimana cara melacak dampak riil saya di EcoLab?',
    answer: 'Dasbor EcoLab secara otomatis merinci akumulasi poin offset CO2 emisi perjalanan pasca-kendaraan serta volume penghematan air Anda berdasar pada modul sains yang diselesaikan secara nyata di platform ini.'
  }
];
