import React, { useState } from 'react';
import { X, Calendar, FileText, Upload, AlertCircle, Loader2, Sparkles, Check } from 'lucide-react';
import { Assignment } from '../../types';
import { assignmentService } from '../../services/assignmentService';

interface AssignmentFormModalProps {
  roomId: number;
  roomName: string;
  assignmentToEdit?: Assignment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignmentFormModal({
  roomId,
  roomName,
  assignmentToEdit,
  onClose,
  onSuccess
}: AssignmentFormModalProps) {
  const isEditing = Boolean(assignmentToEdit);

  const [title, setTitle] = useState(assignmentToEdit?.title || '');
  const [description, setDescription] = useState(assignmentToEdit?.description || '');
  const [dueDate, setDueDate] = useState(() => {
    if (assignmentToEdit?.due_date) {
      // Format to YYYY-MM-DDTHH:MM
      try {
        const d = new Date(assignmentToEdit.due_date);
        return d.toISOString().slice(0, 16);
      } catch (e) {
        return '';
      }
    }
    // Default 7 days from now at 23:59
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [maxPoints, setMaxPoints] = useState(assignmentToEdit?.max_points || 100);
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Judul tugas wajib diisi.');
      return;
    }

    try {
      setIsLoading(true);

      if (isEditing && assignmentToEdit) {
        await assignmentService.updateAssignment({
          id: assignmentToEdit.id,
          title: title.trim(),
          description: description.trim(),
          due_date: dueDate ? dueDate.replace('T', ' ') + ':00' : null,
          max_points: Number(maxPoints) || 100
        });
      } else {
        const formData = new FormData();
        formData.append('room_id', String(roomId));
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        if (dueDate) {
          formData.append('due_date', dueDate.replace('T', ' ') + ':00');
        }
        formData.append('max_points', String(maxPoints));
        if (selectedAttachment) {
          formData.append('attachment', selectedAttachment);
        }

        await assignmentService.createAssignment(formData);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan tugas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#154212] to-[#006e1c] px-6 py-5 text-white flex justify-between items-center shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#91f78e] bg-white/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {roomName}
            </span>
            <h3 className="font-display font-bold text-lg text-white">
              {isEditing ? 'Edit Tugas / Perintah Kelas' : 'Buat Tugas / Perintah Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-left flex-1">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Judul Tugas / Perintah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Permodelan matematis untuk menilai perilaku materi skala sub-atomik"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#006e1c] focus:bg-white transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Deskripsi & Petunjuk Pengerjaan
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan petunjuk pengerjaan tugas, format berkas yang diminta, dan ketentuan lainnya untuk siswa..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#006e1c] focus:bg-white transition-all font-sans leading-relaxed resize-y"
            />
          </div>

          {/* Due date & Max Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>Tenggat Waktu Pengumpulan</span>
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#006e1c] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Nilai Maksimal
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={maxPoints}
                onChange={(e) => setMaxPoints(parseInt(e.target.value, 10) || 100)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#006e1c] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Attachment (New only) */}
          {!isEditing && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>Lampiran Soal / Panduan (Opsional)</span>
              </label>
              <div className="border-2 border-dashed border-stone-200 rounded-2xl p-4 text-center hover:bg-stone-50/50 transition-colors">
                {selectedAttachment ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="font-semibold text-emerald-950 truncate">{selectedAttachment.name}</span>
                      <span className="text-[10px] text-emerald-700">({(selectedAttachment.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAttachment(null)}
                      className="p-1 hover:bg-emerald-200 rounded-lg text-emerald-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="assign-attachment-input"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedAttachment(e.target.files[0]);
                        }
                      }}
                    />
                    <label
                      htmlFor="assign-attachment-input"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer shadow-sm transition-all"
                    >
                      <Upload className="w-4 h-4 text-emerald-700" />
                      <span>Pilih Berkas Lampiran</span>
                    </label>
                    <p className="text-[10px] text-stone-400 mt-2">
                      PDF, DOCX, PPTX, atau Gambar hingga 25MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-stone-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-[#006e1c] hover:bg-[#154212] text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Simpan Perubahan' : 'Terbitkan Tugas'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
