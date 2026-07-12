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
    title: 'Sidak Adipura, Menteri Hanif Soroti Tumpukan Sampah di Sungai dan TPS Liar Surabaya',
    category: 'Berita Lokal',
    date: '12 July 2026',
    readTime: '4 menit baca',
    description: 'Menteri Lingkungan Hidup melakukan sidak kesiapan Adipura di Surabaya dan menyoroti tumpukan sampah di sungai serta keberadaan Tempat Pembuangan Sampah (TPS) liar.',
    content: 'Dalam kunjungan sidak Adipura di Surabaya, Menteri Lingkungan Hidup menyusuri beberapa aliran sungai dan menemukan tumpukan sampah yang menghambat aliran air, serta mengidentifikasi titik-titik TPS liar yang tidak dikelola dengan baik. Pemkot Surabaya diminta meningkatkan pengawasan dan melakukan tindakan tegas terhadap pembuangan sampah sembarangan untuk mempertahankan piala Adipura.',
    coverUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    author: 'MetroTV News',
    likes: 142,
    commentsCount: 12,
    url: 'https://www.metrotvnews.com/play/b1oCOX23-sidak-adipura-menteri-hanif-soroti-tumpukan-sampah-di-sungai-dan-tps-liar-surabaya'
  },
  {
    id: 'news-2',
    title: 'Peringati Hari Bumi, Ecoton Hiasi Manequin dengan Sachet',
    category: 'Berita Lokal',
    date: '22 April 2026',
    readTime: '5 menit baca',
    description: 'Dalam rangka memperingati Hari Bumi, yayasan Ecoton menggelar kampanye unik dengan menghias maneken menggunakan sampah kemasan sachet sekali pakai untuk mengkritik produsen kemasan non-ramah lingkungan.',
    content: 'Yayasan Ecoton memperingati Hari Bumi dengan memamerkan maneken berlapis ribuan kemasan sachet plastik di depan publik. Kampanye kreatif ini bertujuan menyadarkan masyarakat akan bahaya mikroplastik hasil degradasi kemasan sachet sekali pakai yang banyak mencemari perairan Jawa Timur, sekaligus menuntut pertanggungjawaban Extended Producer Responsibility (EPR) dari perusahaan manufaktur besar.',
    coverUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    author: 'Pilar ID',
    likes: 98,
    commentsCount: 8,
    url: 'https://www.pilar.id/peringati-hari-bumi-ecoton-hiasi-manequin-dengan-sachet/'
  },
  {
    id: 'news-3',
    title: 'Pemkot Surabaya Terbitkan Perwali Pengurangan Penggunaan Kantong Plastik',
    category: 'Berita Lokal',
    date: '15 March 2026',
    readTime: '5 menit baca',
    description: 'Pemerintah Kota Surabaya secara resmi menerbitkan Peraturan Wali Kota (Perwali) baru untuk membatasi dan mengurangi penggunaan kantong plastik sekali pakai di pusat perbelanjaan, pasar modern, dan pasar tradisional.',
    content: 'Pemerintah Kota Surabaya memperketat kebijakan pelestarian lingkungan dengan meluncurkan Peraturan Wali Kota mengenai larangan penyediaan kantong plastik sekali pakai oleh pelaku usaha retail. Kebijakan ini mewajibkan konsumen membawa kantong belanja ramah lingkungan sendiri. Pengawasan intensif akan dilakukan di pasar modern maupun pasar tradisional dengan sanksi administratif berkala bagi pelanggar.',
    coverUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80',
    author: 'Humas Pemkot Surabaya',
    likes: 210,
    commentsCount: 15,
    url: 'https://surabaya.go.id/id/berita/65759/pemkot-surabaya-terbitkan-perwali-pengurangan-penggunaan-kantong-plastik'
  },
  {
    id: 'news-4',
    title: '6 Taman dan Jalur Hijau di Kota Surabaya Rusak Akibat Fenomena Koin Jagat, Pemkot Surabaya Lakukan Tindakan Tegas',
    category: 'Berita Lokal',
    date: '18 May 2026',
    readTime: '4 menit baca',
    description: 'Fenomena viral koin jagat menyebabkan kerusakan pada vegetasi di enam taman kota dan jalur hijau Surabaya karena diinjak-injak massa. Pemkot mengambil langkah hukum dan perbaikan taktis.',
    content: 'Fenomena pengumpulan koin jagat secara massal di ruang terbuka publik berakibat fatal pada keindahan tata kota. Enam taman kota dan area jalur hijau mengalami kerusakan parah karena rumput dan tanaman hias terinjak-injak oleh warga yang berkerumun. Dinas Lingkungan Hidup Surabaya segera menutup area terdampak, melakukan penanaman ulang secara masif, dan mengerahkan Satpol PP untuk menertibkan kegiatan yang merusak fasilitas umum.',
    coverUrl: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=800&q=80',
    author: 'Humas Pemkot Surabaya',
    likes: 176,
    commentsCount: 24,
    url: 'https://www.surabaya.go.id/id/berita/23345/6-taman-dan-jalur-hijau-di-kota-surabaya-rusak-akibat-fenomena-koin-jagat-pemkot-surabaya-lakukan-tindakan-tegas'
  },
  {
    id: 'news-5',
    title: 'Jaga Kebersihan Lingkungan, Ratusan Siswa SD-SMP Rutin Bersih-bersih Pantai Nambangan',
    category: 'Berita Lokal',
    date: '10 February 2026',
    readTime: '4 menit baca',
    description: 'Upaya menumbuhkan kepedulian lingkungan sejak dini dilakukan melalui aksi bersih-bersih rutin Pantai Nambangan oleh ratusan pelajar SD dan SMP di Surabaya.',
    content: 'Ratusan siswa Sekolah Dasar dan Sekolah Menengah Pertama di kawasan pesisir Surabaya menggelar aksi gotong royong membersihkan sampah plastik di Pantai Nambangan. Kegiatan rutin mingguan yang diinisiasi oleh Dinas Pendidikan dan Dinas Lingkungan Hidup ini bertujuan menanamkan kesadaran ekologis sejak dini kepada generasi muda agar menjaga ekosistem laut dari limbah rumah tangga.',
    coverUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80',
    author: 'Humas Pemkot Surabaya',
    likes: 312,
    commentsCount: 19,
    url: 'https://surabaya.go.id/id/berita/10882/jaga-kebersihan-lingkungan-ratusan-siswa-sd-smp-rutin-bersih-bersih-pantai-nambangan'
  },
  {
    id: 'news-6',
    title: 'Ratusan Perempuan Surabaya Deklarasikan “She Heroes” di CFD Tunjungan',
    category: 'Berita Lokal',
    date: '26 April 2026',
    readTime: '5 menit baca',
    description: 'Sekitar 500 perempuan memadati kawasan Car Free Day Jalan Tunjungan untuk mengikuti Deklarasi Gerakan “She Heroes” sebagai upaya menekan timbulan sampah plastik sekali pakai.',
    content: 'Sekitar 500 perempuan memadati kawasan Car Free Day Jalan Tunjungan untuk mengikuti Deklarasi Gerakan “She Heroes”. Gerakan ini mengajak perempuan mulai beralih dari pembalut sekali pakai menuju produk ramah lingkungan sebagai upaya menekan timbulan sampah plastik yang sulit terurai. Asisten Pemerintahan dan Kesejahteraan Rakyat Kota Surabaya, M. Fikser, menegaskan bahwa sampah pembalut sekali pakai menjadi ancaman nyata bagi sungai dan lingkungan karena butuh waktu hingga 500 tahun untuk terurai. Bumbi bersama Tunas Hijau menghadirkan alternatif ramah lingkungan sebagai solusi nyata bagi satu juta perempuan usia produktif di Surabaya demi masa depan ekologis kota yang berkelanjutan.',
    coverUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80',
    author: 'Tunas Hijau ID',
    likes: 412,
    commentsCount: 18,
    url: 'https://tunashijau.id/ratusan-perempuan-surabaya-deklarasikan-she-heroes-di-cfd-tunjungan/'
  },
  {
    id: 'news-7',
    title: 'Penjualan Mobil Listrik di Surabaya Naik 4 Kali Lipat pada Awal 2026',
    category: 'Berita Lokal',
    date: '19 May 2026',
    readTime: '4 menit baca',
    description: 'Penjualan kendaraan listrik (EV) di Kota Surabaya mengalami kenaikan drastis hingga lebih dari empat kali lipat pada kuartal pertama 2026 berkat efisiensi biaya dan kemudahan perawatan.',
    content: 'Indomobil Dealers Group terus mendorong percepatan adopsi kendaraan listrik (EV) di Indonesia melalui gelaran pameran otomotif. CEO Indomobil Dealers Group, Santiko Wardoyo, menyatakan bahwa kendaraan listrik sangat ekonomis dan efisien dari sisi bahan bakar serta perawatan pasca-penjualan yang jauh lebih murah karena tidak memerlukan oli. Untuk menunjang hal ini, PLN UID Jawa Timur berkomitmen dengan menyediakan sekitar 300 stasiun pengisian daya (SPKLU) yang tersebar luas demi meningkatkan kepercayaan masyarakat menggunakan kendaraan ramah lingkungan.',
    coverUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    author: 'iNews Surabaya',
    likes: 356,
    commentsCount: 22,
    url: 'https://surabaya.inews.id/read/691788/penjualan-mobil-listrik-di-surabaya-naik-4-kali-lipat-pada-awal-2026'
  },
  {
    id: 'news-8',
    title: 'Resolusi 2026 Namira Eco Print Surabaya: Gaungkan “Back to Nature”, Ajak Anak Muda Lebih Peduli Lingkungan',
    category: 'Berita Lokal',
    date: '23 January 2026',
    readTime: '5 menit baca',
    description: 'Menyambut tahun 2026, Namira Eco Print Surabaya mengusung tema "Back to Nature" dengan meluncurkan koleksi warna-warna alami dan mengajak generasi muda lebih peduli terhadap kelestarian alam.',
    content: 'Menyambut tahun 2026, Namira Eco Print menegaskan komitmennya untuk terus bergerak bersama alam melalui koleksi bernuansa "Back to Nature". Owner Namira Eco Print, Yayuk Eko Agustin, menyampaikan bahwa konsep ini diwujudkan dengan eksplorasi tanaman mangrove dan pewarna alami seperti rebusan bubuk kayu lockwood yang memunculkan warna biru lembut. Namira memegang komitmen teguh: siapa yang memetik daun wajib menanam kembali. Diharapkan produk fesyen ini dapat menjadi sarana edukasi bagi Gen Z dan Gen Alpha untuk mulai menghargai alam di sekitar mereka.',
    coverUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    author: 'Radar Surabaya',
    likes: 289,
    commentsCount: 14,
    url: 'https://radarsurabaya.jawapos.com/surabaya/2601230024/resolusi-2026-namira-eco-print-surabaya-gaungkan-back-to-nature-ajak-anak-muda-lebih-peduli-lingkungan'
  },
  {
    id: 'news-9',
    title: 'Air Hujan Kota Surabaya Terkontaminasi Mikroplastik: Ecoton Himbau Warga Tidak Telan Air Hujan Secara Langsung',
    category: 'Berita Lokal',
    date: '23 November 2025',
    readTime: '5 menit baca',
    description: 'Penelitian terbaru dari Ecoton bersama jejaring GrowGreen, Jejak, dan River Warrior mengungkap air hujan di Surabaya terkontaminasi mikroplastik, dengan konsentrasi tertinggi di daerah Pakis Gelora dan Tanjung Perak.',
    content: 'Penelitian terbaru dari Lembaga Kajian Ekologi dan Konservasi Lahan Basah (Ecoton) bersama komunitas GrowGreen dan Jejak menunjukkan bahwa seluruh sampel air hujan di Kota Surabaya telah terkontaminasi oleh mikroplastik jenis fiber. Konsentrasi tertinggi ditemukan di Pakis Gelora dengan 356 partikel per liter and Tanjung Perak dengan 309 partikel per liter. Kontaminasi ini dipicu oleh pembakaran sampah terbuka, gesekan ban kendaraan dengan aspal, serta evaporasi uap air laut yang tercemar plastik. Ecoton mengimbau masyarakat tidak menelan air hujan secara langsung demi kesehatan.',
    coverUrl: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=800&q=80',
    author: 'Ecoton OR ID',
    likes: 512,
    commentsCount: 37,
    url: 'https://ecoton.or.id/air-hujan-kota-surabaya-terkontaminasi-mikroplastik-ecoton-himbau-warga-tidak-telan-air-hujan-secara-langsung/'
  },
  {
    id: 'news-10',
    title: 'Surabaya Panas dengan Suhu Tembus 33 Derajat Celsius',
    category: 'Berita Lokal',
    date: '10 June 2026',
    readTime: '3 menit baca',
    description: 'Suhu udara di Kota Surabaya dilaporkan sangat panas dan gerah mencapai 33 derajat Celsius, dipicu fenomena pemanasan lokal dan minimnya tutupan awan di musim kemarau.',
    content: 'BMKG Kelas I Juanda melaporkan peningkatan suhu ekstrem di wilayah Surabaya dan sekitarnya yang mencapai 33 derajat Celsius pada siang hari. Suhu menyengat ini disertai tingkat kelembaban udara yang rendah, sehingga memicu rasa gerah berlebih di kalangan warga. Masyarakat diimbau untuk mengurangi aktivitas di luar ruangan, memperbanyak konsumsi air putih untuk menghindari dehidrasi, serta menjaga area pemukiman tetap rindang.',
    coverUrl: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&w=800&q=80',
    author: 'Detik Jatim',
    likes: 189,
    commentsCount: 11,
    url: 'https://www.detik.com/jatim/berita/d-8504622/surabaya-panas-dengan-suhu-tembus-33-derajat-celsius'
  },
  {
    id: 'news-11',
    title: 'DLH Surabaya Temukan Warga Buang Rumen ke Kali, Satu Orang Kena Tipiring',
    category: 'Berita Lokal',
    date: '19 June 2026',
    readTime: '4 menit baca',
    description: 'Dinas Lingkungan Hidup Kota Surabaya melakukan penertiban terhadap warga yang membuang rumen hewan kurban langsung ke aliran sungai, menjatuhkan sanksi tindak pidana ringan (tipiring).',
    content: 'Tim patroli air Dinas Lingkungan Hidup (DLH) Kota Surabaya menangkap basah warga yang membuang limbah rumen (isi lambung hewan kurban) langsung ke aliran Kalimas. Pembuangan limbah biologis secara liar ini melanggar perda kebersihan dan merusak ekosistem sungai. Pelaku langsung dikenai sanksi Tindak Pidana Ringan (tipiring) berupa denda administratif guna memberikan efek jera agar warga menjaga kualitas air sungai kota.',
    coverUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    author: 'Suara Surabaya',
    likes: 203,
    commentsCount: 14,
    url: 'https://www.suarasurabaya.net/kelanakota/2026/dlh-surabaya-temukan-warga-buang-rumen-ke-kali-satu-orang-kena-tipiring/'
  },
  {
    id: 'news-12',
    title: 'Ascott Waterplace Surabaya Luncurkan One Stay One Tree, Ajak Tamu Ikut Kurangi Emisi Carbon',
    category: 'Berita Lokal',
    date: '12 April 2026',
    readTime: '4 menit baca',
    description: 'Program pelestarian alam "One Stay One Tree" diluncurkan oleh Ascott Waterplace Surabaya untuk mengimbangi jejak karbon tamu hotel dengan menanam satu pohon untuk setiap transaksi menginap.',
    content: 'Ascott Waterplace Surabaya menunjukkan komitmen kepedulian iklim melalui kampanye hijau "One Stay One Tree". Melalui program ini, untuk setiap tamu yang menginap, pihak hotel bekerja sama dengan yayasan lingkungan setempat akan menanam satu pohon bakau di pesisir Wonorejo Surabaya. Langkah ramah lingkungan ini ditujukan untuk mereduksi emisi karbon perhotelan sekaligus melestarikan ekosistem pesisir dari ancaman abrasi laut.',
    coverUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    author: 'Harian Disway',
    likes: 115,
    commentsCount: 9,
    url: 'https://harian.disway.id/read/943491/ascott-waterplace-surabaya-luncurkan-one-stay-one-tree-ajak-tamu-ikut-kurangi-emisi-karbon/15'
  },
  {
    id: 'news-13',
    title: '5 Things to Watch in Climate and Environment in 2026',
    category: 'Berita Global',
    date: '21 January 2026',
    readTime: '6 menit baca',
    description: 'Tahun 2026 menjadi momen krusial bagi aksi iklim global, kerja sama internasional, perkotaan berkelanjutan, dan keberpihakan pada sains.',
    content: 'United Nations University merilis lima tren lingkungan global utama yang wajib diperhatikan sepanjang tahun 2026: (1) peningkatan suhu bumi global yang mendekati overshoot 1.5 derajat Celcius, (2) negosiasi COP 31 di Turki mengenai kelanjutan target pendanaan iklim developing nations, (3) upaya penyelarasan tiga konvensi Rio Conventions (Iklim, Biodiversitas, dan Lahan Degradasi), (4) peran strategis kepemimpinan perkotaan dalam transisi berkelanjutan yang adil di World Urban Forum Baku, serta (5) pentingnya mempertahankan komitmen kolaborasi ilmiah internasional berbasis data dan sains terpercaya.',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    author: 'United Nations University',
    likes: 624,
    commentsCount: 45,
    url: 'https://unu.edu/ehs/article/5-things-watch-climate-and-environment-2026'
  },
  {
    id: 'news-14',
    title: 'Kenapa Generasi Muda Mulai Malu Buang Sampah Sembarangan',
    category: 'Berita Global',
    date: '08 May 2026',
    readTime: '4 menit baca',
    description: 'Peningkatan kesadaran ekologis di kalangan generasi muda memicu pergeseran budaya sosial di mana membuang sampah sembarangan kini dianggap sebagai tindakan memalukan.',
    content: 'Studi sosiologi terbaru mengungkapkan tumbuhnya norma sosial baru di kalangan milenial dan gen Z terkait kebersihan lingkungan. Melalui edukasi kampanye digital dan peningkatan fasilitas pengelolaan limbah perkotaan, kebiasaan membuang sampah sembarangan kini dipandang negatif dan memalukan secara sosial. Kebiasaan ini digantikan oleh kebanggaan membawa botol isi ulang dan memilah sampah secara sirkular.',
    coverUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    author: 'Jatimnet',
    likes: 192,
    commentsCount: 16,
    url: 'https://jatimnet.com/kenapa-generasi-muda-mulai-malu-buang-sampah-sembarangan'
  },
  {
    id: 'news-15',
    title: 'World Environment Day 2026 to Activate 50 Cities at 50C',
    category: 'Berita Global',
    date: '05 June 2026',
    readTime: '5 menit baca',
    description: 'Hari Lingkungan Hidup Sedunia 2026 meluncurkan kampanye aktivasi iklim di 50 kota global utama untuk berkolaborasi mengatasi kenaikan suhu panas perkotaan.',
    content: 'Kampanye World Environment Day (WED) 2026 secara resmi mencanangkan inisiatif global bertajuk "50 Cities at 50C" guna menggerakkan aksi adaptasi iklim perkotaan di kota-kota metropolitan dunia. Program ini menitikberatkan pada penanaman hutan kota terpadu, penggunaan atap reflektif panas, penataan sistem tata air resapan, serta penurunan emisi transportasi guna mengantisipasi ancaman gelombang panas ekstrem global.',
    coverUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80',
    author: 'EnviroNews Nigeria',
    likes: 312,
    commentsCount: 28,
    url: 'https://www.environewsnigeria.com/world-environment-day-2026-to-activate-50-cities-at-50c/'
  },
  {
    id: 'news-16',
    title: 'Perjanjian Laut Lepas PBB Mulai Berkaku: Upaya Besar Lindungi Samudera',
    category: 'Berita Global',
    date: '16 January 2026',
    readTime: '5 menit baca',
    description: 'Perjanjian Laut Lepas PBB (High Seas Treaty) secara resmi mulai diberlakukan secara hukum internasional untuk melindungi ekosistem lautan di luar perairan yurisdiksi nasional.',
    content: 'Perserikatan Bangsa-Bangsa (PBB) menyambut sejarah baru dalam konservasi kelautan global setelah High Seas Treaty resmi diratifikasi dan diberlakukan. Perjanjian ini menetapkan wilayah perlindungan laut (Marine Protected Areas) di lautan internasional guna melarang penangkapan ikan berlebih, menertibkan rute pelayaran niaga kasar, serta mengatur aktivitas penambangan dasar laut dalam demi menyelamatkan keanekaragaman hayati oseanografi.',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    author: 'Kompas Lestari',
    likes: 456,
    commentsCount: 31,
    url: 'https://lestari.kompas.com/read/2026/01/16/191723886/perjanjian-laut-lepas-pbb-mulai-berlaku-upaya-besar-lindungi-samudera?page=all'
  },
  {
    id: 'news-17',
    title: 'Solar Power and Wind Energy Are Officially Cheaper Than Ever',
    category: 'Berita Global',
    date: '04 March 2026',
    readTime: '4 menit baca',
    description: 'Analisis pasar energi global menunjukkan biaya produksi listrik dari energi surya dan angin mencapai rekor terendah baru, mengungguli bahan bakar fosil di mayoritas wilayah dunia.',
    content: 'Transisi energi terbarukan global berakselerasi dengan laporan bahwa energi angin dan panel surya menjadi opsi listrik paling murah di dunia saat ini. Berkat kemajuan rantai pasokan manufaktur semikonduktor dan efisiensi teknologi baterai penyimpanan, biaya operasional pembangkit bersih menurun hingga 15% dalam setahun terakhir, membuktikan bahwa energi ramah lingkungan sangat kompetitif secara finansial dibanding batu bara.',
    coverUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    author: 'Good Good Good',
    likes: 389,
    commentsCount: 19,
    url: 'https://www.goodgoodgood.co/articles/solar-power-wind-energy-cheaper'
  },
  {
    id: 'news-18',
    title: 'Ketika Perang Semakin Membakar Bumi',
    category: 'Berita Global',
    date: '15 May 2026',
    readTime: '5 menit baca',
    description: 'Konflik bersenjata global di berbagai belahan dunia berdampak merusak lingkungan secara parah, memicu polusi tanah, emisi militer yang tidak terkendali, dan krisis ekologis yang mendalam.',
    content: 'Laporan ekologi internasional menyoroti dampak perang berkepanjangan terhadap pemanasan global. Selain jatuhnya korban jiwa, emisi karbon dari pembakaran bahan bakar kendaraan tempur, ledakan amunisi, dan kebakaran kilang minyak menyebabkan kerusakan ozon yang parah. Kerusakan lahan subur dan kontaminasi air akibat zat kimia beracun sisa perang membutuhkan waktu pemulihan hingga puluhan tahun.',
    coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    author: 'Harian Kompas',
    likes: 280,
    commentsCount: 25,
    url: 'https://www.kompas.id/artikel/ketika-perang-semakin-membakar-bumi'
  },
  {
    id: 'news-19',
    title: 'Dampak Konflik AS-Iran Jadi Ancaman Kiamat bagi Ekosistem Laut Ini',
    category: 'Berita Global',
    date: '19 April 2026',
    readTime: '4 menit baca',
    description: 'Ketegangan geopolitik di Selat Hormuz dikhawatirkan memicu kebocoran minyak berskala besar yang mengancam kepunahan terumbu karang unik dan keanekaragaman hayati bawah laut Teluk Persia.',
    content: 'Ancaman kerusakan laut parah mengintai wilayah Teluk akibat memanasnya konflik militer AS-Iran di Selat Hormuz. Jalur lalu lintas tanker minyak bumi yang rawan serangan rudal dapat memicu tumpahan minyak mentah masif yang menutupi permukaan perairan. Kebocoran zat kimia berbahaya ini diprediksi akan merusak terumbu karang endemik, mematikan populasi mamalia laut langka, serta melumpuhkan mata pencaharian nelayan tradisional setempat.',
    coverUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    author: 'CNN Indonesia',
    likes: 340,
    commentsCount: 29,
    url: 'https://www.cnnindonesia.com/internasional/20260419161656-120-1349701/dampak-konflik-as-iran-jadi-ancaman-kiamat-bagi-ekosistem-laut-ini'
  },
  {
    id: 'news-20',
    title: 'Tren Fast Fashion: Dari Gaya Hidup Jadi Ancaman Bencana Lingkungan Global',
    category: 'Berita Global',
    date: '25 October 2025',
    readTime: '5 menit baca',
    description: 'Industri mode cepat (fast fashion) yang memproduksi pakaian murah secara masif dituding menjadi penyumbang utama limbah tekstil di negara-negara berkembang dan pencemaran air mikroplastik.',
    content: 'Laju tren fast fashion kini bertransformasi menjadi bencana lingkungan global akibat tingginya konsumsi bahan sintetis poliester sekali pakai. Jutaan ton limbah tekstil dibuang ke tempat pembuangan akhir di berbagai negara dunia ketiga setiap tahunnya. Selain itu, proses pencucian serat pakaian melepaskan miliaran partikel mikroplastik berbahaya yang mengalir ke sungai dan berakhir mengontaminasi rantai makanan laut secara global.',
    coverUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    author: 'Radar Surabaya',
    likes: 220,
    commentsCount: 13,
    url: 'https://radarsurabaya.jawapos.com/hobi-lifestyle/2510200023/tren-fast-fashion-dari-gaya-hidup-jadi-ancaman-bencana-lingkungan-global'
  },
  {
    id: 'news-21',
    title: 'Pajak Karbon Uni Eropa Resmi Berlaku: Apa Dampaknya?',
    category: 'Berita Global',
    date: '02 January 2026',
    readTime: '5 menit baca',
    description: 'Penerapan mekanisme penyesuaian batas karbon Uni Eropa (CBAM) secara resmi diberlakukan untuk menekan emisi produk impor dari luar kawasan Eropa.',
    content: 'Uni Eropa memulai era perdagangan baru dengan memberlakukan Pajak Karbon lintas batas (Carbon Border Adjustment Mechanism - CBAM). Kebijakan ini mewajibkan eksportir luar kawasan, termasuk industri besi, semen, baja, dan pupuk dari negara berkembang, untuk membayar biaya emisi setara produsen Eropa. Aturan ketat ini diharapkan memaksa rantai pasok industri dunia bertransisi ke teknologi yang lebih ramah lingkungan.',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    author: 'Kompas Lestari',
    likes: 310,
    commentsCount: 17,
    url: 'https://lestari.kompas.com/read/2026/01/02/165353086/pajak-karbon-uni-eropa-resmi-berlaku-apa-dampaknya?page=all'
  },
  {
    id: 'news-22',
    title: 'Gelombang Panas Ekstrem India-Pakistan Capai Rekor Baru',
    category: 'Berita Global',
    date: '28 May 2026',
    readTime: '4 menit baca',
    description: 'Wilayah Asia Selatan diterpa gelombang panas ekstrem dengan suhu melampaui 49 derajat Celsius, mengakibatkan krisis air bersih dan kekeringan lahan pertanian yang meluas.',
    content: 'Gelombang panas ekstrem melanda wilayah India bagian utara dan Pakistan, memaksa jutaan warga beraktivitas di bawah ancaman suhu panas menyengat yang mendekati 50 derajat Celsius. Fenomena ini merusak panen gandum nasional, mengeringkan waduk-waduk pasokan air minum perkotaan, serta memicu lonjakan kasus serangan panas (heatstroke). Para pakar iklim mendesak mitigasi darurat berupa penanaman vegetasi pencegah pemanasan lokal.',
    coverUrl: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&w=800&q=80',
    author: 'Babel Insight',
    likes: 450,
    commentsCount: 33,
    url: 'https://www.babelinsight.id/gelombang-panas-ekstrem-india-pakistan'
  },
  {
    id: 'news-23',
    title: 'Alih Fungsi Lahan di Asia Tenggara Picu Krisis Polusi Udara, RI Paling Terdampak',
    category: 'Berita Global',
    date: '26 May 2026',
    readTime: '5 menit baca',
    description: 'Degradasi hutan dan alih fungsi lahan gambut menjadi perkebunan kelapa sawit secara masif memicu krisis polusi udara kabut asap lintas batas di kawasan ASEAN.',
    content: 'Laporan satelit pemantau lingkungan menunjukkan alih fungsi lahan gambut di wilayah Asia Tenggara memicu kebakaran hutan berkala yang menghasilkan asap pekat beracun. Indonesia menjadi daerah yang paling parah terkena dampak polusi partikulat halus PM2.5, yang membahayakan pernapasan jutaan penduduk serta memicu ketegangan diplomasi kabut asap dengan negara tetangga seperti Singapura dan Malaysia.',
    coverUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    author: 'Kompas Lestari',
    likes: 380,
    commentsCount: 22,
    url: 'https://lestari.kompas.com/read/2026/05/26/172436186/alih-fungsi-lahan-di-asia-tenggara-picu-krisis-polusi-udara-ri-paling'
  },
  {
    id: 'news-24',
    title: 'Asia-Pasifik Terancam Gagal Capai Target SDG PBB',
    category: 'Berita Global',
    date: '20 February 2026',
    readTime: '5 menit baca',
    description: 'Laporan komisi PBB untuk kawasan Asia dan Pasifik (ESCAP) menyatakan mayoritas negara di kawasan terancam gagal mewujudkan target pembangunan berkelanjutan iklim dan lingkungan pada tenggat waktu global.',
    content: 'Laporan terbaru ESCAP memperingatkan bahwa kemajuan pencapaian Sustainable Development Goals (SDGs) di wilayah Asia-Pasifik bergerak lambat, khususnya pada poin aksi iklim (SDG 13) dan perlindungan kehidupan laut (SDG 14). Kombinasi ketergantungan pada batu bara, laju deforestasi tinggi, serta pendanaan program hijau yang tidak memadai menjadi hambatan utama yang harus diatasi dengan kolaborasi regional lintas negara.',
    coverUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    author: 'Kompas Lestari',
    likes: 290,
    commentsCount: 19,
    url: 'https://lestari.kompas.com/read/2026/02/20/151900686/asia-pasifik-terancam-gagal-capai-target-sdg-pbb?page=all'
  }
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
