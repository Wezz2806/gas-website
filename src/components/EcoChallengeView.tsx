import React, { useState } from 'react';
import { 
  ExternalLink, 
  Award, 
  ClipboardCheck,
  FileText,
  CheckCircle,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Save,
  Loader2
} from 'lucide-react';
import { getImageUrl, handleImageError, getTestImageFallback } from '../utils/imageUrl';

export const SURVEY_QUESTIONS = [
  { id: 1, text: "Apakah kegiatan awal pembelajaran membantu anda memahami tujuan dan permasalahan yang akan dipelajari?" },
  { id: 2, text: "Apakah kasus permasalahan lingkungan yang disajikan menarik perhatian anda untuk belajar?" },
  { id: 3, text: "Apakah dengan bekerja secara berkelompok membantu anda bekerja sama dengan anggota kelompok secara efektif?" },
  { id: 5, text: "Apakah anda lebih mudah mengidentifikasi masalah yang terdapat dalam kasus?" },
  { id: 6, text: "Apakah anda lebih mudah menemukan penyebab masalah lingkungan yang dibahas?" },
  { id: 7, text: "Apakah data dan informasi yang tersedia pada GAS website membantu anda menganalisis kasus?" },
  { id: 8, text: "Apakah anda dapat merancang alternatif solusi terhadap masalah yang diberikan?" },
  { id: 9, text: "Apakah anda memilih solusi yang paling tepat berdasarkan data dan fakta?" },
  { id: 10, text: "Apakah anda menerapkan solusi dalam bentuk tindakan nyata?" },
  { id: 11, text: "Apakah kegiatan mengkomunasikan hasil dalam bentuk video membantu anda mengomunikasikan hasil pemecahan masalah dengan lebih baik?" },
  { id: 12, text: "Apakah GAS website mudah digunakan selama kegiatan pembelajaran?" },
  { id: 13, text: "Apakah tampilan GAS website menarik dan mudah dipahami?" },
  { id: 14, text: "Apakah fitur-fitur pada GAS website membantu anda memperoleh informasi yang dibutuhkan?" },
  { id: 15, text: "Apakah GAS website membantu anda belajar secara mandiri?" },
  { id: 16, text: "Apakah GAS website membantu anda mengikuti setiap tahapan pembelajaran CASUAL dengan lebih baik?" },
  { id: 17, text: "Apakah pembelajaran ini membantu anda memahami hubungan antara aktivitas manusia dan lingkungan?" },
  { id: 18, text: "Apakah pembelajaran ini meningkatkan kepedulian anda terhadap masalah lingkungan?" },
  { id: 19, text: "Apakah pembelajaran ini mendorong anda melakukan tindakan yang lebih ramah lingkungan dalam kehidupan sehari-hari?" },
  { id: 20, text: "Apakah anda mengevaluasi kembali solusi berupa aksi nyata yang telah dibuat?" },
  { id: 21, text: "Apakah anda terbantu dalam memperbaiki kesalahan dalam proses pemecahan masalah?" },
  { id: 22, text: "Apakah pembelajaran ini meningkatkan kemampuan anda dalam memecahkan masalah secara sistematis?" },
  { id: 23, text: "Apakah bahan ajar yang digunakan mudah dipahami?" },
  { id: 24, text: "Apakah bahan ajar membantu anda memahami materi yang dipelajari?" },
  { id: 25, text: "Apakah lembar kerja murid (LKM) membantu anda menyelesaikan tugas pembelajaran?" },
  { id: 26, text: "Apakah suasana kelas selama pembelajaran membuat anda aktif berdiskusi?" },
  { id: 27, text: "Apakah cara guru menyajikan materi membantu anda memahami pembelajaran dengan baik?" }
];

