import React, { useState, useEffect } from 'react';
import { initialMeetings } from '../data';
import { Meeting, JournalRow } from '../types';
import { roomService } from '../services/roomService';
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
  Eye,
  ClipboardList
} from 'lucide-react';
import { submissionService } from '../services/submissionService';
import LkmReaderModal from './LkmReaderModal';

interface EcoLabViewProps {
  setActiveTab: (tab: any) => void;
  onSelectBook?: (bookId: string) => void;
  roomId?: number;
}

export default function EcoLabView({ setActiveTab, onSelectBook, roomId }: EcoLabViewProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Track uploaded files per meeting ID
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  // Journal states
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalRows, setJournalRows] = useState<JournalRow[]>([]);
  const [isSavingJournal, setIsSavingJournal] = useState(false);
  const [isLoadingJournal, setIsLoadingJournal] = useState(false);
  const [journalSuccessMessage, setJournalSuccessMessage] = useState<string | null>(null);

  const handleOpenJournal = () => {
    setShowJournalModal(true);
    setIsLoadingJournal(true);
    fetch('/api/sustainability-journal.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.journal) {
          setJournalRows(data.journal);
        } else {
          // Initialize empty journal rows if fails
          const emptyRows = Array.from({ length: 12 }, (_, i) => ({
            row_index: i,
            tanggal: '',
            warna: '',
            aroma: '',
            gas: '',
            alasan: '',
            solusi: ''
          }));
          setJournalRows(emptyRows);
        }
      })
      .catch(() => {
        const emptyRows = Array.from({ length: 12 }, (_, i) => ({
          row_index: i,
          tanggal: '',
          warna: '',
          aroma: '',
          gas: '',
          alasan: '',
          solusi: ''
        }));
        setJournalRows(emptyRows);
      })
      .finally(() => {
        setIsLoadingJournal(false);
      });
  };

  const handleSaveJournal = async () => {
    setIsSavingJournal(true);
    setJournalSuccessMessage(null);
    try {
      const res = await fetch('/api/sustainability-journal.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journal: journalRows })
      });
      const data = await res.json();
      if (data.success) {
        setJournalSuccessMessage('Jurnal monitoring berhasil disimpan!');
        setTimeout(() => setJournalSuccessMessage(null), 3000);
      } else {
        alert(data.message || 'Gagal menyimpan jurnal.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsSavingJournal(false);
    }
  };

  // Load meetings and submissions from the database on mount
  useEffect(() => {
    setIsLoading(true);
    // 1. Fetch meetings (room-specific or global)
    const fetchMeetings = async () => {
      try {
        if (roomId) {
          const roomMeetings = await roomService.getRoomMeetings(roomId);
          setMeetings(roomMeetings.length > 0 ? roomMeetings : initialMeetings);
        } else {
          const res = await fetch('/api/ecolab.php');
          const data = await res.json();
          setMeetings(data.success && data.meetings ? data.meetings : initialMeetings);
        }
      } catch {
        setMeetings(initialMeetings);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeetings();

    // 2. Fetch submissions
    const fetchSubmissions = async () => {
      try {
        const subs = await submissionService.getSubmissions(roomId);
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
  }, [roomId]);

  // File upload simulation states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);
  const [isDeletingDocument, setIsDeletingDocument] = useState(false);
  
  // Document reader state
  const [activeReadingMeeting, setActiveReadingMeeting] = useState<Meeting | null>(null);

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
      const submission = await submissionService.uploadSubmission(selectedMeeting.id, file, roomId);
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

  const handleRemoveFile = (meetingId: string) => {
    setDeletingMeetingId(meetingId);
  };

  const handleConfirmDeleteDocument = async () => {
    if (!deletingMeetingId) return;
    try {
      setIsDeletingDocument(true);
      await submissionService.deleteSubmission(deletingMeetingId);
      setUploadedFiles(prev => {
        const copy = { ...prev };
        delete copy[deletingMeetingId];
        return copy;
      });
      setDeletingMeetingId(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus berkas LKM.');
    } finally {
      setIsDeletingDocument(false);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedMeeting(null);
    setUploadProgress(-1);
    setUploadedFile(null);
  };

  const getLkmEmbedUrl = (meeting: Meeting) => {
    return (meeting as any).embed_url || '';
  };

  const handleDownloadLkm = (meeting: Meeting) => {
    const link = (meeting as any).download_url || '#';
    if (link && link !== '#') {
      window.open(link, '_blank');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">

      {/* Page Header */}
      <header className="text-left">
        <h2 className="font-display font-black text-2xl text-[#154212] mb-2">
          EcoLab — Lembar Kerja Murid (LKM)
        </h2>
        <p className="font-sans text-sm text-[#42493e] max-w-2xl leading-relaxed">
          Mari unduh, lalu kerjakan LKM dari guru, dan unggah scan LKM untuk diunggah pada setiap pertemuan untuk mendapatkan pengalaman belajar yang baru!
        </p>
      </header>

      {/* Jurnal Monitoring Keberlanjutan Banner */}
      <div className="bg-gradient-to-r from-[#154212] to-[#006e1c] text-white rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-left border border-emerald-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl shrink-0">
            <ClipboardList className="w-6 h-6 text-[#91f78e]" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-white">
              Jurnal Monitoring Keberlanjutan
            </h3>
          </div>
        </div>
        <button 
          onClick={handleOpenJournal}
          className="w-full md:w-auto px-5 py-3 bg-white text-[#154212] font-black text-xs rounded-xl shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Isi Jurnal Sekarang</span>
          <Eye className="w-4 h-4 text-[#154212]" />
        </button>
      </div>

      {/* Meeting Timeline Card Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
        {meetings.map((meeting) => {
          const IconComponent = getMeetingIcon(meeting.icon);
          const hasUploaded = !!uploadedFiles[meeting.id];
          const fileName = uploadedFiles[meeting.id];

          // Color & Status styling completely driven by whether a file is uploaded
          const isCompleted = hasUploaded;

          return (
            <div 
              key={meeting.id}
              className={`bg-white/95 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 border-l-4 transition-all hover:translate-y-[-4px] hover:shadow-md ${
                isCompleted 
                  ? 'border-[#006e1c]' 
                  : 'border-amber-400 shadow-sm'
              }`}
            >
              {/* LKM Cover Image (Left side) */}
              <div className="w-full sm:w-32 aspect-[3/4] rounded-xl overflow-hidden relative select-none border border-gray-150/50 bg-gray-50 shrink-0">
                <img 
                  alt={`Cover LKM ${meeting.number}`}
                  src={`./Cover LKM ${meeting.number}.png`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Content (Right side) */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1">
                      {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-[#006e1c]" />}
                      <span className={`text-[10px] font-bold uppercase ${isCompleted ? 'text-[#006e1c]' : 'text-amber-700'}`}>
                        MEETING {meeting.number}
                      </span>
                    </div>
                    <div className={`p-1 rounded-lg ${isCompleted ? 'bg-emerald-50 text-[#006e1c]' : 'bg-amber-50 text-amber-700'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>

                  <h4 className="font-semibold text-sm md:text-base text-[#154212] mb-1 leading-snug truncate">
                    {meeting.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-4 line-clamp-2">
                    {meeting.description}
                  </p>
                </div>

                {/* File Info Box if Uploaded */}
                {hasUploaded && (
                  <div className="mb-3 p-2 bg-emerald-50/70 rounded-xl border border-emerald-100/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-[#006e1c] shrink-0" />
                      <span className="text-[10px] text-emerald-950 font-bold truncate">{fileName}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveFile(meeting.id)}
                      className="p-1 rounded-md text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      title="Hapus / Edit berkas"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex flex-col sm:flex-row gap-2 mt-auto">
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
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 hover:bg-emerald-50 hover:text-emerald-900 transition-colors cursor-pointer"
                  >
                    <span>Buku Materi</span>
                    <BookOpen className="w-3.5 h-3.5 text-[#006e1c]" />
                  </button>

                  <div className="grid grid-cols-3 gap-1.5 shrink-0">
                    <button 
                      onClick={() => setActiveReadingMeeting(meeting)}
                      className="flex flex-col items-center justify-center p-1.5 px-3 rounded-xl border border-gray-200 hover:border-emerald-700 text-gray-600 hover:text-emerald-800 text-[9px] font-bold uppercase transition-all cursor-pointer bg-white"
                      title="Baca LKM"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#006e1c]" />
                      <span className="mt-0.5">Baca</span>
                    </button>

                    <button 
                      onClick={() => handleDownloadLkm(meeting)}
                      className="flex flex-col items-center justify-center p-1.5 px-3 rounded-xl border border-gray-200 hover:border-emerald-700 text-gray-600 hover:text-emerald-800 text-[9px] font-bold uppercase transition-all cursor-pointer bg-white"
                      title="Unduh LKM"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span className="mt-0.5">Unduh</span>
                    </button>

                    <button 
                      onClick={() => {
                        setSelectedMeeting(meeting);
                        setShowUploadModal(true);
                      }}
                      className={`flex flex-col items-center justify-center p-1.5 px-3 rounded-xl border text-[9px] font-bold uppercase transition-all cursor-pointer ${
                        hasUploaded 
                          ? 'border-gray-200 text-[#006e1c] hover:bg-emerald-50 bg-emerald-50/25' 
                          : 'border-amber-250 text-amber-700 bg-amber-50/50 hover:bg-amber-50'
                      }`}
                      title="Unggah LKM"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span className="mt-0.5">{hasUploaded ? 'Re-Up' : 'Unggah'}</span>
                    </button>
                  </div>
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

      {/* Custom Delete Document Confirmation Modal */}
      {deletingMeetingId !== null && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <X className="w-5 h-5 animate-pulse" />
            </div>
            
            <h3 className="font-display font-bold text-base text-gray-900 mb-2">
              Hapus Berkas LKM?
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus berkas LKM yang telah diunggah? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setDeletingMeetingId(null)}
                disabled={isDeletingDocument}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors disabled:opacity-50"
              >
                Batalkan
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDeleteDocument}
                disabled={isDeletingDocument}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingDocument ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LKM Document Reader Modal */}
      {activeReadingMeeting && (
        <LkmReaderModal 
          meeting={activeReadingMeeting} 
          embedUrl={getLkmEmbedUrl(activeReadingMeeting)} 
          onClose={() => setActiveReadingMeeting(null)} 
        />
      )}

      {/* Sustainability Journal Modal */}
      {showJournalModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#154212] p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-6 h-6 text-[#91f78e]" />
                <div>
                  <h4 className="font-display font-bold text-base">Jurnal Monitoring Keberlanjutan</h4>
                  <p className="text-[11px] text-[#a1d494]">Lakukan pengamatan dan isi parameter fisik secara berkala</p>
                </div>
              </div>
              <button 
                onClick={() => setShowJournalModal(false)} 
                className="text-white hover:text-red-400 hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Table (Scrollable) */}
            <div className="flex-1 overflow-auto p-6">
              {isLoadingJournal ? (
                <div className="flex flex-col items-center justify-center h-full py-12 gap-2">
                  <div className="w-8 h-8 border-4 border-[#154212] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-500 font-bold">Memuat data jurnal...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {journalSuccessMessage && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-[#006e1c] text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in duration-250">
                      <CheckCircle className="w-4 h-4 text-[#006e1c]" />
                      <span>{journalSuccessMessage}</span>
                    </div>
                  )}

                  <div className="overflow-x-auto border border-emerald-600 rounded-2xl">
                    <table className="w-full text-xs border-collapse border border-emerald-600 text-left min-w-[900px]">
                      <thead>
                        <tr className="bg-emerald-800 text-white font-bold text-center">
                          <th rowSpan={2} className="border border-emerald-600 p-3 w-36">Tanggal</th>
                          <th colSpan={3} className="border border-emerald-600 p-2">Parameter Fisik yang Diamati</th>
                          <th rowSpan={2} className="border border-emerald-600 p-3 min-w-[220px]">Mengapa hal itu bisa terjadi?</th>
                          <th rowSpan={2} className="border border-emerald-600 p-3 min-w-[220px]">Solusi Lanjutan yang Dilakukan</th>
                        </tr>
                        <tr className="bg-emerald-700 text-white font-bold text-center">
                          <th className="border border-emerald-600 p-2 w-36">Warna</th>
                          <th className="border border-emerald-600 p-2 w-36">Aroma</th>
                          <th className="border border-emerald-600 p-2 w-36">Gas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-600 text-emerald-950 font-sans">
                        {journalRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-emerald-50/30">
                            <td className="border border-emerald-600 p-1">
                              <input 
                                type="text" 
                                placeholder="Hari, DD/MM/YYYY"
                                className="w-full bg-transparent border-0 focus:ring-0 text-xs p-2 text-emerald-950 font-medium outline-none placeholder:text-gray-300"
                                value={row.tanggal}
                                onChange={(e) => {
                                  const updated = [...journalRows];
                                  updated[idx].tanggal = e.target.value;
                                  setJournalRows(updated);
                                }}
                              />
                            </td>
                            <td className="border border-emerald-600 p-1">
                              <input 
                                type="text" 
                                placeholder="Isi warna..."
                                className="w-full bg-transparent border-0 focus:ring-0 text-xs p-2 text-emerald-950 font-medium outline-none placeholder:text-gray-300"
                                value={row.warna}
                                onChange={(e) => {
                                  const updated = [...journalRows];
                                  updated[idx].warna = e.target.value;
                                  setJournalRows(updated);
                                }}
                              />
                            </td>
                            <td className="border border-emerald-600 p-1">
                              <input 
                                type="text" 
                                placeholder="Isi aroma..."
                                className="w-full bg-transparent border-0 focus:ring-0 text-xs p-2 text-emerald-950 font-medium outline-none placeholder:text-gray-300"
                                value={row.aroma}
                                onChange={(e) => {
                                  const updated = [...journalRows];
                                  updated[idx].aroma = e.target.value;
                                  setJournalRows(updated);
                                }}
                              />
                            </td>
                            <td className="border border-emerald-600 p-1">
                              <input 
                                type="text" 
                                placeholder="Isi gas..."
                                className="w-full bg-transparent border-0 focus:ring-0 text-xs p-2 text-emerald-950 font-medium outline-none placeholder:text-gray-300"
                                value={row.gas}
                                onChange={(e) => {
                                  const updated = [...journalRows];
                                  updated[idx].gas = e.target.value;
                                  setJournalRows(updated);
                                }}
                              />
                            </td>
                            <td className="border border-emerald-600 p-1">
                              <textarea 
                                rows={2}
                                placeholder="Tulis penjelasannya di sini..."
                                className="w-full bg-transparent border-0 focus:ring-0 text-xs p-2 text-emerald-950 font-medium outline-none resize-y placeholder:text-gray-300"
                                value={row.alasan}
                                onChange={(e) => {
                                  const updated = [...journalRows];
                                  updated[idx].alasan = e.target.value;
                                  setJournalRows(updated);
                                }}
                              />
                            </td>
                            <td className="border border-emerald-600 p-1">
                              <textarea 
                                rows={2}
                                placeholder="Tulis rencana tindak lanjut di sini..."
                                className="w-full bg-transparent border-0 focus:ring-0 text-xs p-2 text-emerald-950 font-medium outline-none resize-y placeholder:text-gray-300"
                                value={row.solusi}
                                onChange={(e) => {
                                  const updated = [...journalRows];
                                  updated[idx].solusi = e.target.value;
                                  setJournalRows(updated);
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-150 shrink-0">
              <button
                onClick={() => setShowJournalModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={handleSaveJournal}
                disabled={isSavingJournal || isLoadingJournal}
                className="px-5 py-2.5 bg-[#154212] hover:bg-[#006e1c] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
              >
                {isSavingJournal && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                <span>Simpan Jurnal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
