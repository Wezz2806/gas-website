import { Book, Meeting, VideoItem, NewsArticle, VideoCreation, QuizQuestion } from './types';

export const initialBooks: Book[] = [
  {
    id: 'green-chemistry',
    title: 'Kimia Hijau & Keberlanjutan',
    category: 'INTI LANJUTAN',
    tagClass: 'bg-primary-container text-on-primary-fixed',
    icon: 'science',
    description: 'Jelajahi prinsip-prinsip dasar desain molekuler berkelanjutan dan proses kimia tanpa limbah untuk masa depan yang lebih bersih.',
    content: 'Buku ini menyajikan 12 prinsip pokok Kimia Hijau (Green Chemistry) untuk mengurangi atau menonaktifkan penggunaan zat kimia berbahaya. Buku ini mengajarkan bagaimana rancangan molekul organik dapat disintesis menggunakan biokatalis alamiah dengan memaksimalkan atom economy, meminimalkan limbah pencemaran air, dan mengoptimalkan sirkulasi bahan ramah lingkungan untuk masa depan industri global.',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNn4f7ISvnPOHnz8i1tdGLx-82l9Kk2nRYRlmW2pbgTornkVcaYndvt4rkfyZjpjZCbcm_7TbrkghnrDidWUa4NLxlvney1JvHeBGstK3eYIlx6kmI5e-9wicgQOqwC-I3rL-yajILYDfNhMEfCqVNddRMGqwhXks1LDwpKxoOYeCMtxd6GP3_UpB_SajKAKOgheKDw2TkKUStB9wi0Lsvz2aEqXQLg_HXFS5OyT0jxyCYtGtGxa3ppqpJ0XQXvGRh5vIjtuty_dQI',
    pdfUrl: '#'
  },
  {
    id: 'ecoenzyme',
    title: 'Ekoenzim: Limbah Jadi Sumber Daya',
    category: 'PANDUAN PRAKTIS',
    tagClass: 'bg-secondary-container text-on-secondary-container',
    icon: 'compost',
    description: 'Temukan kekuatan transformatif ekoenzim dalam pengelolaan limbah dan aplikasi serbagunanya dalam pertanian berkelanjutan dan kebersihan.',
    content: 'Panduan luar biasa ini menjelaskan langkah demi langkah untuk memfermentasi sisa kulit buah segar dan sayuran bersama gula merah/molase di air bersih dengan rasio emas 1:3:10. Selama 3 bulan berjalan, mikroba pengurai menghasilkan cairan multi-manfaat yang kaya akan asam asetat, amilase, lipase, dan enzim aktif lainnya yang berguna sebagai pembersih alami, disinfektan bebas toksin, serta pupuk organik penyubur tanah.',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUrbRIx28PRmIdiaug7nQlYdkcpkX9ny06WcvHnC0gyA3RlU_E7Hs0cDE5qEks9uWcT6XrQPwtmKzem_jDL3NqvsLXlPyHR-WEhHzfpbG-7Btpji4TdlFjGwj1nZewAb0iaiTz_KQcFPBNNTRa6qg7h5M19_m1ajr57moEMLyYYBYGGKc813S2p8Lq6R4PfFLVKrvPKe2qnyZgQyqDCrQwQD9F_xfzJlZYLqzDRcIjPwXt3vqcWUIfPGCo77Gmv3Nzskg-IJZWNvD',
    pdfUrl: '#'
  }
];