export const TEST_CASES = [
  {
    step: 1,
    id: 1,
    title: "KASUS 1: Dari Botol ke Mikroplastik yang Kembali ke Meja Makan Kita",
    elements: [
      {
        type: "paragraph",
        value: "Setiap pagi, kantin sekolah dipenuhi murid yang membeli minuman dalam botol plastik sekali pakai. Dalam sehari, satu sekolah dapat menghasilkan ratusan botol plastik berbahan PET (polyethylene terephthalate). Tren menunjukkan peningkatan produksi plastik global meningkat dari ±200 juta ton (2000) menjadi lebih dari 400 juta ton (2024) melonjak dua kali lipat karena tuntutan masyarakat terhadap konsumsi kemasan sekali pakai."
      },
      {
        type: "image",
        value: "/uploads/test/kasus1_sampah_plastik.jpg",
        values: ["/uploads/test/kasus1_sampah_plastik.jpg"],
        caption: "Gambar 1. Sampah Plastik Menimbun"
      },
      {
        type: "table",
        value: {
          headers: ["Jenis Sampah", "Persentase (%)", "Perkiraan Volume (juta ton/tahun)"],
          rows: [
            ["Organik", "60%", "41,1"],
            ["Plastik", "17%", "11,6"],
            ["Kertas", "10%", "6,8"],
            ["Logam & Kaca", "5%", "3,4"],
            ["Lainnya", "8%", "5,6"]
          ]
        },
        caption: "Tabel 1. Komposisi Sampah di Indonesia"
      },
      {
        type: "paragraph",
        value: "Data dari Kementerian Lingkungan Hidup dan Kehutanan (KLHK) menunjukkan bahwa Indonesia menghasilkan sekitar 68,5 juta ton sampah per tahun, dengan plastik mencapai ±17%. Di kota besar seperti Surabaya, sebagian sampah plastik ini berakhir di sungai yang bermuara ke laut. Plastik yang tidak terkelola akan terpapar sinar UV dan mengalami degradasi fisik menjadi mikroplastik."
      },
      {
        type: "image",
        value: "/uploads/test/kasus1_alur_mikroplastik.png",
        values: ["/uploads/test/kasus1_alur_mikroplastik.png"],
        caption: "Gambar 2. Diagram Alur Proses Plastik dapat Masuk ke Makanan"
      },
      {
        type: "paragraph",
        value: "Mikroplastik ini masuk ke rantai makanan melalui organisme air seperti plankton dan ikan kecil. Studi global oleh UNEP menunjukkan bahwa mikroplastik telah ditemukan dalam air minum, garam, dan bahkan tubuh manusia. Ironisnya, plastik yang awalnya digunakan untuk kenyamanan manusia justru kembali sebagai ancaman kesehatan dan lingkungan. Di sisi lain, kebiasaan konsumsi praktis terus meningkat. Tanpa perubahan perilaku dan inovasi material, pencemaran ini akan semakin sulit dikendalikan."
      }
    ],
    questions: [
      {
        id: "q1",
        label: "1. Berdasarkan kasus diatas di jelaskan jika plastik menyumbang 17% sampah di Indonesia. Jelaskan mengapa plastik sekali pakai dapat menyebabkan pencemaran lingkungan yang berkepanjangan! Hubungkan jawabanmu dengan sifat-sifat plastik dalam kehidupan sehari-hari dan dampaknya terhadap lingkungan."
      },
      {
        id: "q2",
        label: "2. Identifikasilah faktor-faktor utama yang menyebabkan meningkatnya pencemaran plastik sekali pakai di lingkungan sekolah dan perkotaan. Jelaskan hubungan antara faktor tersebut dengan buruknya akumulasi plastik di lingkungan!"
      },
      {
        id: "q3",
        label: "3. Analisislah dampak keberadaan mikroplastik terhadap organisme hidup dengan meninjau aspek kimia (interaksi dengan zat berbahaya) dan ekologi (rantai makanan). Jelaskan bagaimana proses tersebut dapat berdampak pada manusia!"
      },
      {
        id: "q4",
        label: "4. Rancanglah solusi alternatif untuk mengurangi penggunaan plastik sekali pakai di lingkungan sekolah dengan menerapkan minimal dua prinsip green chemistry!",
        question_table: {
          headers: ["No", "Jenis Bahan/Produk Alternatif", "Prinsip Green Chemistry", "Keunggulan", "Tantangan Penerapan"],
          rows: [
            ["1.", "", "", "", ""],
            ["2.", "", "", "", ""]
          ]
        }
      }
    ]
  },
  {
    step: 2,
    id: 2,
    title: "KASUS 2: Limbah Deterjen Rumah Tangga",
    elements: [
      {
        type: "paragraph",
        value: "Di kawasan aliran Sungai Cikarang Bekasi Laut (CBL), aktivitas rumah tangga menjadi salah satu sumber utama pencemaran air. Setiap hari, masyarakat menggunakan deterjen untuk mencuci pakaian dan peralatan rumah tangga. Air limbah cucian yang mengandung surfaktan dan fosfat langsung dialirkan ke saluran drainase tanpa pengolahan lalu bermuara ke sungai yang juga dimanfaatkan untuk kebutuhan sehari-hari."
      },
      {
        type: "image",
        value: "/uploads/test/kasus2_busa_sungai.jpg",
        values: ["/uploads/test/kasus2_busa_sungai.jpg"],
        caption: "Gambar 3. Busa Tebal Menutup Sungai"
      },
      {
        type: "table",
        value: {
          headers: ["Jenis Deterjen", "Kandungan Fosfat (%)", "Biodegradabilitas", "Dampak Lingkungan"],
          rows: [
            ["Deterjen konvensional", "20–35%", "Rendah", "Tinggi (eutrofikasi)"],
            ["Deterjen rendah fosfat", "5–10%", "Sedang", "Sedang"],
            ["Deterjen ramah lingkungan", "<1%", "Tinggi", "Rendah"]
          ]
        },
        caption: "Tabel 2. Kandungan Fosfat pada Berbagai Jenis Deterjen"
      },
      {
        type: "paragraph",
        value: "Surfaktan dalam deterjen memiliki sifat hidrofilik dan hidrofobik yang efektif mengangkat kotoran, tetapi juga berpotensi mengganggu organisme air. Sementara itu, fosfat berperan sebagai “nutrisi” bagi alga. Ketika jumlahnya berlebih terjadi eutrofikasi atau ledakan pertumbuhan alga yang menutupi permukaan air. Akibatnya cahaya matahari terhalang dan kadar oksigen terlarut menurun drastis."
      },
      {
        type: "image",
        value: "/uploads/test/kasus2_alur_eutrofikasi.png",
        values: ["/uploads/test/kasus2_alur_eutrofikasi.png"],
        caption: "Gambar 4. Alur Pencemaram Detergen dan Proses Eutrofikasi"
      },
      {
        type: "paragraph",
        value: "Dalam beberapa titik pengamatan, masyarakat melaporkan munculnya busa tebal di permukaan sungai serta kematian ikan secara massal. Kondisi ini tidak hanya mengganggu ekosistem tetapi juga berpotensi membahayakan kesehatan manusia yang menggunakan air tersebut."
      }
    ],
    questions: [
      {
        id: "q5",
        label: "5. Berdasarkan data kualitas air dan penjelasan tentang surfaktan dalam kasus, jelaskan bagaimana sifat kimia surfaktan dapat memengaruhi kualitas air sungai!"
      },
      {
        id: "q6",
        label: "6. Perhatikan data kadar fosfat dan kondisi air pada kasus. Jelaskan hubungan antara peningkatan kadar fosfat dengan terjadinya eutrofikasi di perairan!"
      },
      {
        id: "q7",
        label: "7. Berdasarkan narasi kasus, identifikasi:\na. Sumber utama pencemaran air\nb. Zat kimia yang berperan dalam pencemaran\nJelaskan alasan Anda!"
      },
      {
        id: "q8",
        label: "8. Jelaskan salah satu solusi adalah penggunaan deterjen ramah lingkungan. Evaluasilah solusi tersebut berdasarkan prinsip green chemistry!"
      }
    ]
  },
  {
    step: 3,
    id: 3,
    title: "KASUS 3: Pestisida Kimia: Panen Melimpah atau Lingkungan Terancam?",
    elements: [
      {
        type: "paragraph",
        value: "Pertanian sayur di Jawa Timur rutin menggunakan pestisida kimia sintetis untuk mengatasi serangan hama ulat dan wereng. Dalam satu musim tanam, penyemprotan dilakukan hingga 8–12 kali demi menjaga hasil panen tetap tinggi. Salah satu pestisida yang digunakan mengandung senyawa organofosfat yang bersifat toksik dan relatif persisten di lingkungan."
      },
      {
        type: "image",
        value: "/uploads/test/kasus3_penggunaan_pestisida.jpg",
        values: ["/uploads/test/kasus3_penggunaan_pestisida.jpg"],
        caption: "Gambar 5. Penggunaan Peptisida di Sawah"
      },
      {
        type: "paragraph",
        value: "Namun, dalam beberapa tahun terakhir, masyarakat mulai mengeluhkan perubahan lingkungan. Populasi lebah penyerbuk menurun drastis, ikan di saluran irigasi sering ditemukan mati, dan beberapa petani mengalami gejala pusing serta iritasi kulit setelah penyemprotan. Hasil uji sederhana menunjukkan adanya residu pestisida pada sayuran yang melebihi batas aman."
      },
      {
        type: "image",
        value: "/uploads/test/kasus3_tren_pestisida.png",
        values: ["/uploads/test/kasus3_tren_pestisida.png"],
        caption: "Gambar 6. Diagram Tren Penggunaan Peptisida"
      },
      {
        type: "paragraph",
        value: "Di sisi lain, petani menghadapi dilema jika harus memilih tanpa pestisida maka risiko gagal panen meningkat dan berdampak pada ekonomi mereka. Penggunaan pestisida memang meningkatkan produktivitas tetapi juga memicu pencemaran tanah, air, serta berpotensi membahayakan kesehatan manusia melalui rantai makanan."
      }
    ],
    questions: [
      {
        id: "q9",
        label: "9. Berdasarkan data pada kasus, residu pestisida pada sayuran melebihi batas aman dan terjadi penurunan populasi organisme seperti lebah dan ikan. Jelaskan bagaimana sifat kimia pestisida sintetis dapat menyebabkan dampak tersebut terhadap lingkungan dan organisme hidup!"
      },
      {
        id: "q10",
        label: "10. Petani masih bergantung pada pestisida kimia untuk menjaga hasil panen. Rancang satu solusi berbasis prinsip green chemistry yang dapat digunakan sebagai alternatif pestisida kimia, serta jelaskan alasan ilmiahnya!"
      },
      {
        id: "q11",
        label: "11. Pestisida yang bersifat lipofilik dapat masuk ke rantai makanan dan mengalami peningkatan konsentrasi. Analisis bagaimana proses ini terjadi dari lingkungan hingga ke manusia, serta kaitkan dengan dampaknya terhadap kesehatan!"
      }
    ]
  },
  {
    step: 4,
    id: 4,
    title: "KASUS 4: Sintesis Kimia Industri",
    elements: [
      {
        type: "paragraph",
        value: "Sebuah industri kimia di Indonesia memproduksi bahan baku plastik melalui reaksi sintesis organik. Proses produksi ini menghasilkan berbagai produk samping dan limbah yang memerlukan penanganan khusus sebelum dilepaskan ke lingkungan."
      },
      {
        type: "image",
        value: "/uploads/test/kasus4_pabrik_gas.jpg",
        values: ["/uploads/test/kasus4_pabrik_gas.jpg"],
        caption: "Gambar 6. Pabrik dengan Cerobong Mengeluarkan Gas"
      },
      {
        type: "table",
        value: {
          headers: ["Jenis Limbah", "Sifat", "Dampak"],
          rows: [
            ["Limbah cair organik", "Toksik", "Mencemari air"],
            ["VOC (gas)", "Mudah menguap", "Polusi udara"],
            ["Limbah padat", "Sulit terurai", "Akumulasi lingkungan"]
          ]
        },
        caption: "Tabel 3. Jenis Limbah Industri Kimia"
      },
      {
        type: "paragraph",
        value: "Selain itu, penggunaan pelarut organik yang mudah menguap menyebabkan pelepasan senyawa organik volatil (VOC) ke udara. Dalam evaluasi efisiensi sintesis, perusahaan mengukur nilai atom economy untuk tiga jalur reaksi berbeda:\n- Metode A (konvensional, tanpa katalis): Atom Economy = 65%\n- Metode B (dengan katalis daur ulang): Atom Economy = 85%\n- Metode C (jalur hijau biokatalis): Atom Economy = 95%"
      }
    ],
    questions: [
      {
        id: "q12",
        label: "12. Berdasarkan data atom economy (65%, 85%, 95%), jelaskan mengapa proses dengan atom economy lebih tinggi lebih ramah lingkungan!"
      },
      {
        id: "q13",
        label: "13. Usulkan perbaikan metode sintesis agar lebih ramah lingkungan berdasarkan data atom economy dan tabel limbah di atas!"
      },
      {
        id: "q14",
        label: "14. Bandingkan proses tanpa katalis (65%) dan dengan katalis (85%). Jelaskan keuntungan penggunaan katalis dalam green chemistry!"
      },
      {
        id: "q15",
        label: "15. Dari tiga metode (A, B, C), tentukan metode terbaik dan jelaskan alasan berdasarkan prinsip green chemistry!"
      }
    ]
  },
  {
    step: 5,
    id: 5,
    title: "KASUS 5: Terangnya Lampu dibalik Menipisnya Energi Fosil",
    elements: [
      {
        type: "table",
        value: {
          headers: ["Sumber Energi", "Emisi CO₂ (g/kWh)", "Keterangan"],
          rows: [
            ["Batu bara", "820", "Emisi tertinggi"],
            ["Minyak bumi", "650", "Digunakan pada transportasi"],
            ["Gas alam", "490", "Lebih rendah dari batu bara"],
            ["Energi surya", "50", "Hampir tanpa emisi langsung"],
            ["Energi angin", "12", "Paling rendah"]
          ]
        },
        caption: "Tabel 4. Emisi CO₂ dari Sumber Energi"
      },
      {
        type: "paragraph",
        value: "Setiap hari, rumah tangga, sekolah, dan industri di Indonesia bergantung pada listrik dan bahan bakar untuk beraktivitas. Sebagian besar energi tersebut masih berasal dari pembakaran bahan bakar fosil seperti batu bara, minyak bumi, dan gas alam. Data menunjukkan bahwa lebih dari 80% pembangkit listrik di Indonesia masih menggunakan batu bara sebagai sumber utama energi."
      },
      {
        type: "image",
        value: "/uploads/test/kasus5_proses_pembakaran.png",
        values: ["/uploads/test/kasus5_proses_pembakaran.png"],
        caption: "Gambar 7. Proses Pembakaran Bahan Bakar Fosil"
      },
      {
        type: "paragraph",
        value: "Namun, di balik kemudahan tersebut, terdapat konsekuensi lingkungan yang serius. Proses pembakaran bahan bakar fosil menghasilkan gas karbon dioksida (CO₂), sulfur dioksida (SO₂), dan nitrogen oksida (NOₓ) yang berkontribusi terhadap pemanasan global, hujan asam, dan penurunan kualitas udara."
      },
      {
        type: "image",
        value: "/uploads/test/kasus5_energi_perubahan_iklim.png",
        values: ["/uploads/test/kasus5_energi_perubahan_iklim.png"],
        caption: "Gambar 8. Hubungan Energi Fosil dan Perubahan Iklim"
      },
      {
        type: "paragraph",
        value: "Di sisi lain, kebutuhan energi terus meningkat seiring pertumbuhan populasi dan ekonomi. Hal ini menimbulkan dilema: apakah tetap bergantung pada energi fosil yang murah dan tersedia, atau beralih ke energi terbarukan yang lebih ramah lingkungan namun memerlukan investasi awal."
      }
    ],
    questions: [
      {
        id: "q16",
        label: "16. Berdasarkan data emisi CO₂ dari berbagai sumber energi, jelaskan bagaimana proses pembakaran bahan bakar fosil dapat menyebabkan pencemaran udara dan pemanasan global!"
      },
      {
        id: "q17",
        label: "17. Berdasarkan data perbandingan emisi energi, usulkan satu solusi energi alternatif yang lebih ramah lingkungan untuk menggantikan energi fosil di kehidupan sehari-hari, serta jelaskan alasannya berdasarkan prinsip green chemistry!"
      },
      {
        id: "q18",
        label: "18. Evaluasi kelebihan dan kekurangan dari solusi energi alternatif yang kamu usulkan sebelumnya jika diterapkan di Indonesia!"
      }
    ]
  }
];

