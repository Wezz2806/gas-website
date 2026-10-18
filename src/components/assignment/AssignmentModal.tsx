import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  FileText, 
  Upload, 
  Download, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  User, 
  Users, 
  ShieldCheck, 
  Award, 
  Loader2, 
  Check, 
  RotateCcw,
  MoreVertical,
  Plus,
  ClipboardList,
  Paperclip,
  ChevronDown
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

  // Class comments state
  const [comments, setComments] = useState<AssignmentComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Private comments state
  const [privateComments, setPrivateComments] = useState<AssignmentComment[]>([]);
  const [newPrivateComment, setNewPrivateComment] = useState('');
  const [isSubmittingPrivateComment, setIsSubmittingPrivateComment] = useState(false);
  const [selectedStudentForAdmin, setSelectedStudentForAdmin] = useState<number | null>(null);

  // Student submission state
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isUnsubmitting, setIsUnsubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin grading state
  const [gradingScores, setGradingScores] = useState<Record<number, string>>({});
  const [gradingFeedbacks, setGradingFeedbacks] = useState<Record<number, string>>({});
  const [savingGradeId, setSavingGradeId] = useState<number | null>(null);
  const [adminTabFilter, setAdminTabFilter] = useState<'all' | 'submitted' | 'unsubmitted' | 'graded'>('all');

  // Kebab menu & edit modal
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await assignmentService.getAssignmentDetail(assignmentId);
      setDetail(res);
      setComments(res.comments || []);
      setPrivateComments(res.private_comments || []);

      // Admin grading state init
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

      // Default selected student for admin private comments
      if (isAdmin && res.members && res.members.length > 0 && selectedStudentForAdmin === null) {
        setSelectedStudentForAdmin(res.members[0].id);
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

  // Handle Class Comment Submit
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const added = await assignmentService.addComment(assignmentId, newComment.trim(), 'class');
      setComments((prev) => [...prev, added]);
      setNewComment('');
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim komentar kelas');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle Private Comment Submit
  const handleAddPrivateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrivateComment.trim() || isSubmittingPrivateComment) return;

    const targetId = isAdmin ? selectedStudentForAdmin : user?.id;

    try {
      setIsSubmittingPrivateComment(true);
      const added = await assignmentService.addComment(
        assignmentId, 
        newPrivateComment.trim(), 
        'private', 
        targetId
      );
      setPrivateComments((prev) => [...prev, added]);
      setNewPrivateComment('');
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim komentar pribadi');
    } finally {
      setIsSubmittingPrivateComment(false);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: number, isPrivate = false) => {
    if (!confirm('Hapus komentar ini?')) return;
    try {
      await assignmentService.deleteComment(commentId);
      if (isPrivate) {
        setPrivateComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus komentar');
    }
  };

  // Handle Student Submit
  const handleSubmitTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmittingTask) return;

    if (!submissionFile) {
      // Tandai sebagai selesai tanpa file
      alert('Tugas ditandai sebagai selesai!');
      return;
    }

    try {
      setIsSubmittingTask(true);
      await assignmentService.submitAssignment(assignmentId, submissionFile, submissionNotes);
      setSubmissionFile(null);
      setSubmissionNotes('');
      await loadDetail();
      alert('Tugas berhasil diserahkan!');
    } catch (err: any) {
      alert(err.message || 'Gagal mengumpulkan tugas');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Handle Student Unsubmit
  const handleUnsubmitTask = async () => {
    if (!confirm('Batalkan penyerahan tugas untuk mengubah atau menambahkan berkas?')) return;
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
      alert('Nilai dan catatan evaluasi berhasil disimpan!');
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

  // Helper date formatting
  const formatAuthorTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}.${minutes}`;
    } catch (e) {
      return '';
    }
  };

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return { text: 'Tidak ada batas waktu', isOverdue: false };
    const due = new Date(dateStr);
    const now = new Date();
    const isOverdue = due < now;

    const formatted = due.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      text: formatted + ' WIB',
      isOverdue
    };
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full flex flex-col items-center justify-center gap-3 text-center shadow-xl border border-[#dadce0]">
          <Loader2 className="w-8 h-8 animate-spin text-[#1967d2]" />
          <p className="text-xs font-medium text-[#5f6368]">Memuat penugasan...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center shadow-xl border border-[#dadce0] space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-sans font-medium text-base text-[#1f1f1f]">Gagal Membuka Tugas</h3>
          <p className="text-xs text-[#5f6368]">{error || 'Data tugas tidak ditemukan.'}</p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md bg-[#1967d2] text-white text-xs font-medium hover:bg-[#185abc] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const { assignment, my_submission, submissions = [], members = [] } = detail;
  const dueInfo = formatDueDate(assignment.due_date);
  const authorTimeStr = formatAuthorTime(assignment.created_at);

  // Filtered private comments
  const activePrivateComments = isAdmin
    ? privateComments.filter(
        (c) => c.user_id === selectedStudentForAdmin || c.target_student_id === selectedStudentForAdmin
      )
    : privateComments;

  // Selected student obj for admin
  const selectedStudentObj = members.find((m) => m.id === selectedStudentForAdmin);

  // Mapping for Admin Submissions
  const submissionMap = new Map<number, AssignmentSubmission>();
  submissions.forEach((s) => submissionMap.set(s.student_id, s));

  const filteredMembers = members.filter((m) => {
    const sub = submissionMap.get(m.id);
    if (adminTabFilter === 'submitted') return Boolean(sub);
    if (adminTabFilter === 'unsubmitted') return !sub;
    if (adminTabFilter === 'graded') return sub && sub.status === 'graded';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-5xl my-auto max-h-[95vh] flex flex-col shadow-2xl border border-[#dadce0] overflow-hidden text-left font-sans">
        
        {/* Top Minimal Bar */}
        <div className="px-5 py-3 border-b border-[#dadce0] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#5f6368] truncate">
            <span className="font-medium text-[#1f1f1f]">{roomName}</span>
            <span>/</span>
            <span className="truncate">Tugas Kelas</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isAdmin && (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-[#1967d2] hover:bg-[#f8fafd] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Edit Tugas"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#5f6368] hover:text-[#1f1f1f] hover:bg-stone-100 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Main Layout */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 md:p-9 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── LEFT SECTION: Assignment Details & Class Discussion (8 cols) ── */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Header: Blue Circle Icon + Title + Meta + Points */}
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  {/* Google Classroom Circular Assignment Icon */}
                  <div className="w-11 h-11 rounded-full bg-[#1967d2] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <ClipboardList className="w-6 h-6 stroke-[1.8]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h1 className="text-xl sm:text-2xl font-normal text-[#1f1f1f] leading-snug tracking-tight font-sans break-words">
                        {assignment.title}
                      </h1>

                      {/* Kebab Menu */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowKebabMenu(!showKebabMenu)}
                          className="p-1.5 rounded-full text-[#5f6368] hover:text-[#1f1f1f] hover:bg-stone-100 transition-colors cursor-pointer"
                          title="Opsi"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {showKebabMenu && (
                          <div className="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-lg border border-[#dadce0] py-1 z-30 text-xs text-[#3c4043]">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => {
                                    setShowKebabMenu(false);
                                    setShowEditModal(true);
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#5f6368]" />
                                  <span>Edit tugas</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setShowKebabMenu(false);
                                    handleDeleteAssignment();
                                  }}
                                  className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus tugas</span>
                                </button>
                                <div className="border-t border-[#dadce0] my-1" />
                              </>
                            )}
                            <button
                              onClick={() => {
                                setShowKebabMenu(false);
                                navigator.clipboard.writeText(window.location.href);
                                alert('Tautan tugas disalin ke papan klip!');
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Paperclip className="w-3.5 h-3.5 text-[#5f6368]" />
                              <span>Salin link tugas</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Author & Timestamp (e.g. Kesdik Bayu • 14.48) */}
                    <div className="text-xs text-[#5f6368] font-normal mt-1 flex items-center gap-1.5">
                      <span>{assignment.creator_name || 'Kesdik Bayu'}</span>
                      <span>•</span>
                      <span>{authorTimeStr || 'Hari ini'}</span>
                    </div>

                    {/* Points & Due Date */}
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-[#5f6368]">
                      <span className="font-medium text-[#1f1f1f]">
                        {assignment.max_points} poin
                      </span>
                      {assignment.due_date && (
                        <>
                          <span>•</span>
                          <span className={dueInfo.isOverdue ? 'text-rose-600 font-medium' : ''}>
                            Tenggat: {dueInfo.text}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Horizontal Divider Line */}
                <hr className="border-[#dadce0] my-4" />
              </div>

              {/* Task Description / Instructions (exact Google Classroom clean look) */}
              <div className="text-sm text-[#3c4043] leading-relaxed whitespace-pre-wrap font-sans space-y-3">
                {assignment.description || 'Tidak ada deskripsi tambahan.'}
              </div>

              {/* Teacher Attachment Chip if present */}
              {assignment.attachment_path && (
                <div className="pt-2">
                  <div className="p-3.5 rounded-lg border border-[#dadce0] hover:bg-[#f8fafd] transition-colors flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-lg bg-[#e8f0fe] text-[#1967d2] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate text-xs">
                        <span className="font-medium text-[#1f1f1f] block truncate">
                          {assignment.attachment_name || 'Lampiran Tugas'}
                        </span>
                        <span className="text-[#5f6368] text-[11px]">Materi & Panduan Pengajar</span>
                      </div>
                    </div>

                    <a
                      href={BACKEND_URL ? `${BACKEND_URL}/uploads/assignment_attachments/${assignment.attachment_path}` : `/uploads/assignment_attachments/${assignment.attachment_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md border border-[#dadce0] text-[#1967d2] hover:bg-white text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Horizontal Divider before Class Comments */}
              <hr className="border-[#dadce0] my-6" />

              {/* ── Komentar Kelas Section ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-[#3c4043] font-medium text-sm">
                  <Users className="w-5 h-5 text-[#5f6368]" />
                  <span>Komentar kelas</span>
                  {comments.length > 0 && (
                    <span className="text-xs text-[#5f6368]">({comments.length})</span>
                  )}
                </div>

                {/* Comments List */}
                <div className="space-y-3 pl-1">
                  {comments.length === 0 ? (
                    <p className="text-xs text-[#5f6368] italic py-1">
                      Belum ada komentar kelas.
                    </p>
                  ) : (
                    comments.map((c) => {
                      const isAuthor = user?.id === c.user_id;
                      const canDelete = isAuthor || isAdmin;
                      return (
                        <div key={c.id} className="flex items-start gap-3 text-xs group">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-[#1967d2]/10 text-[#1967d2] font-semibold text-xs flex items-center justify-center uppercase shrink-0 mt-0.5">
                            {c.author_name ? c.author_name[0] : 'U'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#1f1f1f] text-xs">
                                {c.author_name}
                              </span>
                              {c.author_role === 'admin' && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-[#1967d2] font-medium">
                                  Pengajar
                                </span>
                              )}
                              <span className="text-[11px] text-[#5f6368]">
                                {formatAuthorTime(c.created_at)}
                              </span>

                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteComment(c.id, false)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-[#5f6368] hover:text-rose-600 transition-opacity ml-auto"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <p className="text-xs text-[#3c4043] mt-0.5 whitespace-pre-wrap leading-normal font-sans">
                              {c.content}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Class Comment Input */}
                <form onSubmit={handleAddComment} className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 font-semibold text-xs flex items-center justify-center uppercase shrink-0">
                    {user?.full_name ? user.full_name[0] : 'U'}
                  </div>

                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Tambahkan komentar kelas..."
                      className="w-full text-xs text-[#3c4043] placeholder-[#5f6368] border border-[#dadce0] focus:border-[#1967d2] rounded-full px-4 py-2.5 focus:outline-none transition-colors pr-10"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="absolute right-2 p-1.5 text-[#1967d2] disabled:text-[#dadce0] hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                      title="Kirim Komentar"
                    >
                      {isSubmittingComment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* ── RIGHT SECTION: Google Classroom Action Cards (4 cols) ── */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* === CARD 1: TUGAS === */}
              <div className="bg-white rounded-lg border border-[#dadce0] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-[#1f1f1f]">Tugas</h3>
                  <div>
                    {!isAdmin ? (
                      my_submission ? (
                        my_submission.status === 'graded' ? (
                          <span className="text-xs font-medium text-[#185abc]">
                            Dinilai
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-[#137333]">
                            Diserahkan
                          </span>
                        )
                      ) : (
                        <span className="text-xs font-medium text-[#137333]">
                          Ditugaskan
                        </span>
                      )
                    ) : (
                      <span className="text-xs font-medium text-[#5f6368]">
                        {submissions.length} Diserahkan
                      </span>
                    )}
                  </div>
                </div>

                {/* SISWA: SUBMISSION CONTENT */}
                {!isAdmin && (
                  <div className="space-y-3">
                    {/* If already submitted */}
                    {my_submission ? (
                      <div className="space-y-3">
                        {/* File Chip */}
                        <div className="p-3 rounded-md border border-[#dadce0] bg-[#f8fafd] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <FileText className="w-4 h-4 text-[#1967d2] shrink-0" />
                            <span className="text-xs font-medium text-[#1f1f1f] truncate">
                              {my_submission.original_name}
                            </span>
                          </div>
                          <a
                            href={BACKEND_URL ? `${BACKEND_URL}/uploads/assignments/${my_submission.filename}` : `/uploads/assignments/${my_submission.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-[#1967d2] hover:bg-blue-50 rounded transition-colors shrink-0"
                            title="Unduh berkas"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>

                        {/* Grade & feedback display */}
                        {my_submission.status === 'graded' && (
                          <div className="p-3 rounded-md bg-blue-50/70 border border-blue-200 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-blue-900">Nilai</span>
                              <span className="font-bold text-blue-900 text-sm">
                                {my_submission.grade} / {assignment.max_points}
                              </span>
                            </div>
                            {my_submission.feedback && (
                              <p className="text-[11px] text-blue-950 italic mt-1 bg-white/70 p-2 rounded border border-blue-100">
                                "{my_submission.feedback}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Unsubmit Button */}
                        {my_submission.status !== 'graded' && (
                          <button
                            type="button"
                            onClick={handleUnsubmitTask}
                            disabled={isUnsubmitting}
                            className="w-full py-2 px-4 rounded-md border border-[#dadce0] hover:bg-[#f8fafd] text-[#1967d2] font-medium text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {isUnsubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <span>Batalkan pengiriman</span>
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Not yet submitted: Google Classroom action buttons */
                      <div className="space-y-2.5">
                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setSubmissionFile(e.target.files[0]);
                            }
                          }}
                        />

                        {/* Selected file preview chip */}
                        {submissionFile && (
                          <div className="p-2.5 rounded-md border border-[#dadce0] bg-[#f8fafd] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="w-4 h-4 text-[#1967d2] shrink-0" />
                              <span className="truncate font-medium text-[#1f1f1f]">
                                {submissionFile.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSubmissionFile(null)}
                              className="text-[#5f6368] hover:text-rose-600 p-0.5 rounded cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Button: + Tambah atau buat */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-2.5 px-4 rounded-md border border-[#dadce0] hover:bg-[#f8fafd] text-[#1967d2] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-none"
                        >
                          <Plus className="w-4 h-4 stroke-[2.2]" />
                          <span>+ Tambah atau buat</span>
                        </button>

                        {/* Primary Button: Tandai sebagai selesai OR Serahkan */}
                        <button
                          type="button"
                          onClick={() => handleSubmitTask()}
                          disabled={isSubmittingTask}
                          className="w-full py-2.5 px-4 rounded-md bg-[#1967d2] hover:bg-[#185abc] text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60"
                        >
                          {isSubmittingTask ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : submissionFile ? (
                            <span>Serahkan</span>
                          ) : (
                            <span>Tandai sebagai selesai</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ADMIN: SUBMISSION & GRADING LIST */}
                {isAdmin && (
                  <div className="space-y-3">
                    {/* Filter tabs */}
                    <div className="flex items-center justify-between text-[11px] font-medium text-[#5f6368] border-b border-[#dadce0] pb-2">
                      <button
                        onClick={() => setAdminTabFilter('all')}
                        className={`hover:text-[#1967d2] cursor-pointer pb-1 ${adminTabFilter === 'all' ? 'text-[#1967d2] border-b-2 border-[#1967d2]' : ''}`}
                      >
                        Semua ({members.length})
                      </button>
                      <button
                        onClick={() => setAdminTabFilter('submitted')}
                        className={`hover:text-[#1967d2] cursor-pointer pb-1 ${adminTabFilter === 'submitted' ? 'text-[#1967d2] border-b-2 border-[#1967d2]' : ''}`}
                      >
                        Diserahkan ({submissions.length})
                      </button>
                      <button
                        onClick={() => setAdminTabFilter('graded')}
                        className={`hover:text-[#1967d2] cursor-pointer pb-1 ${adminTabFilter === 'graded' ? 'text-[#1967d2] border-b-2 border-[#1967d2]' : ''}`}
                      >
                        Dinilai ({submissions.filter(s => s.status === 'graded').length})
                      </button>
                    </div>

                    {/* Member rows */}
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {filteredMembers.length === 0 ? (
                        <p className="text-xs text-[#5f6368] italic py-3 text-center">
                          Tidak ada siswa pada kategori ini.
                        </p>
                      ) : (
                        filteredMembers.map((m) => {
                          const sub = submissionMap.get(m.id);
                          const isGraded = sub?.status === 'graded';

                          return (
                            <div
                              key={m.id}
                              className="p-2.5 rounded-lg border border-[#dadce0] bg-[#f8fafd] text-xs space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="truncate">
                                  <span className="font-medium text-[#1f1f1f] block truncate">
                                    {m.full_name}
                                  </span>
                                  <span className="text-[10px] text-[#5f6368] truncate block">
                                    {m.email}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                  isGraded
                                    ? 'bg-blue-100 text-blue-800'
                                    : sub
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-stone-200 text-stone-600'
                                }`}>
                                  {isGraded ? `Nilai: ${sub.grade}` : sub ? 'Diserahkan' : 'Belum'}
                                </span>
                              </div>

                              {/* If submitted, show download & grade input */}
                              {sub && (
                                <div className="space-y-2 pt-1 border-t border-[#dadce0]">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[#5f6368] truncate max-w-[150px]">
                                      {sub.original_name}
                                    </span>
                                    <a
                                      href={BACKEND_URL ? `${BACKEND_URL}/uploads/assignments/${sub.filename}` : `/uploads/assignments/${sub.filename}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#1967d2] hover:underline font-medium text-[10px] flex items-center gap-1"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>Unduh</span>
                                    </a>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min={0}
                                      max={assignment.max_points}
                                      placeholder="Poin"
                                      value={gradingScores[sub.id] ?? ''}
                                      onChange={(e) => setGradingScores({ ...gradingScores, [sub.id]: e.target.value })}
                                      className="w-16 border border-[#dadce0] rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-[#1967d2]"
                                    />
                                    <span className="text-[10px] text-[#5f6368]">/ {assignment.max_points}</span>
                                    
                                    <button
                                      type="button"
                                      onClick={() => handleSaveGrade(sub.id)}
                                      disabled={savingGradeId === sub.id}
                                      className="ml-auto px-2.5 py-1 bg-[#1967d2] hover:bg-[#185abc] text-white rounded text-[10px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                      {savingGradeId === sub.id ? 'Menyimpan...' : 'Simpan'}
                                    </button>
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

              {/* === CARD 2: KOMENTAR PRIBADI (exact Google Classroom look) === */}
              <div className="bg-white rounded-lg border border-[#dadce0] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#3c4043] font-medium text-sm">
                    <User className="w-4 h-4 text-[#5f6368]" />
                    <span>Komentar pribadi</span>
                  </div>

                  {/* If admin, dropdown to select which student's private thread to view */}
                  {isAdmin && members.length > 0 && (
                    <select
                      value={selectedStudentForAdmin || ''}
                      onChange={(e) => setSelectedStudentForAdmin(Number(e.target.value))}
                      className="text-[11px] text-[#5f6368] border border-[#dadce0] rounded px-2 py-0.5 focus:outline-none focus:border-[#1967d2] max-w-[120px]"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Private Comments List */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {activePrivateComments.length === 0 ? (
                    <p className="text-xs text-[#5f6368] italic py-1">
                      {isAdmin 
                        ? `Belum ada komentar pribadi dengan ${selectedStudentObj?.full_name || 'siswa ini'}.`
                        : 'Belum ada komentar pribadi.'}
                    </p>
                  ) : (
                    activePrivateComments.map((c) => {
                      const isAuthor = user?.id === c.user_id;
                      const canDelete = isAuthor || isAdmin;
                      return (
                        <div key={c.id} className="flex items-start gap-2.5 text-xs group">
                          <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 font-semibold text-[10px] flex items-center justify-center uppercase shrink-0 mt-0.5">
                            {c.author_name ? c.author_name[0] : 'U'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[#1f1f1f] text-[11px]">
                                {c.author_name}
                              </span>
                              <span className="text-[10px] text-[#5f6368]">
                                {formatAuthorTime(c.created_at)}
                              </span>

                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteComment(c.id, true)}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 text-[#5f6368] hover:text-rose-600 transition-opacity ml-auto"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            <p className="text-xs text-[#3c4043] mt-0.5 whitespace-pre-wrap leading-normal font-sans">
                              {c.content}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Private Comment Input */}
                <form onSubmit={handleAddPrivateComment} className="flex items-center gap-2 pt-1">
                  <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 font-semibold text-[10px] flex items-center justify-center uppercase shrink-0">
                    {user?.full_name ? user.full_name[0] : 'U'}
                  </div>

                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      value={newPrivateComment}
                      onChange={(e) => setNewPrivateComment(e.target.value)}
                      placeholder={
                        isAdmin
                          ? `Komentar untuk ${selectedStudentObj?.full_name ? selectedStudentObj.full_name.split(' ')[0] : 'siswa'}...`
                          : `Tambahkan komentar untuk ${assignment.creator_name ? assignment.creator_name.split(' ')[0] : 'pengajar'}...`
                      }
                      className="w-full text-xs text-[#3c4043] placeholder-[#5f6368] border border-[#dadce0] focus:border-[#1967d2] rounded-full px-3.5 py-2 focus:outline-none transition-colors pr-9"
                    />
                    <button
                      type="submit"
                      disabled={!newPrivateComment.trim() || isSubmittingPrivateComment}
                      className="absolute right-1.5 p-1 text-[#1967d2] disabled:text-[#dadce0] hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                      title="Kirim Komentar Pribadi"
                    >
                      {isSubmittingPrivateComment ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </form>
              </div>

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
