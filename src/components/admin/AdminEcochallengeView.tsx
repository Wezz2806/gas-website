import React, { useState, useEffect } from 'react';
import { ClipboardList, Loader2, Eye, Download, Calendar, User, FileText, ArrowRight, Upload, Plus, Trash2, Save, File, Table, Image, BarChart3, ChevronUp, ChevronDown, Check, X } from 'lucide-react';
import { Meeting, JournalRow } from '../../types';
export default function AdminEcochallengeView() {
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'survey' | 'test'>('survey');
  // Survey admin states
  const [surveyStudents, setSurveyStudents] = useState<any[]>([]);
  const [isLoadingSurveys, setIsLoadingSurveys] = useState(false);
  const [selectedSurveyStudent, setSelectedSurveyStudent] = useState<any | null>(null);
  const [selectedSurveyAnswers, setSelectedSurveyAnswers] = useState<Record<number, 'Ya' | 'Tidak'>>({});
  const [selectedSurveyFeedback, setSelectedSurveyFeedback] = useState('');
  const [isLoadingSurveyRows, setIsLoadingSurveyRows] = useState(false);
  const [showStatsDetail, setShowStatsDetail] = useState(false);

  // Test admin states
  const [testStudents, setTestStudents] = useState<any[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [selectedTestStudent, setSelectedTestStudent] = useState<any | null>(null);
  const [selectedTestAnswers, setSelectedTestAnswers] = useState<Record<string, string>>({});
  const [selectedTestStep, setSelectedTestStep] = useState<number>(1);
  const [selectedTestSubmitted, setSelectedTestSubmitted] = useState<boolean>(false);
  const [isLoadingTestDetails, setIsLoadingTestDetails] = useState(false);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [testAdminView, setTestAdminView] = useState<'submissions' | 'manage_cases'>('submissions');
  const [selectedCaseId, setSelectedCaseId] = useState<number>(1);
  const [tempCaseTitle, setTempCaseTitle] = useState<string>('');
  const [tempCaseElements, setTempCaseElements] = useState<any[]>([]);
  const [tempCaseQuestions, setTempCaseQuestions] = useState<any[]>([]);
  const [isParsingDocx, setIsParsingDocx] = useState<boolean>(false);
  const [isSavingCase, setIsSavingCase] = useState<boolean>(false);
  const [editingTableQIdx, setEditingTableQIdx] = useState<number | null>(null);
  const [tableSetupHeaders, setTableSetupHeaders] = useState<string>('');
  const [tableSetupRows, setTableSetupRows] = useState<number>(2);

  // Test grading states
  const [gradingTestStudent, setGradingTestStudent] = useState<any | null>(null);
  const [tempTestGrade, setTempTestGrade] = useState<string>('');
  const [isSubmittingTestGrade, setIsSubmittingTestGrade] = useState(false);

  const handleSaveTestGrade = () => {
    if (!gradingTestStudent) return;
    setIsSubmittingTestGrade(true);
    fetch(`${API_BASE}/student-test.php?action=grade_test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: gradingTestStudent.id,
        grade: tempTestGrade !== '' ? parseInt(tempTestGrade, 10) : null
      }),
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Nilai evaluasi berhasil disimpan!');
          setTestStudents(prev => prev.map(stud => 
            stud.id === gradingTestStudent.id 
              ? { ...stud, grade: tempTestGrade !== '' ? parseInt(tempTestGrade, 10) : null }
              : stud
          ));
          setGradingTestStudent(null);
        } else {
          alert(data.message || 'Gagal menyimpan nilai.');
        }
      })
      .catch(() => alert('Terjadi kesalahan jaringan.'))
      .finally(() => setIsSubmittingTestGrade(false));
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
  const fetchSurveyStudents = () => {
    setIsLoadingSurveys(true);
    fetch(`${API_BASE}/student-survey.php?action=get_students`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.students) {
          setSurveyStudents(data.students);
        } else {
          setError(data.message || 'Gagal memuat data angket murid.');
        }
      })
      .catch(() => {
        setError('Masalah koneksi jaringan saat memuat data angket.');
      })
      .finally(() => {
        setIsLoadingSurveys(false);
      });
  };

  const handleOpenStudentSurvey = (student: any) => {
    setSelectedSurveyStudent(student);
    setIsLoadingSurveyRows(true);
    fetch(`${API_BASE}/student-survey.php?student_id=${student.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.survey) {
          setSelectedSurveyAnswers(data.survey.answers || {});
          setSelectedSurveyFeedback(data.survey.feedback || '');
        } else {
          alert(data.message || 'Gagal memuat angket murid.');
        }
      })
      .catch(() => {
        alert('Masalah koneksi jaringan saat memuat data angket.');
      })
      .finally(() => {
        setIsLoadingSurveyRows(false);
      });
  };

  const fetchTestStudents = () => {
    setIsLoadingTests(true);
    fetch(`${API_BASE}/student-test.php?action=get_students`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.students) {
          setTestStudents(data.students);
        } else {
          setError(data.message || 'Gagal memuat data test murid.');
        }
      })
      .catch(() => {
        setError('Masalah koneksi jaringan saat memuat data test.');
      })
      .finally(() => {
        setIsLoadingTests(false);
      });
  };

  const fetchTestCases = () => {
    fetch(`${API_BASE}/student-test.php?action=get_cases`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.cases) {
          setTestCases(data.cases);
        }
      })
      .catch(err => console.error('Error fetching test cases:', err));
  };

  useEffect(() => {
    if (testCases && testCases.length > 0) {
      const current = testCases.find(c => c.id === selectedCaseId);
      if (current) {
        setTempCaseTitle(current.title || '');
        setTempCaseElements(current.elements || []);
        setTempCaseQuestions(current.questions || []);
      }
    }
  }, [selectedCaseId, testCases]);

  const handleOpenStudentTest = (student: any) => {
    setSelectedTestStudent(student);
    setIsLoadingTestDetails(true);
    fetch(`${API_BASE}/student-test.php?student_id=${student.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.test) {
          setSelectedTestAnswers(data.test.answers || {});
          setSelectedTestStep(data.test.current_step || 1);
          setSelectedTestSubmitted(data.test.submitted === 1);
        } else {
          alert(data.message || 'Gagal memuat detail test murid.');
        }
      })
      .catch(() => {
        alert('Masalah koneksi jaringan saat memuat data detail test.');
      })
      .finally(() => {
        setIsLoadingTestDetails(false);
      });
  };

  const handleUploadDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.docx')) {
      alert('Mohon unggah file dengan format DOCX (.docx).');
      return;
    }

    setIsParsingDocx(true);
    const formData = new FormData();
    formData.append('docx_file', file);

    try {
      const res = await fetch(`${API_BASE}/student-test.php?action=parse_docx`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success && data.parsed) {
        setTempCaseTitle(data.parsed.title || `Kasus ${selectedCaseId}`);
        setTempCaseElements(data.parsed.elements || []);
        setTempCaseQuestions(data.parsed.questions || []);
        alert('Dokumen berhasil dibaca! Silakan tinjau dan edit konten di bawah sebelum menyimpan.');
      } else {
        alert(data.message || 'Gagal membaca dokumen.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengunggah dokumen.');
    } finally {
      setIsParsingDocx(false);
      e.target.value = '';
    }
  };

  const handleSaveCaseData = async () => {
    if (!tempCaseTitle.trim()) {
      alert('Judul kasus tidak boleh kosong.');
      return;
    }

    setIsSavingCase(true);
    try {
      const res = await fetch(`${API_BASE}/student-test.php?action=save_case_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: selectedCaseId,
          title: tempCaseTitle,
          elements: tempCaseElements,
          questions: tempCaseQuestions
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        alert('Kasus test berhasil disimpan!');
        fetchTestCases();
      } else {
        alert(data.message || 'Gagal menyimpan kasus.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan kasus.');
    } finally {
      setIsSavingCase(false);
    }
  };

  const handleDeleteCase = async (caseId: number) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus Kasus ${caseId}? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/student-test.php?action=delete_case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Kasus berhasil dihapus.');
        const remaining = testCases.filter(c => c.id !== caseId);
        if (remaining.length > 0) {
          setSelectedCaseId(remaining[0].id);
        } else {
          setSelectedCaseId(1);
        }
        fetchTestCases();
      } else {
        alert(data.message || 'Gagal menghapus kasus.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus kasus.');
    }
  };
  useEffect(() => {
    fetchTestCases();
    fetchSurveyStudents();
  }, []);  return (
    <div className="space-y-10 text-left">
      {/* Page Header */}
      <header className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-cyan-600" />
            Kelola EcoChallenge
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Pantau data angket respon murid dan kelola kasus/soal test evaluasi.
          </p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-center gap-3 text-rose-800 text-sm animate-in fade-in duration-200">
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-2 mb-6">
        <button
          onClick={() => {
            setActiveSubTab('survey');
            fetchSurveyStudents();
          }}
          className={`pb-3 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'survey'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          Angket Respon Murid
        </button>
        <button
          onClick={() => {
            setActiveSubTab('test');
            fetchTestStudents();
          }}
          className={`pb-3 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'test'
              ? 'border-cyan-600 text-cyan-650'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          Test Murid
        </button>
      </div>      {activeSubTab === 'survey' && (() => {
        let totalYa = 0;
        let totalTidak = 0;

        const questionsList = [
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

        const questionStats = questionsList.map(q => {
          const yaStudents: string[] = [];
          const tidakStudents: string[] = [];

          surveyStudents.forEach(stud => {
            let answersObj: Record<string, string> = {};
            if (stud.answers) {
              try {
                answersObj = typeof stud.answers === 'string' ? JSON.parse(stud.answers) : stud.answers;
              } catch (e) {
                console.error(e);
              }
            }
            const ans = answersObj[q.id];
            if (ans === 'Ya') {
              yaStudents.push(stud.name);
              totalYa++;
            } else if (ans === 'Tidak') {
              tidakStudents.push(stud.name);
              totalTidak++;
            }
          });

          return {
            id: q.id,
            text: q.text,
            yaCount: yaStudents.length,
            tidakCount: tidakStudents.length,
            yaList: yaStudents,
            tidakList: tidakStudents
          };
        });

        return (
          <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-base">
                  Daftar Angket Respon Murid
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar murid yang telah mengisi angket respon evaluasi pembelajaran GAS Website.
                </p>
              </div>
            </div>

            {/* Overall Statistics Summary Card */}
            {surveyStudents.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-150 pb-3">
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-cyan-600" />
                      Statistika Respon Angket Murid
                    </h4>
                    <p className="text-[10px] text-slate-450">Analisis perbandingan jawaban Ya & Tidak dari {surveyStudents.length} murid yang mengisi angket.</p>
                  </div>
                  <button
                    onClick={() => setShowStatsDetail(!showStatsDetail)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    {showStatsDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>Detail</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total Respon */}
                  <div className="bg-white border border-slate-150 p-4 rounded-2xl flex items-center gap-3">
                    <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
                      <User className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Total Pengisi</span>
                      <span className="text-lg font-black text-slate-855 block mt-0.5">{surveyStudents.length} Murid</span>
                    </div>
                  </div>

                  {/* Setuju (Ya) */}
                  <div className="bg-white border border-slate-150 p-4 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Jawaban Ya</span>
                        <span className="text-lg font-black text-emerald-950 block mt-0.5">
                          {totalYa} ({totalYa + totalTidak > 0 ? Math.round((totalYa / (totalYa + totalTidak)) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${totalYa + totalTidak > 0 ? (totalYa / (totalYa + totalTidak)) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Tidak Setuju (Tidak) */}
                  <div className="bg-white border border-slate-150 p-4 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                        <X className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Jawaban Tidak</span>
                        <span className="text-lg font-black text-rose-950 block mt-0.5">
                          {totalTidak} ({totalYa + totalTidak > 0 ? Math.round((totalTidak / (totalYa + totalTidak)) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${totalYa + totalTidak > 0 ? (totalTidak / (totalYa + totalTidak)) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Detail Statistics per Question */}
                {showStatsDetail && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 animate-in slide-in-from-top-4 duration-200 text-left mt-2">
                    <h5 className="font-display font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <Table className="w-3.5 h-3.5 text-cyan-600" />
                      Jumlah Respon Ya & Tidak di Setiap Pertanyaan
                    </h5>
                    <div className="overflow-x-auto max-h-[450px] overflow-y-auto border border-slate-100 rounded-xl">
                      <table className="w-full border-collapse text-left text-xs min-w-[700px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold sticky top-0 z-10">
                            <th className="p-3 w-12 text-center bg-slate-50">No</th>
                            <th className="p-3 bg-slate-50">Pertanyaan Kuisioner</th>
                            <th className="p-3 w-36 text-center bg-slate-50">Setuju (Ya)</th>
                            <th className="p-3 w-36 text-center bg-slate-50">Tidak (Tidak)</th>
                            <th className="p-3 w-44 text-center bg-slate-50">Total Keseluruhan Respon</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                          {questionStats.map((q) => {
                            const totalQ = q.yaCount + q.tidakCount;
                            const yaPercent = totalQ > 0 ? Math.round((q.yaCount / totalQ) * 100) : 0;
                            const tidakPercent = totalQ > 0 ? Math.round((q.tidakCount / totalQ) * 100) : 0;
                            return (
                              <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 text-center font-bold text-slate-400">{q.id}</td>
                                <td className="p-3 leading-relaxed pr-4 font-medium text-slate-700">{q.text}</td>
                                <td className="p-3 text-center font-bold text-emerald-600 bg-emerald-50/20 whitespace-nowrap">
                                  {q.yaCount} Murid ({yaPercent}%)
                                </td>
                                <td className="p-3 text-center font-bold text-rose-600 bg-rose-50/20 whitespace-nowrap">
                                  {q.tidakCount} Murid ({tidakPercent}%)
                                </td>
                                <td className="p-3 text-center font-bold text-slate-800 bg-slate-50/30 whitespace-nowrap">
                                  {totalQ} Respon
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isLoadingSurveys ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-455 uppercase font-bold tracking-wider">
                      <th className="py-3.5 px-4 w-1/3">Nama Murid</th>
                      <th className="py-3.5 px-4">Kritik & Saran</th>
                      <th className="py-3.5 px-4">Waktu Pengisian</th>
                      <th className="py-3.5 px-4 text-right w-44">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                    {surveyStudents.map((stud) => (
                      <tr key={stud.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 space-y-0.5">
                          <p className="font-bold text-slate-800 flex items-center gap-1.5 font-display">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {stud.name}
                          </p>
                          <p className="text-[10px] text-slate-455">{stud.email}</p>
                        </td>
                        <td className="py-4 px-4 text-slate-600 max-w-xs truncate font-medium">
                          {stud.feedback || <span className="text-slate-350 italic">Tidak ada kritik/saran</span>}
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {stud.last_updated ? new Date(stud.last_updated).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleOpenStudentSurvey(stud)}
                            className="px-3.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer border border-cyan-100 float-right"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Detail Respon</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {surveyStudents.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                          Belum ada murid yang mengisi angket respon.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })()}
      {selectedSurveyStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="font-display font-bold text-sm">
                    Detail Angket Respon Murid
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Murid: <strong>{selectedSurveyStudent.name}</strong> ({selectedSurveyStudent.email})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSurveyStudent(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 text-left">
              {isLoadingSurveyRows ? (
                <div className="flex flex-col items-center justify-center h-full py-12 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                  <span className="text-xs text-gray-500 font-bold">Memuat data respon...</span>
                </div>
              ) : (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-center">
                      <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Total Setuju (Ya)</span>
                      <span className="text-3xl font-black text-emerald-950 mt-1">
                        {Object.values(selectedSurveyAnswers).filter(val => val === 'Ya').length} / 26
                      </span>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex flex-col justify-center">
                      <span className="text-xs text-rose-800 font-bold uppercase tracking-wider">Total Tidak Setuju (Tidak)</span>
                      <span className="text-3xl font-black text-rose-950 mt-1">
                        {Object.values(selectedSurveyAnswers).filter(val => val === 'Tidak').length} / 26
                      </span>
                    </div>
                  </div>

                  {/* Survey Responses List */}
                  <div className="overflow-hidden border border-slate-150 rounded-2xl">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold">
                          <th className="p-3.5 w-12 text-center">No</th>
                          <th className="p-3.5">Pernyataan Kuisioner</th>
                          <th className="p-3.5 w-40 text-center">Jawaban Murid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                        {[
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
                        ].map((q) => {
                          const ans = selectedSurveyAnswers[q.id];
                          return (
                            <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3 text-center font-bold text-slate-400">{q.id}</td>
                              <td className="p-3 leading-relaxed pr-6">{q.text}</td>
                              <td className="p-3 text-center">
                                {ans === 'Ya' ? (
                                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[10px]">
                                    YA
                                  </span>
                                ) : ans === 'Tidak' ? (
                                  <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 rounded-lg font-bold text-[10px]">
                                    TIDAK
                                  </span>
                                ) : (
                                  <span className="text-slate-350 italic">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Feedback display */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Kritik & Saran Murid:</span>
                    <p className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                      {selectedSurveyFeedback || <span className="text-slate-400 italic">Murid tidak memberikan kritik atau saran tambahan.</span>}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-150 shrink-0">
              <button
                onClick={() => setSelectedSurveyStudent(null)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {activeSubTab === 'test' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="font-display font-bold text-slate-800 text-base">
                Evaluasi Test Akhir (EcoChallenge)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pantau progres pengerjaan test murid atau konfigurasikan kasus dan butir pertanyaan secara dinamis.
              </p>
            </div>

            {/* Test Internal Navigation */}
            <div className="flex bg-slate-100 p-1 rounded-2xl w-fit gap-1 shrink-0">
              <button
                onClick={() => setTestAdminView('submissions')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  testAdminView === 'submissions'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-805'
                }`}
              >
                Daftar Evaluasi Murid
              </button>
              <button
                onClick={() => setTestAdminView('manage_cases')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  testAdminView === 'manage_cases'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-805'
                }`}
              >
                Kelola Kasus Soal
              </button>
            </div>
          </div>

          {testAdminView === 'submissions' ? (
            isLoadingTests ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-455 uppercase font-bold tracking-wider">
                      <th className="py-3.5 px-4 w-1/3">Nama Murid</th>
                      <th className="py-3.5 px-4">Progres Kasus</th>
                      <th className="py-3.5 px-4">Status Pengumpulan</th>
                      <th className="py-3.5 px-4">Nilai</th>
                      <th className="py-3.5 px-4 text-right w-56">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                    {testStudents.map((stud) => (
                      <tr key={stud.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 space-y-0.5">
                          <p className="font-bold text-slate-800 flex items-center gap-1.5 font-display">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {stud.name}
                          </p>
                          <p className="text-[10px] text-slate-455">{stud.email}</p>
                        </td>
                        <td className="py-4 px-4 text-slate-650 font-bold font-display">
                          Kasus {stud.current_step || 1} / {testCases.length || 3}
                        </td>
                        <td className="py-4 px-4">
                          {stud.submitted === 1 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
                              Diserahkan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] uppercase">
                              Draf (Belum Dikirim)
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-700">
                          {stud.grade !== null && stud.grade !== undefined ? (
                            <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-xs">
                              {stud.grade}
                            </span>
                          ) : (
                            <span className="text-slate-450 font-normal italic">Belum dinilai</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setGradingTestStudent(stud);
                                setTempTestGrade(stud.grade !== null && stud.grade !== undefined ? stud.grade.toString() : '');
                              }}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer border border-emerald-100"
                            >
                              <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Nilai</span>
                            </button>
                            <button
                              onClick={() => handleOpenStudentTest(stud)}
                              className="px-3.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer border border-cyan-100"
                            >
                              <Eye className="w-3.5 h-3.5 text-cyan-600" />
                              <span>Lihat Jawaban</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {testStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                          Belum ada data pengerjaan test dari murid.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            // Manage cases view
            <div className="space-y-6 text-left">
              {/* Select Case Category */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(testCases && testCases.length > 0 ? testCases : [
                  { id: 1, title: 'KASUS 1: Dari Botol ke Mikroplastik...' },
                  { id: 2, title: 'KASUS 2: Limbah Deterjen Rumah Tangga' },
                  { id: 3, title: 'KASUS 3: Pestisida Kimia...' }
                ]).map((c, idx) => {
                  const isSelected = selectedCaseId === c.id;
                  const stepNum = idx + 1;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`p-5 rounded-3xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-50/50 border-cyan-400 shadow-sm ring-1 ring-cyan-200/50'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-[10px] font-bold text-cyan-600 uppercase tracking-wider font-sans">Kasus {stepNum}</span>
                      <span className="block text-xs font-bold text-slate-800 truncate mt-1.5 font-display">
                        {c.title || `Belum terkonfigurasi`}
                      </span>
                      <span className="block text-[10px] text-slate-450 mt-1 font-sans">
                        {c.questions?.length || 0} Pertanyaan Analitis
                      </span>
                    </button>
                  );
                })}

                {/* Add New Case Button */}
                <button
                  type="button"
                  onClick={() => {
                    const nextId = testCases.length > 0 
                      ? Math.max(...testCases.map(c => c.id)) + 1 
                      : 1;
                    setSelectedCaseId(nextId);
                    setTempCaseTitle(`KASUS ${nextId}: Kasus Baru`);
                    setTempCaseElements([
                      { type: 'paragraph', value: 'Tulis deskripsi cerita kasus baru di sini.' }
                    ]);
                    setTempCaseQuestions([
                      { id: `q${nextId}_1`, label: '1. Pertanyaan analitis baru pertama' }
                    ]);
                  }}
                  className="p-5 rounded-3xl border border-dashed border-cyan-300 hover:border-cyan-500 bg-cyan-50/10 hover:bg-cyan-50/20 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[90px]"
                >
                  <Plus className="w-5 h-5 text-cyan-600" />
                  <span className="text-xs font-bold text-cyan-600">Tambah Kasus Baru</span>
                </button>
              </div>

              {/* Upload file block */}
              <div className="bg-[#fcfdfd] border border-dashed border-slate-300 rounded-3xl p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
                  {isParsingDocx ? (
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs text-slate-800">Unggah File Word (.docx) Kasus {selectedCaseId}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-lg mx-auto leading-relaxed">
                    Sistem akan membaca isi dokumen, lalu mengonversi elemen teks cerita, gambar ilustrasi, tabel, serta butir soal bernomor otomatis ke test murid.
                  </p>
                </div>
                <div>
                  <label className={`inline-flex items-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95 ${isParsingDocx ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isParsingDocx ? 'Membaca file...' : 'Pilih Berkas (.docx)'}</span>
                    <input
                      type="file"
                      accept=".docx"
                      onChange={handleUploadDocx}
                      className="hidden"
                      disabled={isParsingDocx}
                    />
                  </label>
                </div>
              </div>

              {/* Preview & Editor Form */}
              <div className="space-y-6 border border-slate-200 rounded-3xl p-6 bg-white shadow-sm text-left">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 flex-wrap gap-3">
                  <div>
                    <h4 className="font-display font-bold text-slate-800 text-sm">Editor Konten Kasus {selectedCaseId}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Sesuaikan judul, paragraf, dan butir pertanyaan kasus di bawah ini.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {testCases.some(c => c.id === selectedCaseId) && (
                      <button
                        onClick={() => handleDeleteCase(selectedCaseId)}
                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl font-bold text-xs flex items-center gap-1 border border-red-100 transition-all cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>Hapus Kasus</span>
                      </button>
                    )}
                    <button
                      onClick={handleSaveCaseData}
                      disabled={isSavingCase || isParsingDocx}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      {isSavingCase ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Simpan Perubahan Kasus</span>
                    </button>
                  </div>
                </div>

                {/* Title input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Judul Kasus</label>
                  <input
                    type="text"
                    value={tempCaseTitle}
                    onChange={(e) => setTempCaseTitle(e.target.value)}
                    placeholder="Contoh: KASUS 1: Dari Botol ke Mikroplastik..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-805 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-600 focus:border-cyan-600 font-sans"
                  />
                </div>

                {/* Content elements list */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Elemen Konten</label>
                  
                  {(() => {
                    const renderAdder = (insertIdx: number) => (
                      <div className="group/adder flex flex-col items-center justify-center my-2 relative py-1.5">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px border-t border-dashed border-slate-200 group-hover/adder:border-cyan-300 transition-colors" />
                        
                        <div className="relative z-10 flex items-center gap-1.5 bg-white px-2.5 py-0.5 rounded-full border border-slate-200/60 shadow-sm transition-all group-hover/adder:border-cyan-300 group-hover/adder:shadow-md">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-1">Sisipkan:</span>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const newEls = [...tempCaseElements];
                              newEls.splice(insertIdx, 0, {
                                type: 'paragraph',
                                value: ''
                              });
                              setTempCaseElements(newEls);
                            }}
                            className="px-2 py-0.5 hover:bg-cyan-50 text-slate-650 hover:text-cyan-700 rounded text-[9px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <FileText className="w-2.5 h-2.5 text-cyan-600" />
                            <span>Paragraf</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const newEls = [...tempCaseElements];
                              newEls.splice(insertIdx, 0, {
                                type: 'image',
                                value: '',
                                caption: ''
                              });
                              setTempCaseElements(newEls);
                            }}
                            className="px-2 py-0.5 hover:bg-emerald-50 text-slate-650 hover:text-emerald-700 rounded text-[9px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Image className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Gambar</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const newEls = [...tempCaseElements];
                              newEls.splice(insertIdx, 0, {
                                type: 'table',
                                value: {
                                  headers: ['Kolom 1', 'Kolom 2'],
                                  rows: [['Baris 1 Sel 1', 'Baris 1 Sel 2']]
                                },
                                caption: ''
                              });
                              setTempCaseElements(newEls);
                            }}
                            className="px-2 py-0.5 hover:bg-amber-50 text-slate-650 hover:text-amber-700 rounded text-[9px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Table className="w-2.5 h-2.5 text-amber-600" />
                            <span>Tabel</span>
                          </button>
                        </div>
                      </div>
                    );

                    return tempCaseElements.length === 0 ? (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-400 italic bg-slate-50/50 p-6 rounded-2xl text-center border border-slate-100">
                          Belum ada konten untuk kasus ini. Silakan unggah file .docx di atas atau tambah elemen baru di bawah.
                        </p>
                        {renderAdder(0)}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {renderAdder(0)}
                        {tempCaseElements.map((el, elIdx) => (
                          <React.Fragment key={elIdx}>
                            <div className="border border-slate-200/60 rounded-2xl p-4 space-y-2 relative group bg-[#fdfdfd] hover:border-slate-350 transition-all">
                              <div className="flex justify-between items-center">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-650 uppercase tracking-wider font-sans">
                                  {el.type === 'paragraph' ? 'Teks Paragraf' : el.type === 'image' ? 'Gambar Ilustrasi' : 'Tabel Data'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newEls = tempCaseElements.filter((_, idx) => idx !== elIdx);
                                    setTempCaseElements(newEls);
                                  }}
                                  className="text-red-500 hover:text-red-750 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs cursor-pointer flex items-center gap-0.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </div>

                              {el.type === 'paragraph' && (
                                <textarea
                                  value={el.value}
                                  onChange={(e) => {
                                    const newEls = [...tempCaseElements];
                                    newEls[elIdx].value = e.target.value;
                                    setTempCaseElements(newEls);
                                  }}
                                  rows={4}
                                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 font-medium font-sans focus:outline-none focus:ring-1 focus:ring-cyan-600 focus:border-cyan-600 leading-relaxed"
                                />
                              )}

                              {el.type === 'image' && (
                                <div className="flex flex-col items-center p-4 border border-slate-100 rounded-xl bg-slate-50/70 gap-2.5">
                                  {(el.value || (el.values && el.values.length > 0)) ? (
                                    <div className="flex flex-row flex-wrap items-center justify-center gap-2">
                                      {(el.values && Array.isArray(el.values) ? el.values : [el.value]).map((imgSrc: string, imgIdx: number) => (
                                        <img key={imgIdx} src={imgSrc} className="max-h-[160px] object-contain rounded-xl border border-slate-200 shadow-sm" alt="Preview" />
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="w-full py-6 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-white text-slate-400 gap-1.5">
                                      <Image className="w-8 h-8 text-slate-350" />
                                      <span className="text-[11px] font-bold text-slate-500">Belum ada gambar terpilih</span>
                                    </div>
                                  )}
                                  
                                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 text-left">
                                    <div className="space-y-1">
                                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Tautan URL Gambar</label>
                                      <input
                                        type="text"
                                        value={el.value || ''}
                                        onChange={(e) => {
                                          const newEls = [...tempCaseElements];
                                          newEls[elIdx].value = e.target.value;
                                          delete newEls[elIdx].values;
                                          setTempCaseElements(newEls);
                                        }}
                                        placeholder="https://example.com/image.png"
                                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Unggah File Gambar</label>
                                      <label className="w-full px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Pilih Gambar</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            
                                            const formData = new FormData();
                                            formData.append('image', file);
                                            formData.append('type', 'test');
                                            
                                            try {
                                              const res = await fetch('/api/upload-image.php', {
                                                method: 'POST',
                                                body: formData
                                              });
                                              const data = await res.json();
                                              if (data.success && data.url) {
                                                const newEls = [...tempCaseElements];
                                                newEls[elIdx].value = data.url;
                                                delete newEls[elIdx].values;
                                                setTempCaseElements(newEls);
                                              } else {
                                                alert(data.message || 'Gagal mengunggah gambar.');
                                              }
                                            } catch (err) {
                                              alert('Gagal mengunggah gambar.');
                                            }
                                          }}
                                        />
                                      </label>
                                    </div>
                                  </div>

                                  <input
                                    type="text"
                                    value={el.caption || ''}
                                    onChange={(e) => {
                                      const newEls = [...tempCaseElements];
                                      newEls[elIdx].caption = e.target.value;
                                      setTempCaseElements(newEls);
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-650 text-center mt-1"
                                    placeholder="Label / Keterangan Gambar (Contoh: Gambar 1. Deskripsi)..."
                                  />
                                </div>
                              )}

                              {el.type === 'table' && (
                                <div className="space-y-3 p-4 border border-slate-100 rounded-xl bg-slate-50/70">
                                  <input
                                    type="text"
                                    value={el.caption || ''}
                                    onChange={(e) => {
                                      const newEls = [...tempCaseElements];
                                      newEls[elIdx].caption = e.target.value;
                                      setTempCaseElements(newEls);
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-650"
                                    placeholder="Label / Keterangan Tabel (Contoh: Tabel 1. Deskripsi)..."
                                  />
                                  
                                  <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-left">
                                    <div className="space-y-1">
                                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Header Tabel (Pisahkan dengan koma)</label>
                                      <input
                                        type="text"
                                        value={(el.value.headers || []).join(', ')}
                                        onChange={(e) => {
                                          const newHeaders = e.target.value.split(',').map(s => s.trim());
                                          const newEls = [...tempCaseElements];
                                          const newRows = (newEls[elIdx].value.rows || []).map((row: string[]) => {
                                            const r = [...row];
                                            if (r.length < newHeaders.length) {
                                              while (r.length < newHeaders.length) r.push('');
                                            } else if (r.length > newHeaders.length) {
                                              r.length = newHeaders.length;
                                            }
                                            return r;
                                          });
                                          newEls[elIdx].value = {
                                            headers: newHeaders,
                                            rows: newRows
                                          };
                                          setTempCaseElements(newEls);
                                        }}
                                        className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                                      />
                                    </div>

                                    <div className="space-y-1.5 mt-2">
                                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Baris Data</label>
                                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                        {(el.value.rows || []).map((row: string[], rIdx: number) => (
                                          <div key={rIdx} className="flex items-center gap-1.5">
                                            {row.map((cellVal: string, cIdx: number) => (
                                              <input
                                                key={cIdx}
                                                type="text"
                                                value={cellVal}
                                                onChange={(e) => {
                                                  const newEls = [...tempCaseElements];
                                                  newEls[elIdx].value.rows[rIdx][cIdx] = e.target.value;
                                                  setTempCaseElements(newEls);
                                                }}
                                                className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-650"
                                                placeholder={`Baris ${rIdx + 1} Kolom ${cIdx + 1}`}
                                              />
                                            ))}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const newEls = [...tempCaseElements];
                                                newEls[elIdx].value.rows = newEls[elIdx].value.rows.filter((_: any, idx: number) => idx !== rIdx);
                                                setTempCaseElements(newEls);
                                              }}
                                              className="text-red-500 hover:text-red-750 p-1 hover:bg-red-50 rounded-md cursor-pointer shrink-0"
                                              title="Hapus baris"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex gap-2 pt-2 mt-2 border-t border-slate-100">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newEls = [...tempCaseElements];
                                          const headersCount = (newEls[elIdx].value.headers || []).length || 2;
                                          const newRow = Array(headersCount).fill('');
                                          newEls[elIdx].value.rows = [...(newEls[elIdx].value.rows || []), newRow];
                                          setTempCaseElements(newEls);
                                        }}
                                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Tambah Baris</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            {renderAdder(elIdx + 1)}
                          </React.Fragment>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Questions List */}
                <div className="space-y-4 pt-5 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Butir Soal Evaluasi</label>
                  
                  <div className="space-y-3">
                    {tempCaseQuestions.map((q, qIdx) => (
                      <div key={q.id || qIdx} className="space-y-2 bg-slate-50/50 border border-slate-200 p-4 rounded-2xl relative group">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-cyan-700 tracking-wide uppercase">PERTANYAAN {q.id.toUpperCase()}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newQs = tempCaseQuestions.filter((_, idx) => idx !== qIdx);
                              setTempCaseQuestions(newQs);
                            }}
                            className="text-[10px] text-red-500 hover:text-red-700 font-bold cursor-pointer flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                        <textarea
                          value={q.label}
                          onChange={(e) => {
                            const newQs = [...tempCaseQuestions];
                            newQs[qIdx].label = e.target.value;
                            setTempCaseQuestions(newQs);
                          }}
                          rows={2}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-600 focus:border-cyan-600 leading-relaxed font-sans"
                        />
                        {/* Choice of Answer Type */}
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 pt-1 text-left">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Format Jawaban Murid:</span>
                          
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`answer_type_${qIdx}`}
                              checked={!q.question_table}
                              onChange={() => {
                                const newQs = [...tempCaseQuestions];
                                const updatedQ = { ...newQs[qIdx] };
                                delete updatedQ.question_table;
                                newQs[qIdx] = updatedQ;
                                setTempCaseQuestions(newQs);
                              }}
                              className="text-cyan-600 focus:ring-cyan-500 w-3 h-3"
                            />
                            <span>Teks Paragraf</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`answer_type_${qIdx}`}
                              checked={!!q.question_table}
                              onChange={() => {
                                if (!q.question_table) {
                                  // Initialize with default table structure
                                  const headers = ['No', 'Solusi Alternatif', 'Prinsip Green Chemistry', 'Penjelasan'];
                                  const rows = [
                                    ['1.', '', '', ''],
                                    ['2.', '', '', '']
                                  ];
                                  const newQs = [...tempCaseQuestions];
                                  newQs[qIdx] = {
                                    ...newQs[qIdx],
                                    question_table: {
                                      headers,
                                      rows
                                    }
                                  };
                                  setTempCaseQuestions(newQs);
                                }
                              }}
                              className="text-cyan-600 focus:ring-cyan-500 w-3 h-3"
                            />
                            <span>Tabel Terstruktur</span>
                          </label>
                        </div>

                        {editingTableQIdx === qIdx && (
                          <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-3.5 space-y-3 mt-2 text-left animate-in slide-in-from-top-1 duration-200">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                              <span className="text-[10px] font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1">
                                <Table className="w-3.5 h-3.5 text-cyan-650" />
                                Pengaturan Tabel Jawaban Soal
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditingTableQIdx(null)}
                                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                              >
                                Batal
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Nama-Nama Kolom (Pisah dengan koma)</label>
                                <input
                                  type="text"
                                  value={tableSetupHeaders}
                                  onChange={(e) => setTableSetupHeaders(e.target.value)}
                                  placeholder="No, Solusi, Prinsip, Penjelasan"
                                  className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Baris Jawaban</label>
                                <input
                                  type="number"
                                  min={1}
                                  max={12}
                                  value={tableSetupRows}
                                  onChange={(e) => setTableSetupRows(parseInt(e.target.value) || 1)}
                                  className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:ring-1 focus:ring-cyan-600 focus:outline-none"
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingTableQIdx(null)}
                                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-250 text-slate-650 rounded-lg font-bold text-[10px] cursor-pointer"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!tableSetupHeaders.trim()) {
                                    alert('Masukkan minimal satu kolom!');
                                    return;
                                  }
                                  const headers = tableSetupHeaders.split(',').map(h => h.trim()).filter(Boolean);
                                  const rows = Array.from({ length: tableSetupRows }, (_, rIdx) => {
                                    return headers.map((h, cIdx) => {
                                      if (cIdx === 0 && (h.toLowerCase() === 'no' || h.toLowerCase() === 'no.')) {
                                        return `${rIdx + 1}.`;
                                      }
                                      return '';
                                    });
                                  });
                                  
                                  const newQs = [...tempCaseQuestions];
                                  newQs[qIdx] = {
                                    ...newQs[qIdx],
                                    question_table: {
                                      headers,
                                      rows
                                    }
                                  };
                                  setTempCaseQuestions(newQs);
                                  setEditingTableQIdx(null);
                                }}
                                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-[10px] cursor-pointer shadow-sm"
                              >
                                Terapkan Tabel Jawaban
                              </button>
                            </div>
                          </div>
                        )}

                        {q.question_table && (
                          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm mt-2 text-left">
                            <div className="bg-slate-50 border-b border-slate-100 px-3 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                              <span>Format Kolom Jawaban Tabel</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTableQIdx(qIdx);
                                    setTableSetupHeaders(q.question_table.headers.join(', '));
                                    setTableSetupRows(q.question_table.rows.length);
                                  }}
                                  className="text-cyan-600 hover:text-cyan-800 font-bold cursor-pointer text-[9px]"
                                >
                                  Edit Tabel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newQs = [...tempCaseQuestions];
                                    const updatedQ = { ...newQs[qIdx] };
                                    delete updatedQ.question_table;
                                    newQs[qIdx] = updatedQ;
                                    setTempCaseQuestions(newQs);
                                  }}
                                  className="text-red-500 hover:text-red-750 font-bold cursor-pointer text-[9px]"
                                >
                                  Hapus Tabel
                                </button>
                              </div>
                            </div>
                            <table className="w-full text-[10px] text-left border-collapse">
                              <thead className="bg-slate-50 text-slate-600 font-bold">
                                <tr>
                                  {q.question_table.headers && q.question_table.headers.map((h: string, hIdx: number) => (
                                    <th key={hIdx} className="p-2 border-r border-slate-100">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {q.question_table.rows && q.question_table.rows.map((row: string[], rIdx: number) => (
                                  <tr key={rIdx} className="border-b border-slate-100">
                                    {row.map((val: string, cIdx: number) => (
                                      <td key={cIdx} className="p-2 border-r border-slate-100 font-sans text-slate-550 font-medium">{val || <span className="text-slate-350 italic">Kolom Input</span>}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {tempCaseQuestions.length === 0 && (
                      <p className="text-xs text-slate-400 italic bg-slate-50/50 p-4 rounded-xl text-center border border-slate-100">Belum ada pertanyaan untuk kasus ini.</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nextIdNum = tempCaseQuestions.length > 0 
                        ? Math.max(...tempCaseQuestions.map(q => {
                            const match = q.id.match(/\d+/);
                            return match ? parseInt(match[0]) : 0;
                          })) + 1 
                        : 1;
                      const newQ = { id: `q${nextIdNum}`, label: `${nextIdNum}. Tulis pertanyaan analitis baru di sini.` };
                      setTempCaseQuestions([...tempCaseQuestions, newQ]);
                    }}
                    className="px-4 py-2.5 border border-dashed border-cyan-300 hover:border-cyan-500 text-cyan-600 hover:text-cyan-700 bg-cyan-50/20 hover:bg-cyan-50/40 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors w-full"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Soal Pertanyaan</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
      {selectedTestStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="font-display font-bold text-sm">
                    Detail Test Murid
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Murid: <strong>{selectedTestStudent.name}</strong> ({selectedTestStudent.email}) | Progres: Kasus {selectedTestStep}/{testCases.length || 3} | Status: {selectedTestSubmitted ? 'DISERAHKAN' : 'DRAF'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTestStudent(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-8 text-left">
              {isLoadingTestDetails ? (
                <div className="flex flex-col items-center justify-center h-full py-12 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                  <span className="text-xs text-gray-500 font-bold">Memuat jawaban test...</span>
                </div>
              ) : (
                <div className="space-y-8">
                  {(testCases && testCases.length > 0 ? testCases : [
                    {
                      id: 1,
                      title: "KASUS 1: Dari Botol ke Mikroplastik yang Kembali ke Meja Makan Kita",
                      questions: [
                        { id: "q1", label: "1. Berdasarkan kasus diatas di jelaskan jika plastik menyumbang 17% sampah di Indonesia. Jelaskan mengapa plastik sekali pakai dapat menyebabkan pencemaran lingkungan yang berkepanjangan!" },
                        { id: "q2", label: "2. Identifikasilah faktor-faktor utama yang menyebabkan meningkatnya pencemaran plastik sekali pakai di lingkungan sekolah dan perkotaan." },
                        { id: "q3", label: "3. Analisislah dampak keberadaan mikroplastik terhadap organisme hidup dengan meninjau aspek kimia dan ekologi." },
                        { id: "q4", label: "4. Rancanglah solusi alternatif untuk mengurangi penggunaan plastik sekali pakai di lingkungan sekolah dengan menerapkan minimal dua prinsip green chemistry!" }
                      ]
                    },
                    {
                      id: 2,
                      title: "KASUS 2: Limbah Deterjen Rumah Tangga",
                      questions: [
                        { id: "q5", label: "5. Berdasarkan data kualitas air dan penjelasan tentang surfaktan dalam kasus, jelaskan bagaimana sifat kimia surfaktan dapat memengaruhi kualitas air sungai!" },
                        { id: "q6", label: "6. Perhatikan data kadar fosfat dan kondisi air pada kasus. Jelaskan hubungan antara peningkatan kadar fosfat dengan terjadinya eutrofikasi di perairan!" },
                        { id: "q7", label: "7. Berdasarkan narasi kasus, identifikasi: a. Sumber utama pencemaran air, b. Zat kimia yang berperan dalam pencemaran. Jelaskan alasan Anda!" },
                        { id: "q8", label: "8. Jelaskan salah satu solusi adalah penggunaan deterjen ramah lingkungan. Evaluasilah solusi tersebut berdasarkan prinsip green chemistry!" }
                      ]
                    },
                    {
                      id: 3,
                      title: "KASUS 3: Pestisida Kimia: Panen Melimpah atau Lingkungan Terancam?",
                      questions: [
                        { id: "q9", label: "9. Berdasarkan data pada kasus, residu pestisida pada sayuran melebihi batas aman. Jelaskan bagaimana sifat kimia pestisida sintetis dapat menyebabkan dampak tersebut terhadap lingkungan dan organisme hidup!" },
                        { id: "q10", label: "10. Petani masih bergantung pada pestisida kimia. Rancang satu solusi berbasis prinsip green chemistry yang dapat digunakan sebagai alternatif pestisida kimia!" },
                        { id: "q11", label: "11. Pestisida yang bersifat lipofilik dapat masuk ke rantai makanan dan mengalami peningkatan konsentrasi. Analisis bagaimana proses ini terjadi dari lingkungan hingga ke manusia!" }
                      ]
                    }
                  ]).map((c, idx) => {
                    const stepNum = c.step || c.id || (idx + 1);
                    return (
                      <div key={stepNum} className="bg-slate-50 border border-slate-250/70 p-5 rounded-2xl space-y-4">
                        <div className="border-b border-slate-200 pb-2">
                          <span className="text-[10px] font-bold text-cyan-700 tracking-wider uppercase">KASUS {stepNum}</span>
                          <h5 className="font-display font-bold text-slate-800 text-sm">{c.title}</h5>
                        </div>
                        <div className="space-y-4">
                          {c.questions && c.questions.map((q: any) => {
                            const ans = selectedTestAnswers[q.id];
                            
                            // Try parsing tabular answer
                            let parsedTable: string[][] | null = null;
                            if (ans && ans.startsWith('[') && ans.endsWith(']')) {
                              try {
                                const parsed = JSON.parse(ans);
                                if (Array.isArray(parsed) && parsed.every(row => Array.isArray(row))) {
                                  parsedTable = parsed;
                                }
                              } catch (e) {}
                            }

                            return (
                              <div key={q.id} className="space-y-1.5 text-left">
                                <span className="block text-xs font-bold text-slate-650 whitespace-pre-wrap">{q.label}</span>
                                {parsedTable ? (
                                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm mt-1">
                                    <table className="w-full text-xs text-left border-collapse">
                                      <thead>
                                        <tr className="bg-slate-900 text-white font-bold">
                                          {q.question_table?.headers?.map((h: string, hIdx: number) => (
                                            <th key={hIdx} className="p-3 border-r border-slate-700">{h}</th>
                                          )) || (parsedTable[0] ? parsedTable[0].map((_, idx) => <th key={idx} className="p-3 border-r border-slate-700">Kolom {idx+1}</th>) : null)}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {parsedTable.map((row, rIdx) => (
                                          <tr key={rIdx} className="border-b border-slate-100 hover:bg-slate-50/50">
                                            {row.map((cellVal, cIdx) => (
                                              <td key={cIdx} className="p-3 border-r border-slate-100 font-sans text-slate-850 font-semibold leading-relaxed">
                                                {cellVal || <span className="text-slate-350 italic">Kosong</span>}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 min-h-[4rem] text-xs font-sans text-slate-800 leading-relaxed whitespace-pre-wrap">
                                    {ans ? ans : <span className="text-slate-400 italic">Belum dijawab.</span>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-150 shrink-0">
              <button
                onClick={() => setSelectedTestStudent(null)}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-850 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Test Grading Modal */}
      {gradingTestStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <h4 className="font-display font-black text-slate-800 text-base mb-2">
              Beri Nilai Evaluasi - {gradingTestStudent.name}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan nilai untuk evaluasi akhir (EcoChallenge) murid.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nilai (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-800"
                  placeholder="Masukkan nilai..."
                  value={tempTestGrade}
                  onChange={(e) => setTempTestGrade(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setGradingTestStudent(null)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmittingTestGrade}
                onClick={handleSaveTestGrade}
                className="flex-1 py-2.5 bg-cyan-650 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmittingTestGrade ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Simpan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