interface EcoChallengeViewProps {
  roomId?: number;
}

export default function EcoChallengeView({ roomId }: EcoChallengeViewProps) {
  const [submittedTest, setSubmittedTest] = useState(false);
  const [submittedAngket, setSubmittedAngket] = useState(false);

  // Survey States
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<number, 'Ya' | 'Tidak'>>({});
  const [surveyFeedback, setSurveyFeedback] = useState('');
  const [surveyQuestions, setSurveyQuestions] = useState<any[]>(SURVEY_QUESTIONS);
  const [isSavingSurvey, setIsSavingSurvey] = useState(false);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(false);
  const [surveySuccessMessage, setSurveySuccessMessage] = useState<string | null>(null);

  // Test States
  const [showTestModal, setShowTestModal] = useState(false);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testStep, setTestStep] = useState<number>(1);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [isSavingTest, setIsSavingTest] = useState(false);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<any[]>([]);

  // Load existing survey and test data on mount
  React.useEffect(() => {
    const surveyUrl = roomId ? `/api/student-survey.php?room_id=${roomId}` : '/api/student-survey.php';
    const testUrl = roomId ? `/api/student-test.php?room_id=${roomId}` : '/api/student-test.php';

    // Fetch survey questions
    fetch('/api/student-survey.php?action=get_questions')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          setSurveyQuestions(data.questions);
        }
      })
      .catch(err => console.error(err));

    // Fetch survey
    fetch(surveyUrl)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.survey) {
          setSurveyAnswers(data.survey.answers || {});
          setSurveyFeedback(data.survey.feedback || '');
          setSubmittedAngket(true);
        } else {
          setSurveyAnswers({});
          setSurveyFeedback('');
          setSubmittedAngket(false);
        }
      })
      .catch(err => console.error(err));

    // Fetch test
    fetch(testUrl)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.test) {
          setTestAnswers(data.test.answers || {});
          setTestStep(data.test.current_step || 1);
          setTestSubmitted(data.test.submitted === 1);
          setSubmittedTest(data.test.submitted === 1);
        } else {
          setTestAnswers({});
          setTestStep(1);
          setTestSubmitted(false);
          setSubmittedTest(false);
        }
      })
      .catch(err => console.error(err));

    // Fetch cases
    fetch('/api/student-test.php?action=get_cases')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.cases && data.cases.length > 0) {
          setTestCases(data.cases);
        } else {
          setTestCases(TEST_CASES);
        }
      })
      .catch(() => {
        setTestCases(TEST_CASES);
      });
  }, [roomId]);

  const handleOpenTest = () => {
    setShowTestModal(true);
    setIsLoadingTest(true);
    const testUrl = roomId ? `/api/student-test.php?room_id=${roomId}` : '/api/student-test.php';
    fetch(testUrl)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.test) {
          setTestAnswers(data.test.answers || {});
          setTestStep(data.test.current_step || 1);
          setTestSubmitted(data.test.submitted === 1);
          setSubmittedTest(data.test.submitted === 1);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoadingTest(false));
  };

  const handleSaveTestProgress = async (nextStep: number, isSubmitting = false) => {
    setIsSavingTest(true);
    setTestSuccessMessage(null);
    try {
      const res = await fetch('/api/student-test.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: testAnswers,
          current_step: nextStep,
          submitted: isSubmitting ? 1 : 0,
          room_id: roomId
        })
      });
      const data = await res.json();
      if (data.success) {
        if (isSubmitting) {
          setTestSubmitted(true);
          setSubmittedTest(true);
          setTestSuccessMessage('Test evaluasi berhasil dikirimkan!');
          setTimeout(() => {
            setShowTestModal(false);
            setTestSuccessMessage(null);
          }, 3000);
        } else {
          setTestStep(nextStep);
          setTestSuccessMessage('Progress berhasil disimpan.');
          setTimeout(() => setTestSuccessMessage(null), 2000);
        }
      } else {
        alert(data.message || 'Gagal menyimpan test.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsSavingTest(false);
    }
  };

  const handleOpenSurvey = () => {
    setShowSurveyModal(true);
    setIsLoadingSurvey(true);
    const surveyUrl = roomId ? `/api/student-survey.php?room_id=${roomId}` : '/api/student-survey.php';
    fetch(surveyUrl)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.survey) {
          setSurveyAnswers(data.survey.answers || {});
          setSurveyFeedback(data.survey.feedback || '');
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoadingSurvey(false));
  };

  const handleSaveSurvey = async () => {
    setIsSavingSurvey(true);
    setSurveySuccessMessage(null);
    try {
      const res = await fetch('/api/student-survey.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: surveyAnswers,
          feedback: surveyFeedback,
          room_id: roomId
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmittedAngket(true);
        setSurveySuccessMessage('Angket respon berhasil disimpan!');
        setTimeout(() => {
          setSurveySuccessMessage(null);
        }, 3000);
      } else {
        alert(data.message || 'Gagal menyimpan angket.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsSavingSurvey(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">

      {/* Header Banner */}
      <section className="text-left bg-gradient-to-r from-emerald-50 to-[#F5F5DC] p-6 md:p-8 rounded-3xl border border-[#c2c9bb]/40 flex flex-col md:flex-row items-center gap-6">
        <div className="shrink-0 p-4 bg-white rounded-2xl shadow border-2 border-[#91f78e]">
          <Award className="w-12 h-12 text-[#154212] fill-amber-100" />
        </div>
        <div>
          <h2 className="font-display font-black text-xl md:text-2xl text-[#154212] mb-1">
            Evaluasi Akhir & Angket Respon
          </h2>
          <p className="font-sans text-xs md:text-sm text-[#42493e] leading-relaxed">
            Silakan isi Test Akhir dan Angket Respon Murid melalui tautan di bawah ini untuk melengkapi rangkaian aktivitas pembelajaran.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        
        {/* Test Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-6 transition-all hover:shadow-md">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-[#154212] rounded-2xl">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#154212]">Test</h3>
                <p className="text-xs text-gray-400">Menguji Pemahaman Materi</p>
              </div>
            </div>
            <p className="text-xs text-[#42493e] leading-relaxed">
              Uji pemahaman Anda mengenai materi green chemistry, eco enzyme, dan solusi aksi nyata keberlanjutan lingkungan yang telah dipelajari.
            </p>
          </div>

          <div className="space-y-3">
            {submittedTest && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-950 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#006e1c] shrink-0" />
                <span>Anda telah mengirimkan Test. Terima kasih!</span>
              </div>
            )}
            <button
              onClick={handleOpenTest}
              className="w-full bg-[#154212] hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>{submittedTest ? 'Lihat Jawaban Test' : 'Mulai Pengerjaan Test'}</span>
            </button>
          </div>
        </div>

        {/* Angket Respon Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-6 transition-all hover:shadow-md">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-[#154212] rounded-2xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#154212]">Angket Respon</h3>
                <p className="text-xs text-gray-400">Feedback Proses Belajar</p>
              </div>
            </div>
            <p className="text-xs text-[#42493e] leading-relaxed">
              Berikan respon dan tanggapan Anda selaku murid mengenai pengalaman belajar menggunakan platform GAS Website ini.
            </p>
          </div>

          <div className="space-y-3">
            {submittedAngket && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-950 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#006e1c] shrink-0" />
                <span>Anda telah mengisi Angket Respon. Terima kasih!</span>
              </div>
            )}
            <button
              onClick={handleOpenSurvey}
              className="w-full bg-[#154212] hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>{submittedAngket ? 'Lihat / Sunting Angket' : 'Isi Angket Respon'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Survey Questionnaire Modal */}
      {showSurveyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#154212] p-5 text-white flex justify-between items-center shrink-0 text-left">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#91f78e]" />
                <div>
                  <h4 className="font-display font-bold text-base">Angket Respon Murid</h4>
                  <p className="text-[11px] text-[#a1d494]">Evaluasi dan umpan balik terhadap pembelajaran menggunakan GAS Website</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSurveyModal(false)} 
                className="text-white hover:text-red-400 hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 text-left">
              {isLoadingSurvey ? (
                <div className="flex flex-col items-center justify-center h-full py-12 gap-2">
                  <div className="w-8 h-8 border-4 border-[#154212] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-500 font-bold">Memuat kuisioner...</span>
                </div>
              ) : (
                <>
                  {surveySuccessMessage && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-[#006e1c] text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in duration-250">
                      <CheckCircle className="w-4 h-4 text-[#006e1c]" />
                      <span>{surveySuccessMessage}</span>
                    </div>
                  )}

                  {/* Questionnaire Table */}
                  <div className="overflow-hidden border border-gray-150 rounded-2xl">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-150 text-slate-500 font-bold">
                          <th className="p-3.5 w-12 text-center">No</th>
                          <th className="p-3.5">Pernyataan Kuisioner</th>
                          <th className="p-3.5 w-48 text-center">Tanggapan Anda</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-slate-700 font-sans">
                        {surveyQuestions.map((q, qIdx) => {
                          const answer = surveyAnswers[q.id];
                          return (
                            <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3.5 text-center font-bold text-slate-400">{q.question_order || (qIdx + 1)}</td>
                              <td className="p-3.5 leading-relaxed pr-6">{q.text}</td>
                              <td className="p-3.5">
                                <div className="flex items-center justify-center gap-2">
                                  {/* Button Ya */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSurveyAnswers(prev => ({ ...prev, [q.id]: 'Ya' }));
                                    }}
                                    className={`px-4 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                                      answer === 'Ya'
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                        : 'bg-white border-gray-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                                  >
                                    Ya
                                  </button>

                                  {/* Button Tidak */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSurveyAnswers(prev => ({ ...prev, [q.id]: 'Tidak' }));
                                    }}
                                    className={`px-4 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                                      answer === 'Tidak'
                                        ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                                        : 'bg-white border-gray-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                                  >
                                    Tidak
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Kritik dan Saran */}
                  <div className="space-y-2 text-left pt-6 border-t border-gray-150">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Kritik dan Saran</label>
                    <textarea
                      rows={4}
                      value={surveyFeedback}
                      onChange={(e) => setSurveyFeedback(e.target.value)}
                      placeholder="Berikan kritik, saran, atau masukan membangun Anda mengenai modul, pembelajaran, atau tampilan GAS Website di sini..."
                      className="w-full bg-white border border-gray-250 rounded-2xl p-4 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#154212] focus:border-[#154212] placeholder:text-slate-350"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-150 shrink-0">
              <button
                type="button"
                onClick={() => setShowSurveyModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSaveSurvey}
                disabled={isSavingSurvey || isLoadingSurvey}
                className="px-5 py-2.5 bg-[#154212] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isSavingSurvey && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                <span>Simpan Angket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Wizard Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#154212] p-5 text-white flex justify-between items-center shrink-0 text-left">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="w-6 h-6 text-[#91f78e]" />
                <div>
                  <h4 className="font-display font-bold text-base">Test</h4>
                  <p className="text-[11px] text-[#a1d494]">Mengerjakan evaluasi akhir pembelajaran berbasis kasus (Case-Based Learning)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTestModal(false)} 
                className="text-white hover:text-red-400 hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 text-left">
              {isLoadingTest ? (
                <div className="flex flex-col items-center justify-center h-full py-12 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-[#154212]" />
                  <span className="text-xs text-gray-500 font-bold">Memuat soal test...</span>
                </div>
              ) : (
                <>
                  {testSuccessMessage && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-[#006e1c] text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in duration-250">
                      <CheckCircle className="w-4 h-4 text-[#006e1c]" />
                      <span>{testSuccessMessage}</span>
                    </div>
                  )}

                  {/* Step Progress Indicator */}
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Kasus {testStep} dari {testCases.length || 3}
                    </span>
                    <div className="flex gap-1.5">
                      {Array.from({ length: testCases.length || 3 }, (_, i) => i + 1).map((s) => (
                        <div 
                          key={s} 
                          className={`w-8 h-2 rounded-full transition-all duration-300 ${
                            s === testStep 
                              ? 'w-12 bg-[#154212]' 
                              : s < testStep 
                              ? 'bg-emerald-600' 
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Current Case Details */}
                  {testCases.map((c, idx) => {
                    const stepNum = idx + 1;
                    const caseId = c.id || stepNum;
                    if (stepNum !== testStep) return null;
                    return (
                      <div key={c.id || stepNum} className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
                        <div className="bg-[#fcfdfa] border border-[#c2c9bb]/30 p-5 rounded-2xl space-y-4">
                          <h5 className="font-display font-black text-sm text-[#154212] uppercase tracking-wide border-b border-[#c2c9bb]/20 pb-2">
                            {c.title}
                          </h5>

                          {c.elements && Array.isArray(c.elements) ? (
                            c.elements.map((el: any, elIdx: number) => {
                              if (el.type === 'paragraph') {
                                return (
                                  <p key={elIdx} className="text-xs text-[#42493e] leading-relaxed whitespace-pre-wrap font-sans">
                                    {el.value}
                                  </p>
                                );
                              } else if (el.type === 'image') {
                                const images = el.values && Array.isArray(el.values) ? el.values : [el.value];
                                return (
                                  <div key={elIdx} className="my-4 p-4 border border-[#c2c9bb]/20 rounded-2xl bg-white shadow-sm flex flex-col items-center gap-3 justify-center">
                                    <div className="flex flex-row flex-wrap items-center justify-center gap-3">
                                      {images.map((imgSrc: string, imgIdx: number) => (
                                        <img 
                                          key={imgIdx}
                                          src={getImageUrl(imgSrc)} 
                                          alt={el.caption || "Ilustrasi Kasus"} 
                                          onError={(e) => handleImageError(e, getTestImageFallback(imgSrc) || undefined)}
                                          className="max-w-full rounded-xl border border-slate-100 shadow-sm max-h-[260px] object-contain animate-in fade-in zoom-in duration-200 bg-slate-50" 
                                        />
                                      ))}
                                    </div>
                                    {el.caption && (
                                      <p className="text-[11px] font-bold text-slate-500 italic text-center">
                                        {el.caption}
                                      </p>
                                    )}
                                  </div>
                                );
                              } else if (el.type === 'table') {
                                const tbl = el.value || {};
                                const headers = tbl.headers || [];
                                const rows = tbl.rows || [];
                                return (
                                  <div key={elIdx} className="space-y-1.5 mt-3">
                                    {el.caption && (
                                      <p className="text-[11px] font-bold text-slate-600 italic">
                                        {el.caption}
                                      </p>
                                    )}
                                    <div className="overflow-x-auto border border-[#c2c9bb]/30 rounded-xl bg-white">
                                      <table className="w-full text-xs text-left border-collapse">
                                        <thead>
                                          <tr className="bg-[#154212] text-white font-bold">
                                            {headers.map((h: string, hIdx: number) => (
                                              <th key={hIdx} className="p-3 border-r border-[#154212]/10">{h}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {rows.map((row: string[], rIdx: number) => (
                                            <tr key={rIdx} className="border-b border-[#c2c9bb]/20 hover:bg-[#fcfdfa]/50">
                                              {row.map((val: string, colIdx: number) => (
                                                <td key={colIdx} className="p-3 font-sans text-slate-750 font-medium border-r border-[#c2c9bb]/10">
                                                  {val}
                                                </td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })
                          ) : (
                            <>
                              <p className="text-xs text-[#42493e] leading-relaxed whitespace-pre-wrap font-sans">
                                {c.text}
                              </p>
                              {c.extraInfo && (
                                <div className="bg-white border border-[#c2c9bb]/30 p-4 rounded-xl text-center space-y-2">
                                  <span className="block text-[10px] uppercase font-bold text-[#154212] tracking-wider">
                                    Visualisasi Data / Diagram Tren:
                                  </span>
                                  <p className="text-xs font-semibold text-slate-700 italic font-mono">
                                    {c.extraInfo}
                                  </p>
                                </div>
                              )}
                              {c.table && (
                                <div className="overflow-x-auto border border-[#c2c9bb]/30 rounded-xl bg-white mt-3">
                                  <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                      <tr className="bg-[#154212] text-white font-bold">
                                        {c.table.headers.map((h: string, i: number) => (
                                          <th key={i} className="p-3 border-r border-[#154212]/10">{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {c.table.rows.map((row: string[], rowIndex: number) => (
                                        <tr key={rowIndex} className="border-b border-[#c2c9bb]/20 hover:bg-[#fcfdfa]/50">
                                          {row.map((val: string, colIndex: number) => (
                                            <td key={colIndex} className="p-3 font-sans text-slate-750 font-medium border-r border-[#c2c9bb]/10">
                                              {val}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Questions for current case */}
                        <div className="space-y-5">
                          {c.questions && c.questions.map((q: any) => {
                            const getTableGrid = (qId: string, qTable: any) => {
                              let grid: string[][] = [];
                              try {
                                const parsed = JSON.parse(testAnswers[`${caseId}_${qId}`] || testAnswers[qId] || '');
                                if (Array.isArray(parsed) && parsed.length === qTable.rows.length) {
                                  grid = parsed;
                                }
                              } catch (e) {}

                              if (grid.length === 0) {
                                grid = qTable.rows.map((row: any) => row.map((cell: any) => cell || ''));
                              }
                              return grid;
                            };

                            return (
                              <div key={q.id} className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                                  {q.label}
                                </label>
                                {((q as any).image || ((q as any).images && (q as any).images.length > 0)) && (
                                  <div className="my-3 flex flex-col items-center">
                                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm max-w-lg">
                                      <img
                                        src={getImageUrl((q as any).image || (q as any).images[0])}
                                        alt={`Ilustrasi Soal ${q.id}`}
                                        className="max-h-72 w-auto object-contain mx-auto"
                                        onError={(e) => handleImageError(e, getTestImageFallback((q as any).image || (q as any).images?.[0]) || undefined)}
                                      />
                                    </div>
                                    {(q as any).caption && (
                                      <p className="mt-1.5 text-center text-[11px] italic text-slate-500 font-medium">
                                        {(q as any).caption}
                                      </p>
                                    )}
                                  </div>
                                )}
                                {q.question_table ? (() => {
                                  const tbl = q.question_table;
                                  const grid = getTableGrid(q.id, tbl);
                                  
                                  return (
                                    <div className="overflow-x-auto border border-[#c2c9bb]/30 rounded-2xl bg-white mt-2">
                                      <table className="w-full text-xs text-left border-collapse">
                                        <thead>
                                          <tr className="bg-[#154212] text-white font-bold">
                                            {tbl.headers.map((h: string, hIdx: number) => (
                                              <th key={hIdx} className="p-3 border-r border-[#154212]/10">{h}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {grid.map((row, rIdx) => (
                                            <tr key={rIdx} className="border-b border-[#c2c9bb]/20 hover:bg-[#fcfdfa]/50">
                                              {row.map((cellVal, cIdx) => {
                                                const templateVal = tbl.rows[rIdx]?.[cIdx] || '';
                                                const isEditable = cIdx > 0 && !(/^\d+[\.\)]?$/.test(templateVal.trim()));
                                                
                                                return (
                                                  <td key={cIdx} className="p-2 border-r border-[#c2c9bb]/10">
                                                    {isEditable ? (
                                                      <textarea
                                                        rows={2}
                                                        disabled={testSubmitted}
                                                        value={cellVal || ''}
                                                        onChange={(e) => {
                                                          const newGrid = [...grid];
                                                          newGrid[rIdx] = [...newGrid[rIdx]];
                                                          newGrid[rIdx][cIdx] = e.target.value;
                                                          setTestAnswers(prev => ({
                                                            ...prev,
                                                            [`${caseId}_${q.id}`]: JSON.stringify(newGrid)
                                                          }));
                                                        }}
                                                        placeholder="Ketik jawaban..."
                                                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-slate-805 focus:outline-none focus:ring-1 focus:ring-[#154212] disabled:bg-slate-50 disabled:text-slate-500 font-sans resize-none"
                                                      />
                                                    ) : (
                                                      <span className="font-sans text-slate-750 font-bold px-2 block">
                                                        {cellVal || templateVal}
                                                      </span>
                                                    )}
                                                  </td>
                                                );
                                              })}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  );
                                })() : (
                                  <textarea
                                    rows={4}
                                    disabled={testSubmitted}
                                    value={testAnswers[`${caseId}_${q.id}`] ?? testAnswers[q.id] ?? ''}
                                    onChange={(e) => {
                                      setTestAnswers(prev => ({
                                        ...prev,
                                        [`${caseId}_${q.id}`]: e.target.value
                                      }));
                                    }}
                                    placeholder={testSubmitted ? "Tidak ada jawaban." : "Tuliskan jawaban analitis dan ilmiah Anda di sini..."}
                                    className="w-full bg-white border border-gray-250 rounded-2xl p-4 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#154212] focus:border-[#154212] placeholder:text-slate-350 disabled:bg-slate-50 disabled:text-slate-500"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-150 shrink-0">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                Tutup
              </button>

              <div className="flex gap-2">
                {testStep > 1 && (
                  <button
                    type="button"
                    onClick={() => handleSaveTestProgress(testStep - 1, false)}
                    disabled={isSavingTest}
                    className="px-4 py-2.5 border border-gray-250 hover:bg-gray-100 text-slate-600 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>
                )}

                 {testStep < (testCases.length || 3) ? (
                  <button
                    type="button"
                    onClick={() => handleSaveTestProgress(testStep + 1, false)}
                    disabled={isSavingTest}
                    className="px-5 py-2.5 bg-[#154212] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span>Selanjutnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  !testSubmitted && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Apakah Anda yakin ingin mengirimkan seluruh jawaban test Anda? Tindakan ini tidak dapat diubah.')) {
                          handleSaveTestProgress(testCases.length || 3, true);
                        }
                      }}
                      disabled={isSavingTest}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSavingTest ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Kirim Test</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
