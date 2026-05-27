import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  MessageSquare, 
  Send, 
  Award, 
  ClipboardCheck,
  RotateCcw,
  Edit,
  Trash2,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { commentService, CommentItem } from '@/services/commentService';
import { useAuth } from '../context/AuthContext';

interface EcoChallengeViewProps {}

// Static evaluation data
const teacherEvaluation = {
  text: 'Secara keseluruhan, hasil posttest menunjukkan pemahaman yang baik terhadap materi ekoenzim dan kimia hijau. Pastikan untuk memperdalam pemahaman tentang rasio fermentasi dan penggunaan ekoenzim dalam konteks yang lebih luas. Terus semangat dalam bereksperimen!',
  teacher: 'Pak Ahmad Rifa\'i, S.Pd.',
  date: '20 Mei 2026',
};

const POSTTEST_LINK: string = 'https://docs.google.com/forms/d/e/1FAIpQLSf6uF2yKz8Z1gD2Wv5B_QzM79U7z_4eR6s7t8_2wY_9cWqG-Q/viewform?usp=sf_link'; // Placeholder Google Form link

export default function EcoChallengeView({}: EcoChallengeViewProps) {
  const { user } = useAuth();
  
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittedPosttest, setSubmittedPosttest] = useState(false);

  // Inline editing states
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Load comments on mount
  useEffect(() => {
    const loadComments = async () => {
      try {
        setIsLoadingComments(true);
        const data = await commentService.getComments();
        setComments(data);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setIsLoadingComments(false);
      }
    };
    loadComments();
  }, []);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const savedComment = await commentService.addComment(newComment.trim());
      setComments(prev => [...prev, savedComment]);
      setNewComment('');
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim komentar.');
    }
  };

  const handleStartEdit = (comment: CommentItem) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editingCommentText.trim()) return;

    try {
      setIsSavingEdit(true);
      await commentService.editComment(commentId, editingCommentText.trim());
      
      // Update state locally
      setComments(prev => 
        prev.map(c => c.id === commentId ? { ...c, content: editingCommentText.trim() } : c)
      );
      
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch (err: any) {
      alert(err.message || 'Gagal mengedit komentar.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus komentar ini secara permanen?')) {
      return;
    }

    try {
      await commentService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus komentar.');
    }
  };

  const handleOpenPosttest = () => {
    setSubmittedPosttest(true);
    if (POSTTEST_LINK && POSTTEST_LINK !== '#') {
      window.open(POSTTEST_LINK, '_blank');
    } else {
      alert('Link posttest belum tersedia. Silakan tunggu informasi dari guru.');
    }
  };

  const formatCommentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr.replace(/-/g, '/'));
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
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
            Evaluasi Akhir EcoChallenge
          </h2>
          <p className="font-sans text-xs md:text-sm text-[#42493e] leading-relaxed">
            Kerjakan posttest melalui link Google Form yang disediakan guru, lalu lihat hasil evaluasi dan diskusikan di kolom komentar di bawah.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-8 text-left">
        
        {/* Left: Posttest Link + Evaluation */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          {/* Posttest Button Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-[#154212] rounded-xl">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#154212]">Posttest Evaluasi</h3>
                <p className="text-xs text-gray-500">Klik tombol di bawah untuk membuka form posttest</p>
              </div>
            </div>

            {!submittedPosttest ? (
              <button
                id="btn-open-posttest"
                onClick={handleOpenPosttest}
                className="w-full bg-[#154212] hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Posttest (Google Form)</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-[#006e1c] shrink-0" />
                  <span>Posttest sudah dibuka. Selesaikan form di tab baru dan kembali ke sini untuk melihat evaluasi.</span>
                </div>
                <button
                  onClick={handleOpenPosttest}
                  className="text-xs font-bold text-[#154212] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Buka ulang posttest
                </button>
              </div>
            )}
          </div>

          {/* Teacher Evaluation Section */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#154212]">Evaluasi dari Guru</h3>
                <p className="text-xs text-gray-400">{teacherEvaluation.teacher} · {teacherEvaluation.date}</p>
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5">
              <p className="text-sm text-gray-700 leading-relaxed italic">
                "{teacherEvaluation.text}"
              </p>
            </div>
          </div>

          {/* Student Comment Section */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-[#154212] border-b border-gray-100 pb-3">
              Diskusi & Tanggapan Siswa
            </h3>

            {/* Comment form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis tanggapan atau pertanyaan Anda..."
                className="flex-1 bg-[#f3f3f4] border border-gray-200 text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#154212] placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="p-2.5 bg-[#154212] hover:bg-emerald-800 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
                title="Kirim Komentar"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Comment list */}
            <div className="space-y-3">
              {isLoadingComments ? (
                <div className="py-8 flex justify-center items-center gap-2 text-gray-400 text-xs font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin text-[#006e1c]" />
                  Memuat diskusi...
                </div>
              ) : comments.length > 0 ? (
                comments.map((c) => {
                  const isOwner = user && c.student_id === user.id;
                  const isEditingThis = editingCommentId === c.id;

                  return (
                    <div key={c.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 animate-in fade-in duration-200 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#154212]">{c.author}</span>
                          {isOwner && (
                            <span className="bg-emerald-100 text-[#006e1c] text-[8px] font-bold px-1.5 py-0.5 rounded">Anda</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-gray-400">{formatCommentDate(c.created_at)}</span>
                          
                          {/* Owner Edit/Delete Controls */}
                          {isOwner && !isEditingThis && (
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => handleStartEdit(c)}
                                className="text-gray-400 hover:text-[#006e1c] p-0.5 rounded transition-colors"
                                title="Edit Komentar"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteComment(c.id)}
                                className="text-gray-400 hover:text-red-600 p-0.5 rounded transition-colors"
                                title="Hapus Komentar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {isEditingThis ? (
                        /* Edit Input UI */
                        <div className="flex gap-2 items-center mt-1">
                          <input 
                            type="text"
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            className="flex-1 bg-white border border-gray-300 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#154212]"
                          />
                          <button 
                            onClick={() => handleSaveEdit(c.id)}
                            disabled={isSavingEdit || !editingCommentText.trim()}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer disabled:opacity-50 flex items-center justify-center"
                            title="Simpan"
                          >
                            {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            disabled={isSavingEdit}
                            className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg cursor-pointer flex items-center justify-center"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        /* Normal Content UI */
                        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-gray-400 text-xs font-semibold">
                  Belum ada komentar. Jadilah yang pertama berdiskusi!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Info sidebar */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-[#154212] text-white p-6 rounded-3xl shadow-lg space-y-4">
            <h4 className="font-display font-bold text-sm">Cara Mengerjakan Posttest</h4>
            <ol className="space-y-3">
              {[
                'Klik tombol "Buka Posttest" untuk membuka Google Form',
                'Isi seluruh pertanyaan dengan jujur dan teliti',
                'Klik Submit setelah selesai mengerjakan',
                'Kembali ke halaman ini untuk melihat evaluasi guru',
                'Berikan tanggapan atau pertanyaan di kolom diskusi',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 items-start text-xs text-[#bcf0ae]">
                  <span className="w-5 h-5 rounded-full bg-[#91f78e]/20 text-[#91f78e] font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h4 className="font-display font-bold text-xs text-[#154212] uppercase tracking-wider">
              Catatan Belajar
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Gunakan kolom komentar untuk mendiskusikan hasil posttest Anda dan menanyakan bagian materi yang belum dipahami langsung kepada guru.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
