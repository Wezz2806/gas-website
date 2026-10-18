import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  Clock, 
  Award, 
  MessageSquare, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Download, 
  Loader2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Assignment, Room } from '../../types';
import { assignmentService } from '../../services/assignmentService';
import AssignmentModal from '../assignment/AssignmentModal';
import AssignmentFormModal from '../assignment/AssignmentFormModal';

interface AdminAssignmentsViewProps {
  room: Room;
}

export default function AdminAssignmentsView({ room }: AdminAssignmentsViewProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const res = await assignmentService.getAssignments(room.id);
      setAssignments(res.assignments);
      setTotalMembers(res.total_members);
    } catch (err) {
      console.error('Failed to load assignments in admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [room.id]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Hapus tugas ini beserta seluruh berkas pengumpulan dan diskusinya?')) return;
    try {
      await assignmentService.deleteAssignment(id);
      fetchAssignments();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus tugas');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-left">
      {/* Header bar */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#154212] to-[#006e1c] text-[#91f78e] flex items-center justify-center shadow-xs">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-[#154212]">
              Manajemen Tugas Kelas & Diskusi
            </h3>
            <p className="text-xs text-stone-500">
              Buat penugasan, periksa berkas murid, beri nilai evaluasi, dan pantau forum diskusi
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#006e1c] hover:bg-[#154212] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tugas Baru</span>
        </button>
      </div>

      {/* Content list */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-stone-200 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#006e1c]" />
          <span className="text-xs font-semibold">Memuat tugas kelas...</span>
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-300 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-bold text-sm text-stone-800">Belum Ada Tugas di Kelas Ini</h4>
            <p className="text-xs text-stone-500">
              Mulai buat penugasan pertama untuk memberikan latihan atau proyek aksi nyata kepada murid.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 px-5 py-2.5 rounded-xl bg-[#006e1c] text-white text-xs font-bold hover:bg-[#154212] inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan Tugas Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assign) => {
            const due = assign.due_date ? new Date(assign.due_date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            }) + ' WIB' : 'Tanpa batas waktu';

            const subsCount = assign.submissions_count || 0;
            const gradedCount = assign.graded_count || 0;

            return (
              <div
                key={assign.id}
                onClick={() => setSelectedAssignmentId(assign.id)}
                className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-[#006e1c]/50 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-500" />
                      <span>{due}</span>
                    </span>
                    <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-700" />
                      {assign.max_points} Poin
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-sm text-[#154212] group-hover:text-[#006e1c] transition-colors line-clamp-2">
                    {assign.title}
                  </h4>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {assign.description || 'Klik untuk membuka detail pengumpulan murid dan diskusi.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {subsCount} Murid Mengumpulkan ({gradedCount} Dinilai)
                    </span>

                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{assign.comments_count || 0} Komentar</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignmentToEdit(assign);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-[#006e1c] hover:bg-emerald-50 transition-colors"
                        title="Edit Tugas"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(assign.id, e)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Tugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-stone-50 group-hover:bg-[#006e1c] group-hover:text-white text-stone-700 text-[11px] font-bold transition-all flex items-center gap-1"
                    >
                      <span>Lihat & Nilai</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment Detail & Grading Modal */}
      {selectedAssignmentId && (
        <AssignmentModal
          assignmentId={selectedAssignmentId}
          roomName={room.name}
          onClose={() => setSelectedAssignmentId(null)}
          onAssignmentDeleted={() => {
            setSelectedAssignmentId(null);
            fetchAssignments();
          }}
          onAssignmentUpdated={() => {
            fetchAssignments();
          }}
        />
      )}

      {/* Create / Edit Modal */}
      {(showCreateModal || assignmentToEdit) && (
        <AssignmentFormModal
          roomId={room.id}
          roomName={room.name}
          assignmentToEdit={assignmentToEdit}
          onClose={() => {
            setShowCreateModal(false);
            setAssignmentToEdit(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setAssignmentToEdit(null);
            fetchAssignments();
          }}
        />
      )}
    </div>
  );
}
