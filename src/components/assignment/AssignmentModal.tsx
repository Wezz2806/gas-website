import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  Download, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  User, 
  ShieldCheck, 
  Award, 
  Loader2, 
  Check, 
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Assignment, AssignmentComment, AssignmentSubmission } from '../../types';
import { assignmentService, AssignmentDetailResponse } from '../../services/assignmentService';
import { useAuth } from '../../context/AuthContext';
import AssignmentFormModal from './AssignmentFormModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const BACKEND_URL = API_BASE.replace(/\/api$/, '') || '';

interface AssignmentModalProps {
  assignmentId: number;
  roomName: string;
  onClose: () => void;
  onAssignmentDeleted?: () => void;
  onAssignmentUpdated?: () => void;
}

export default function AssignmentModal({
  assignmentId,
  roomName,
  onClose,
  onAssignmentDeleted,
  onAssignmentUpdated
}: AssignmentModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AssignmentDetailResponse | null>(null);

  // Discussion state
  const [comments, setComments] = useState<AssignmentComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Student submission state
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isUnsubmitting, setIsUnsubmitting] = useState(false);

  // Admin grading state
  const [gradingScores, setGradingScores] = useState<Record<number, string>>({});
  const [gradingFeedbacks, setGradingFeedbacks] = useState<Record<number, string>>({});
  const [savingGradeId, setSavingGradeId] = useState<number | null>(null);
  const [adminTabFilter, setAdminTabFilter] = useState<'all' | 'submitted' | 'unsubmitted' | 'graded'>('all');

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await assignmentService.getAssignmentDetail(assignmentId);
      setDetail(res);
      setComments(res.comments || []);

      // Inisialisasi state penilaian untuk admin
      if (res.submissions) {
        const scores: Record<number, string> = {};
        const feedbacks: Record<number, string> = {};
        res.submissions.forEach((s) => {
          scores[s.id] = s.grade !== null && s.grade !== undefined ? String(s.grade) : '';
          feedbacks[s.id] = s.feedback || '';
        });
        setGradingScores(scores);
        setGradingFeedbacks(feedbacks);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat tugas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [assignmentId]);

  // Handle Comment Submit
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const added = await assignmentService.addComment(assignmentId, newComment.trim());
      setComments((prev) => [...prev, added]);
      setNewComment('');
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim komentar');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Hapus komentar ini?')) return;
    try {
      await assignmentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus komentar');
    }
  };

  // Handle Student Submit
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionFile || isSubmittingTask) return;

    try {
      setIsSubmittingTask(true);
      await assignmentService.submitAssignment(assignmentId, submissionFile, submissionNotes);
      setSubmissionFile(null);
      setSubmissionNotes('');
      await loadDetail();
      alert('Tugas Anda berhasil diserahkan!');
    } catch (err: any) {
      alert(err.message || 'Gagal mengumpulkan tugas');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Handle Student Unsubmit
  const handleUnsubmitTask = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pengumpulan tugas ini untuk mengunggah berkas baru?')) return;
    try {
      setIsUnsubmitting(true);
      await assignmentService.unsubmitAssignment(assignmentId);
      await loadDetail();
    } catch (err: any) {
      alert(err.message || 'Gagal membatalkan pengumpulan');
    } finally {
      setIsUnsubmitting(false);
    }
  };

  // Handle Admin Grade Save
  const handleSaveGrade = async (submissionId: number) => {
    const rawGrade = gradingScores[submissionId];
    const grade = rawGrade !== '' ? parseInt(rawGrade, 10) : null;
    const feedback = gradingFeedbacks[submissionId] || '';

    try {
      setSavingGradeId(submissionId);
      await assignmentService.gradeSubmission(submissionId, grade, feedback);
      await loadDetail();
      alert('Nilai dan catatan berhasil disimpan!');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan nilai');
    } finally {
      setSavingGradeId(null);
    }
  };

  // Handle Delete Assignment
  const handleDeleteAssignment = async () => {
    if (!confirm('Hapus tugas ini beserta seluruh pengumpulan dan komentar terkait? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      setIsDeleting(true);
      await assignmentService.deleteAssignment(assignmentId);
      onAssignmentDeleted?.();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus tugas');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center justify-center gap-4 text-center shadow-2xl">
          <Loader2 className="w-9 h-9 animate-spin text-[#006e1c]" />
          <p className="text-xs font-bold text-stone-600">Memuat rincian tugas & diskusi...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="font-display font-bold text-base text-stone-900">Gagal Membuka Tugas</h3>
          <p className="text-xs text-stone-600">{error || 'Data tugas tidak ditemukan.'}</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-stone-800 text-white text-xs font-bold hover:bg-stone-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const { assignment, my_submission, submissions = [], members = [] } = detail;

  // Due date calculation
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return { text: 'Tidak ada batas waktu', isOverdue: false, isNear: false };
    const due = new Date(dateStr);
    const now = new Date();
    const isOverdue = due < now;
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isNear = diffHours > 0 && diffHours <= 24;

    const formatted = due.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      text: formatted + ' WIB',
      isOverdue,
      isNear
    };
  };

  const dueInfo = formatDueDate(assignment.due_date);

  // Admin student submission mapping
  const submissionMap = new Map<number, AssignmentSubmission>();
  submissions.forEach((s) => submissionMap.set(s.student_id, s));

  // Filtered members for admin
  const filteredMembers = members.filter((m) => {
    const sub = submissionMap.get(m.id);
    if (adminTabFilter === 'submitted') return Boolean(sub);
    if (adminTabFilter === 'unsubmitted') return !sub;
    if (adminTabFilter === 'graded') return sub && sub.status === 'graded';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF9F6] rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <header className="bg-gradient-to-r from-[#154212] via-[#006e1c] to-[#154212] px-6 py-4 text-white flex justify-between items-center shrink-0 shadow-md">
          <div className="flex items-center gap-3 overflow-hidden text-left">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#91f78e] shrink-0 border border-white/10">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 truncate">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#91f78e] bg-white/15 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {roomName}
                </span>
                <span className="text-[10px] text-white/70 hidden sm:inline">•</span>
                <span className="text-[11px] text-white/80 hidden sm:inline font-medium">Tugas Kelas</span>
              </div>
              <h2 className="font-display font-bold text-sm sm:text-base md:text-lg text-white truncate">
                {assignment.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Edit Tugas"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={handleDeleteAssignment}
                  disabled={isDeleting}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Hapus Tugas"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hapus</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer ml-1"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Modal Main Content (2 Columns Layout) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Detail Tugas, Petunjuk, & Kolom Diskusi (8 cols on lg) */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-6 text-left">
              
              {/* Task Overview Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200/80 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs uppercase">
                      {assignment.creator_name ? assignment.creator_name[0] : 'G'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-800 block">
                        {assignment.creator_name || 'Pengajar GAS'}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        Dipublikasikan {new Date(assignment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>{assignment.max_points} Poin Maksimal</span>
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        dueInfo.isOverdue
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : dueInfo.isNear
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dueInfo.isOverdue ? 'Lewat Tenggat: ' : 'Tenggat: '}{dueInfo.text}</span>
                    </span>
                  </div>
                </div>

                {/* Deskripsi & Petunjuk */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Petunjuk Pengerjaan
                  </h4>
                  <div className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans whitespace-pre-wrap bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-100">
                    {assignment.description || 'Tidak ada deskripsi khusus untuk tugas ini. Silakan kerjakan sesuai instruksi pengajar di kelas.'}
                  </div>
                </div>

                {/* Berkas Lampiran dari Guru jika ada */}
                {assignment.attachment_path && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      Berkas Panduan / Lampiran Tugas
                    </h4>
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-white text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 shadow-xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-emerald-950 block truncate">
                            {assignment.attachment_name || 'Lampiran Tugas'}
                          </span>
                          <span className="text-[10px] text-emerald-700">Lampiran panduan dari pengajar</span>
                        </div>
                      </div>
                      <a
                        href={BACKEND_URL ? `${BACKEND_URL}/uploads/assignment_attachments/${assignment.attachment_path}` : `/uploads/assignment_attachments/${assignment.attachment_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-[#006e1c] hover:bg-[#154212] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Lampiran</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Kolom Diskusi & Komentar Tugas */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200/80 space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-stone-800">
                        Diskusi & Komentar Kelas
                      </h4>
                      <p className="text-[10px] text-stone-400">
                        Ruang tanya jawab dan diskusi tugas bersama guru dan teman sekelas
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
                    {comments.length} Komentar
                  </span>
                </div>

                {/* Daftar Komentar */}
                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                  {comments.length === 0 ? (
                    <div className="p-6 text-center text-stone-400 text-xs italic bg-stone-50/50 rounded-2xl border border-stone-100">
                      Belum ada komentar atau diskusi. Jadilah yang pertama bertanya atau berpendapat!
                    </div>
                  ) : (
                    comments.map((c) => {
                      const isAuthor = user?.id === c.user_id;
                      const canDelete = isAuthor || isAdmin;
                      return (
                        <div
                          key={c.id}
                          className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors space-y-2 group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-100/80 text-emerald-900 font-bold text-[10px] flex items-center justify-center uppercase shrink-0">
                                {c.author_name ? c.author_name[0] : 'U'}
                              </div>
                              <span className="text-xs font-bold text-stone-800">
                                {c.author_name}
                              </span>
                              {c.author_role === 'admin' ? (
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Pengajar</span>
                                </span>
                              ) : (
                                <span className="text-[9px] font-semibold px-2 py-0.5 bg-stone-200/80 text-stone-600 rounded-full">
                                  Murid
                                </span>
                              )}
                              <span className="text-[10px] text-stone-400 hidden sm:inline">
                                • {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {canDelete && (
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity cursor-pointer rounded-lg hover:bg-stone-200/50"
                                title="Hapus Komentar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-stone-700 leading-relaxed pl-9 font-sans whitespace-pre-wrap">
                            {c.content}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Form Kirim Komentar */}
                <form onSubmit={handleAddComment} className="pt-2 flex gap-2 items-start">
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Tulis pertanyaan atau komentar mengenai tugas ini..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#006e1c] focus:bg-white transition-all font-sans resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="px-4 py-3 bg-[#006e1c] hover:bg-[#154212] text-white rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isSubmittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Kirim</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: Submission & Grading Section (4-5 cols on lg) */}
            <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-6 text-left">
              
              {/* === SISWA VIEW: KOTAK PENGUMPULAN TUGAS === */}
              {!isAdmin && (
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200/80 space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h4 className="font-display font-bold text-sm text-stone-800">
                      Tugas Anda
                    </h4>
                    <div>
                      {my_submission ? (
                        my_submission.status === 'graded' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            <span>Dinilai: {my_submission.grade}/{assignment.max_points}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Diserahkan</span>
                          </span>
                        )
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Belum Diserahkan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feedback dari guru jika sudah dinilai */}
                  {my_submission?.status === 'graded' && (
                    <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-blue-700" />
                          Nilai & Catatan Guru
                        </span>
                        <span className="text-sm font-black text-blue-900">
                          {my_submission.grade} / {assignment.max_points}
                        </span>
                      </div>
                      <p className="text-xs text-blue-950 font-sans italic bg-white/70 p-2.5 rounded-xl border border-blue-100">
                        "{my_submission.feedback || 'Pengerjaan tugas baik dan sesuai instruksi.'}"
                      </p>
                    </div>
                  )}

                  {/* Jika sudah mengumpulkan */}
                  {my_submission ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileText className="w-5 h-5 text-emerald-700 shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-bold text-stone-800 block truncate">
                              {my_submission.original_name}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              Diserahkan {new Date(my_submission.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {my_submission.notes && (
                          <div className="text-[11px] text-stone-600 bg-white p-2.5 rounded-xl border border-stone-150">
                            <span className="font-bold text-stone-700 block text-[10px]">Catatan Anda:</span>
                            {my_submission.notes}
                          </div>
                        )}

                        <div className="pt-2 flex gap-2">
                          <a
                            href={BACKEND_URL ? `${BACKEND_URL}/uploads/assignments/${my_submission.filename}` : `/uploads/assignments/${my_submission.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Lihat Berkas Saya</span>
                          </a>
                        </div>
                      </div>

                      {/* Batalkan Penyerahan jika belum dinilai */}
                      {my_submission.status !== 'graded' && (
                        <button
                          type="button"
                          onClick={handleUnsubmitTask}
                          disabled={isUnsubmitting}
                          className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isUnsubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Batalkan Penyerahan (Unggah Ulang)</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Form Pengumpulan Berkas Baru */
                    <form onSubmit={handleSubmitTask} className="space-y-4">
                      <div className="border-2 border-dashed border-stone-200 hover:border-[#006e1c] rounded-2xl p-5 text-center transition-all bg-stone-50/50 hover:bg-emerald-50/30">
                        {submissionFile ? (
                          <div className="space-y-2">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#006e1c] flex items-center justify-center mx-auto">
                              <Check className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-stone-800 block truncate">
                              {submissionFile.name}
                            </span>
                            <span className="text-[10px] text-stone-400 block">
                              {(submissionFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <button
                              type="button"
                              onClick={() => setSubmissionFile(null)}
                              className="text-[11px] text-rose-600 hover:underline font-bold cursor-pointer"
                            >
                              Ganti Berkas
                            </button>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              id="student-task-file-input"
                              required
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setSubmissionFile(e.target.files[0]);
                                }
                              }}
                            />
                            <label
                              htmlFor="student-task-file-input"
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer shadow-xs transition-all"
                            >
                              <Upload className="w-4 h-4 text-emerald-700" />
                              <span>Pilih Berkas Tugas</span>
                            </label>
                            <p className="text-[10px] text-stone-400 mt-2.5 leading-relaxed">
                              Dukung format PDF, Word (DOCX/DOC), PowerPoint (PPTX), ZIP, atau Gambar hingga 25MB
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Catatan untuk guru */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          Catatan Tambahan untuk Pengajar (Opsional)
                        </label>
                        <textarea
                          rows={2}
                          value={submissionNotes}
                          onChange={(e) => setSubmissionNotes(e.target.value)}
                          placeholder="Tuliskan catatan atau link pendukung jika ada..."
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#006e1c] focus:bg-white transition-all font-sans resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!submissionFile || isSubmittingTask}
                        className="w-full py-3 rounded-2xl bg-[#006e1c] hover:bg-[#154212] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingTask ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Mengunggah Berkas...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Serahkan Tugas Sekarang</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* === ADMIN VIEW: MONITOR PENGUMPULAN & PENILAIAN SISWA === */}
              {isAdmin && (
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200/80 space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div>
                      <h4 className="font-display font-bold text-sm text-stone-800">
                        Pengumpulan Murid
                      </h4>
                      <p className="text-[10px] text-stone-400">
                        {submissions.length} dari {members.length} murid telah mengumpulkan
                      </p>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="grid grid-cols-4 gap-1 bg-stone-100 p-1 rounded-2xl text-[10px] font-bold text-center">
                    <button
                      type="button"
                      onClick={() => setAdminTabFilter('all')}
                      className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                        adminTabFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Semua ({members.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminTabFilter('submitted')}
                      className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                        adminTabFilter === 'submitted' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Diserahkan ({submissions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminTabFilter('graded')}
                      className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                        adminTabFilter === 'graded' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Dinilai ({submissions.filter((s) => s.status === 'graded').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminTabFilter('unsubmitted')}
                      className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                        adminTabFilter === 'unsubmitted' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Belum ({members.length - submissions.length})
                    </button>
                  </div>

                  {/* Daftar Murid & Nilai */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {filteredMembers.length === 0 ? (
                      <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl">
                        Tidak ada data murid pada filter ini.
                      </div>
                    ) : (
                      filteredMembers.map((m) => {
                        const sub = submissionMap.get(m.id);
                        return (
                          <div
                            key={m.id}
                            className={`p-3.5 rounded-2xl border transition-all text-xs space-y-2.5 ${
                              sub
                                ? sub.status === 'graded'
                                  ? 'bg-blue-50/40 border-blue-200'
                                  : 'bg-emerald-50/40 border-emerald-200'
                                : 'bg-stone-50 border-stone-200/60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 font-bold text-[10px] flex items-center justify-center uppercase shrink-0">
                                  {m.full_name ? m.full_name[0] : 'S'}
                                </div>
                                <div className="truncate">
                                  <span className="font-bold text-stone-800 block truncate text-xs">
                                    {m.full_name}
                                  </span>
                                  <span className="text-[10px] text-stone-400 truncate block">
                                    {m.email}
                                  </span>
                                </div>
                              </div>

                              <div>
                                {sub ? (
                                  sub.status === 'graded' ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                      Nilai: {sub.grade}/{assignment.max_points}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      Diserahkan
                                    </span>
                                  )
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-600">
                                    Belum
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Berkas & Penilaian jika murid telah mengumpulkan */}
                            {sub && (
                              <div className="bg-white/80 p-3 rounded-xl border border-stone-200/70 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 overflow-hidden text-[11px] text-stone-700 font-medium">
                                    <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                    <span className="truncate">{sub.original_name}</span>
                                  </div>
                                  <a
                                    href={BACKEND_URL ? `${BACKEND_URL}/uploads/assignments/${sub.filename}` : `/uploads/assignments/${sub.filename}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006e1c] font-bold text-[10px] flex items-center gap-1 transition-colors shrink-0"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Unduh</span>
                                  </a>
                                </div>

                                {sub.notes && (
                                  <p className="text-[10px] text-stone-600 italic bg-stone-50 p-1.5 rounded-lg">
                                    "{sub.notes}"
                                  </p>
                                )}

                                {/* Input Nilai & Catatan Guru */}
                                <div className="pt-2 border-t border-stone-100 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <label className="text-[10px] font-bold text-stone-500 shrink-0">
                                      Nilai:
                                    </label>
                                    <input
                                      type="number"
                                      min={0}
                                      max={assignment.max_points}
                                      placeholder="0-100"
                                      value={gradingScores[sub.id] ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setGradingScores((prev) => ({ ...prev, [sub.id]: val }));
                                      }}
                                      className="w-20 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold text-stone-800 text-center focus:outline-none focus:ring-1 focus:ring-[#006e1c]"
                                    />
                                    <span className="text-[10px] text-stone-400">/ {assignment.max_points}</span>

                                    <button
                                      type="button"
                                      onClick={() => handleSaveGrade(sub.id)}
                                      disabled={savingGradeId === sub.id}
                                      className="ml-auto px-3 py-1 bg-[#006e1c] hover:bg-[#154212] text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                    >
                                      {savingGradeId === sub.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                      <span>Simpan</span>
                                    </button>
                                  </div>

                                  <input
                                    type="text"
                                    placeholder="Catatan / masukan evaluasi untuk murid..."
                                    value={gradingFeedbacks[sub.id] ?? ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setGradingFeedbacks((prev) => ({ ...prev, [sub.id]: val }));
                                    }}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-[11px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#006e1c]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

      </div>

      {/* Edit Form Modal for Admin */}
      {showEditModal && (
        <AssignmentFormModal
          roomId={assignment.room_id}
          roomName={roomName}
          assignmentToEdit={assignment}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadDetail();
            onAssignmentUpdated?.();
          }}
        />
      )}
    </div>
  );
}
