import React, { useEffect, useState } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  X,
  Loader2,
  RefreshCw,
  Award
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: number;
  points: number;
}

export default function TeacherQuizView() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states for creating/editing
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [pointsVal, setPointsVal] = useState<number>(20);
  const [formLoading, setFormLoading] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/teacher/quiz.php`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions || []);
      } else {
        setError(data.message || 'Gagal memuat kumpulan soal kuis.');
      }
    } catch (err) {
      setError('Koneksi gagal. Pastikan database MySQL aktif di server XAMPP Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setQuestionText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectAnswer(0);
    setPointsVal(20);
    setShowFormModal(true);
  };

  const openEditModal = (q: QuizQuestion) => {
    setEditingId(q.id);
    setQuestionText(q.question);
    setOptA(q.option_a);
    setOptB(q.option_b);
    setOptC(q.option_c);
    setOptD(q.option_d);
    setCorrectAnswer(q.correct_answer);
    setPointsVal(q.points);
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText || !optA || !optB || !optC || !optD) {
      alert('Harap isi semua pertanyaan dan keempat opsi pilihan.');
      return;
    }

    setFormLoading(true);
    const payload = {
      id: editingId,
      question: questionText,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_answer: correctAnswer,
      points: pointsVal
    };

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const url = `${API_BASE}/teacher/quiz.php`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(editingId ? 'Soal kuis berhasil diperbarui.' : 'Soal kuis baru berhasil ditambahkan.');
        fetchQuestions();
        setShowFormModal(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        alert(data.message || 'Gagal menyimpan soal.');
      }
    } catch (err) {
      alert('Koneksi gagal saat mengirim data soal kuis.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal kuis ini secara permanen?')) {
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/teacher/quiz.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ id }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Soal kuis berhasil dihapus.');
        fetchQuestions();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Gagal menghapus soal.');
      }
    } catch (err) {
      setError('Koneksi gagal saat menghapus data.');
    }
  };

  const letterOptions = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center text-left">
        <div>
          <h2 className="font-display font-black text-2xl text-[#154212]">Manajemen Kuis EcoChallenge</h2>
          <p className="text-xs text-gray-500">Kelola soal tantangan mingguan siswa. Tambah pertanyaan seputar kimia sirkular, uji organoleptik, dan ekoenzim.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#154212] hover:bg-[#276e23] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#154212]/10 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Soal</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold text-left">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-semibold text-left">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-24 flex flex-col justify-center items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
          <span className="text-xs text-gray-400 font-bold">Sedang mengambil kumpulan soal kuis...</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 font-semibold border-2 border-dashed border-gray-250 rounded-3xl bg-white">
          Belum ada soal kuis terdaftar. Klik "Tambah Soal" untuk membuat soal perdana kelas Anda.
        </div>
      ) : (
        <div className="space-y-6 text-left">
          {questions.map((q, index) => {
            const options = [q.option_a, q.option_b, q.option_c, q.option_d];
            return (
              <div key={q.id} className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                {/* Points tag */}
                <div className="absolute top-0 right-0 bg-emerald-50 border-b border-l border-emerald-100 text-emerald-800 font-mono font-bold text-[10px] px-3.5 py-1.5 rounded-bl-2xl flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>+{q.points} Poin</span>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                      Pertanyaan {index + 1}
                    </span>
                    <h4 className="font-semibold text-sm text-[#1c1d1d] mb-4 pr-16 leading-relaxed">
                      {q.question}
                    </h4>

                    {/* Options list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {options.map((opt, oIdx) => {
                        const isCorrect = q.correct_answer === oIdx;
                        return (
                          <div 
                            key={oIdx}
                            className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${
                              isCorrect 
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold' 
                                : 'bg-gray-50 border-gray-200 text-gray-650'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                              isCorrect 
                                ? 'bg-emerald-600 text-white shadow-sm' 
                                : 'bg-white border border-gray-250 text-gray-500'
                            }`}>
                              {letterOptions[oIdx]}
                            </span>
                            <span className="truncate">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Edit / Delete action bar */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end gap-2">
                  <button 
                    onClick={() => openEditModal(q)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-[10px] font-semibold text-gray-600 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ubah</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-red-200 hover:bg-red-50 rounded-xl text-[10px] font-semibold text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Question Modal Overlay */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            
            <div className="bg-[#154212] p-5 text-white flex justify-between items-center">
              <h4 className="font-display font-bold text-sm">
                {editingId ? 'Ubah Soal Kuis EcoChallenge' : 'Tambah Soal Kuis Baru'}
              </h4>
              <button onClick={() => setShowFormModal(false)} className="text-white hover:text-red-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Question Text */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Pertanyaan / Soal</label>
                <textarea 
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl px-4 py-2.5 focus:outline-none transition-all h-20 resize-none" 
                  placeholder="Contoh: Manakah yang termasuk rasio adisi pembuatan lilin aromaterapi ekoenzim?"
                  required
                />
              </div>

              {/* Options Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option A */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Opsi Pilihan A</label>
                  <input 
                    type="text" 
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl px-4 py-2.5 focus:outline-none transition-all" 
                    placeholder="Tulis pilihan A..."
                    required
                  />
                </div>

                {/* Option B */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Opsi Pilihan B</label>
                  <input 
                    type="text" 
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl px-4 py-2.5 focus:outline-none transition-all" 
                    placeholder="Tulis pilihan B..."
                    required
                  />
                </div>

                {/* Option C */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Opsi Pilihan C</label>
                  <input 
                    type="text" 
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl px-4 py-2.5 focus:outline-none transition-all" 
                    placeholder="Tulis pilihan C..."
                    required
                  />
                </div>

                {/* Option D */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Opsi Pilihan D</label>
                  <input 
                    type="text" 
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl px-4 py-2.5 focus:outline-none transition-all" 
                    placeholder="Tulis pilihan D..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Correct Answer index */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Pilihan Jawaban Benar</label>
                  <select 
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-all cursor-pointer font-bold"
                  >
                    <option value={0}>Opsi Pilihan A</option>
                    <option value={1}>Opsi Pilihan B</option>
                    <option value={2}>Opsi Pilihan C</option>
                    <option value={3}>Opsi Pilihan D</option>
                  </select>
                </div>

                {/* Points */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#42493e] uppercase tracking-wider">Nilai Poin EcoChallenge</label>
                  <input 
                    type="number" 
                    value={pointsVal}
                    onChange={(e) => setPointsVal(parseInt(e.target.value) || 20)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#154212] focus:bg-white text-xs rounded-xl px-4 py-2.5 focus:outline-none transition-all" 
                    min={5}
                    max={100}
                    required
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-150">
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="px-4 py-2 bg-[#154212] hover:bg-[#276e23] text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan Soal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