export const initialMeetings: Meeting[] = [
  {
    id: 'm1',
    number: 1,
    title: 'Kickoff & Pengadaan',
    description: 'Menentukan tujuan dan mencari bahan organik mentah untuk fermentasi.',
    icon: 'groups',
    status: 'completed'
  },
  {
    id: 'm2',
    number: 2,
    title: 'Kontrol Proses',
    description: 'Memantau tingkat pH dan menetapkan protokol pengenceran harian.',
    icon: 'science',
    status: 'ongoing'
  },
  {
    id: 'm3',
    number: 3,
    title: 'Persiapan Enzim Aktif',
    description: 'Memanen konsentrat yang telah terfermentasi dan pengenceran untuk pembuatan sabun.',
    icon: 'biotech',
    status: 'scheduled'
  },
  {
    id: 'm4',
    number: 4,
    title: 'Pengemasan Produk',
    description: 'Desain kemasan ramah lingkungan dan pengujian kontrol kualitas akhir.',
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
    title: 'Ratusan Perempuan Surabaya Deklarasikan “She Heroes” di CFD Tunjungan',
    category: 'Kampanye Lingkungan',
    date: '26 April 2026',
    readTime: '5 menit baca',
    description: 'Sekitar 500 perempuan memadati kawasan Car Free Day Jalan Tunjungan untuk mengikuti Deklarasi Gerakan “She Heroes” sebagai upaya menekan timbulan sampah plastik sekali pakai.',
    content: 'Sekitar 500 perempuan memadati kawasan Car Free Day Jalan Tunjungan untuk mengikuti Deklarasi Gerakan “She Heroes”. Gerakan ini mengajak perempuan mulai beralih dari pembalut sekali pakai menuju produk ramah lingkungan sebagai upaya menekan timbulan sampah plastik yang sulit terurai. Asisten Pemerintahan dan Kesejahteraan Rakyat Kota Surabaya, M. Fikser, menegaskan bahwa sampah pembalut sekali pakai menjadi ancaman nyata bagi sungai dan lingkungan karena butuh waktu hingga 500 tahun untuk terurai. Bumbi bersama Tunas Hijau menghadirkan alternatif ramah lingkungan sebagai solusi nyata bagi satu juta perempuan usia produktif di Surabaya demi masa depan ekologis kota yang berkelanjutan.',
    coverUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    author: 'Tunas Hijau ID',
    likes: 412,
    commentsCount: 18,
    url: 'https://tunashijau.id/ratusan-perempuan-surabaya-deklarasikan-she-heroes-di-cfd-tunjungan/'
  },
  {
    id: 'news-2',
    title: 'Penjualan Mobil Listrik di Surabaya Naik 4 Kali Lipat pada Awal 2026',
    category: 'Transportasi Hijau',
    date: '19 Mei 2026',
    readTime: '4 menit baca',
    description: 'Penjualan kendaraan listrik (EV) di Kota Surabaya mengalami kenaikan drastis hingga lebih dari empat kali lipat pada kuartal pertama 2026 berkat efisiensi biaya dan kemudahan perawatan.',
    content: 'Indomobil Dealers Group terus mendorong percepatan adopsi kendaraan listrik (EV) di Indonesia melalui gelaran pameran otomotif. CEO Indomobil Dealers Group, Santiko Wardoyo, menyatakan bahwa kendaraan listrik sangat ekonomis dan efisien dari sisi bahan bakar serta perawatan pasca-penjualan yang jauh lebih murah karena tidak memerlukan oli. Untuk menunjang hal ini, PLN UID Jawa Timur berkomitmen dengan menyediakan sekitar 300 stasiun pengisian daya (SPKLU) yang tersebar luas demi meningkatkan kepercayaan masyarakat menggunakan kendaraan ramah lingkungan.',
    coverUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    author: 'Lukman Hakim',
    likes: 356,
    commentsCount: 22,
    url: 'https://surabaya.inews.id/read/691788/penjualan-mobil-listrik-di-surabaya-naik-4-kali-lipat-pada-awal-2026'
  },
  {
    id: 'news-3',
    title: 'Resolusi 2026 Namira Eco Print Surabaya: Gaungkan “Back to Nature”, Ajak Anak Muda Lebih Peduli Lingkungan',
    category: 'Fesyen Berkelanjutan',
    date: '23 Januari 2026',
    readTime: '5 menit baca',
    description: 'Menyambut tahun 2026, Namira Eco Print Surabaya mengusung tema "Back to Nature" dengan meluncurkan koleksi warna-warna alami dan mengajak generasi muda lebih peduli terhadap kelestarian alam.',
    content: 'Menyambut tahun 2026, Namira Eco Print menegaskan komitmennya untuk terus bergerak bersama alam melalui koleksi bernuansa "Back to Nature". Owner Namira Eco Print, Yayuk Eko Agustin, menyampaikan bahwa konsep ini diwujudkan dengan eksplorasi tanaman mangrove dan pewarna alami seperti rebusan bubuk kayu lockwood yang memunculkan warna biru lembut. Namira memegang komitmen teguh: siapa yang memetik daun wajib menanam kembali. Diharapkan produk fesyen ini dapat menjadi sarana edukasi bagi Gen Z dan Gen Alpha untuk mulai menghargai alam di sekitar mereka.',
    coverUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    author: 'Dimas Mahendra',
    likes: 289,
    commentsCount: 14,
    url: 'https://radarsurabaya.jawapos.com/surabaya/2601230024/resolusi-2026-namira-eco-print-surabaya-gaungkan-back-to-nature-ajak-anak-muda-lebih-peduli-lingkungan'
  },
  {
    id: 'news-4',
    title: 'Air Hujan Kota Surabaya Terkontaminasi Mikroplastik: Ecoton Himbau Warga Tidak Telan Air Hujan Secara Langsung',
    category: 'Kesehatan Lingkungan',
    date: '23 November 2025',
    readTime: '5 menit baca',
    description: 'Penelitian terbaru dari Ecoton bersama jejaring GrowGreen, Jejak, dan River Warrior mengungkap air hujan di Surabaya terkontaminasi mikroplastik, dengan konsentrasi tertinggi di daerah Pakis Gelora dan Tanjung Perak.',
    content: 'Penelitian terbaru dari Lembaga Kajian Ekologi dan Konservasi Lahan Basah (Ecoton) bersama komunitas GrowGreen dan Jejak menunjukkan bahwa seluruh sampel air hujan di Kota Surabaya telah terkontaminasi oleh mikroplastik jenis fiber. Konsentrasi tertinggi ditemukan di Pakis Gelora dengan 356 partikel per liter and Tanjung Perak dengan 309 partikel per liter. Kontaminasi ini dipicu oleh pembakaran sampah terbuka, gesekan ban kendaraan dengan aspal, serta evaporasi uap air laut yang tercemar plastik. Ecoton mengimbau masyarakat tidak menelan air hujan secara langsung demi kesehatan.',
    coverUrl: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=800&q=80',
    author: 'Ecoton News',
    likes: 512,
    commentsCount: 37,
    url: 'https://ecoton.or.id/air-hujan-kota-surabaya-terkontaminasi-mikroplastik-ecoton-himbau-warga-tidak-telan-air-hujan-secara-langsung/'
  },
  {
    id: 'news-5',
    title: '5 Things to Watch in Climate and Environment in 2026',
    category: 'Perubahan Iklim',
    date: '21 Januari 2026',
    readTime: '6 menit baca',
    description: 'Tahun 2026 menjadi momen krusial bagi aksi iklim global, kerja sama internasional, perkotaan berkelanjutan, dan keberpihakan pada sains.',
    content: 'United Nations University merilis lima tren lingkungan global utama yang wajib diperhatikan sepanjang tahun 2026: (1) peningkatan suhu bumi global yang mendekati overshoot 1.5 derajat Celcius, (2) negosiasi COP 31 di Turki mengenai kelanjutan target pendanaan iklim developing nations, (3) upaya penyelarasan tiga konvensi Rio Conventions (Iklim, Biodiversitas, dan Lahan Degradasi), (4) peran strategis kepemimpinan perkotaan dalam transisi berkelanjutan yang adil di World Urban Forum Baku, serta (5) pentingnya mempertahankan komitmen kolaborasi ilmiah internasional berbasis data dan sains terpercaya.',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    author: 'United Nations University',
    likes: 624,
    commentsCount: 45,
    url: 'https://unu.edu/ehs/article/5-things-watch-climate-and-environment-2026'
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
