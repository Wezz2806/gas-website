import React, { useState, useEffect } from 'react';
import { initialMeetings } from '../data';
import { Meeting } from '../types';
import { 
  Users, 
  FlaskConical, 
  Microscope, 
  Package, 
  Download, 
  Upload, 
  BookOpen, 
  CheckCircle, 
  X, 
  FileText,
} from 'lucide-react';
import { submissionService } from '../services/submissionService';

interface EcoLabViewProps {
  setActiveTab: (tab: any) => void;
  onSelectBook?: (bookId: string) => void;
}

export default function EcoLabView({ setActiveTab, onSelectBook }: EcoLabViewProps) {
  const [meetings] = useState<Meeting[]>(initialMeetings);

  // Track uploaded files per meeting ID
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  // Load submissions from the database on mount
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const subs = await submissionService.getSubmissions();
        const mapped: Record<string, string> = {};
        Object.keys(subs).forEach(key => {
          mapped[key] = subs[key].original_name;
        });
        setUploadedFiles(mapped);
      } catch (err) {
        console.error('Failed to load submissions from database:', err);
      }
    };
    fetchSubmissions();
  }, []);

  // File upload simulation states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const getMeetingIcon = (iconName: string) => {
    switch (iconName) {
      case 'groups': return Users;
      case 'science': return FlaskConical;
      case 'biotech': return Microscope;
      case 'inventory': return Package;
      default: return FlaskConical;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      startUpload(e.target.files[0]);
    }
  };

  const startUpload = async (file: File) => {
    if (!selectedMeeting) return;
    setUploadProgress(0);
    setUploadedFile(file.name);

    // Simulate progress for smooth UI feedback
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    try {
      const submission = await submissionService.uploadSubmission(selectedMeeting.id, file);
      clearInterval(interval);
      setUploadProgress(100);
      setUploadedFiles(prevFiles => ({
        ...prevFiles,
        [selectedMeeting.id]: submission.original_name
      }));
    } catch (err: any) {
      clearInterval(interval);
      setUploadProgress(-1);
      alert(err.message || 'Gagal mengunggah berkas LKM.');
    }
  };

  const handleRemoveFile = async (meetingId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus/mengubah berkas LKM yang diunggah?')) {
      try {
        await submissionService.deleteSubmission(meetingId);
        setUploadedFiles(prev => {
          const copy = { ...prev };
          delete copy[meetingId];
          return copy;
        });
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus berkas LKM.');
      }
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedMeeting(null);
    setUploadProgress(-1);
    setUploadedFile(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">

      {/* Page Header */}
      <header className="text-left">
        <h2 className="font-display font-black text-2xl text-[#154212] mb-2">
          EcoLab — Lembar Kerja Mahasiswa (LKM)
        </h2>
        <p className="font-sans text-sm text-[#42493e] max-w-2xl leading-relaxed">
          Unduh, kerjakan, dan unggah LKM untuk setiap pertemuan proyek ekoenzim Anda. Setiap pengiriman dinilai oleh pengajar.
        </p>
      </header>

      {/* Meeting Timeline Card Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        {meetings.map((meeting) => {
          const IconComponent = getMeetingIcon(meeting.icon);
          const hasUploaded = !!uploadedFiles[meeting.id];
          const fileName = uploadedFiles[meeting.id];

          // Color & Status styling completely driven by whether a file is uploaded
          const isCompleted = hasUploaded;

          return (
            <div 
              key={meeting.id}
              className={`bg-white/95 rounded-2xl p-5 flex flex-col border-t-4 transition-all hover:translate-y-[-4px] hover:shadow-md ${
                isCompleted 
                  ? 'border-[#006e1c]' 
                  : 'border-amber-400 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${isCompleted ? 'bg-emerald-50 text-[#006e1c]' : 'bg-amber-50 text-amber-700'}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1">
                  {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-[#006e1c]" />}
                  <span className={`text-[10px] font-bold uppercase ${isCompleted ? 'text-[#006e1c]' : 'text-amber-700'}`}>
                    MEETING {meeting.number}
                  </span>
                </div>
              </div>

              <h4 className="font-semibold text-sm text-[#154212] mb-1">
                {meeting.title}
              </h4>
              <p className="text-xs text-gray-500 leading-normal mb-6 flex-grow">
                {meeting.description}
              </p>

              {/* File Info Box with Delete/Edit feature if Uploaded */}
              {hasUploaded && (
                <div className="mb-4 p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileText className="w-4 h-4 text-[#006e1c] shrink-0" />
                    <span className="text-[10px] text-emerald-950 font-bold truncate">{fileName}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveFile(meeting.id)}
                    className="p-1 rounded-md text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Hapus / Edit berkas"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Card Actions */}
              <div className="space-y-2 mt-auto">
                <button 
                  onClick={() => {
                    if (onSelectBook) {
                      if (meeting.number === 1 || meeting.number === 2) {
                        onSelectBook('green-chemistry');
                      } else if (meeting.number === 3 || meeting.number === 4) {
                        onSelectBook('ecoenzyme');
                      }
                    }
                    setActiveTab('ecopedia');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 hover:bg-emerald-50 hover:text-emerald-900 transition-colors cursor-pointer"
                >
                  <span>Lihat Buku Materi</span>
                  <BookOpen className="w-4 h-4 text-[#006e1c]" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => { 
                      alert(`Mengunduh Panduan LKM Meeting ${meeting.number}...`);
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border border-gray-200 hover:border-emerald-700 text-gray-600 hover:text-emerald-800 text-[9px] font-bold uppercase transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span className="mt-1">Unduh LKM</span>
                  </button>

                  <button 
                    onClick={() => {
                      setSelectedMeeting(meeting);
                      setShowUploadModal(true);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[9px] font-bold uppercase transition-all cursor-pointer ${
                      hasUploaded 
                        ? 'border-gray-200 text-[#006e1c] hover:bg-emerald-50' 
                        : 'border-amber-250 text-amber-700 bg-amber-50/50 hover:bg-amber-50'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span className="mt-1">{hasUploaded ? 'Unggah Ulang' : 'Unggah'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload File Modal */}
      {showUploadModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#154212] p-5 text-white flex justify-between items-center text-left">
              <div>
                <h4 className="font-display font-bold text-sm">Unggah Lembar Kerja (LKM)</h4>
                <p className="text-[10px] text-[#a1d494]">Meeting {selectedMeeting.number} : {selectedMeeting.title}</p>
              </div>
              <button onClick={closeUploadModal} className="text-white hover:text-[#91f78e]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-left">
              {uploadProgress === -1 ? (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    dragActive ? 'border-[#154212] bg-emerald-50/30' : 'border-gray-200 hover:border-[#154212]'
                  }`}
                >
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <FileText className="w-10 h-10 text-[#72796e] mb-2" />
                    <span className="text-xs font-bold text-gray-700">Tarik berkas LKM ke sini atau klik</span>
                    <span className="text-[9px] text-gray-400 mt-1">Hanya mendukung format PDF, DOCX, atau PPTX (Maks 10MB)</span>
                    <input 
                      type="file" 
                      accept=".pdf,.docx,.doc,.pptx" 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#006e1c] animate-pulse" />
                      {uploadedFile ? uploadedFile : 'Mengunggah laporan penelitian...'}
                    </span>
                    <span className="text-[#006e1c] font-bold">{uploadProgress}%</span>
                  </div>

                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-[#006e1c] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>

                  {uploadProgress === 100 && (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 leading-normal flex items-start gap-2 animate-in fade-in duration-300">
                      <CheckCircle className="w-5 h-5 text-[#006e1c] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-950">Laporan LKM Diterima!</p>
                        <p className="text-gray-600 mt-0.5">Sedang menunggu penilaian pengajar.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button 
                  onClick={closeUploadModal}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  {uploadProgress === 100 ? 'Selesai' : 'Batal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
