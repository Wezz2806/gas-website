import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Upload, 
  Play, 
  Clock, 
  Info,
  CheckCircle,
  X,
  FileVideo,
  ThumbsUp,
  Eye,
  Calendar,
  User,
  Sparkles,
  Loader2,
  Edit,
  Trash2,
  MessageSquare,
  Send
} from 'lucide-react';
import { videoService, VideoItem, VideoComment } from '@/services/videoService';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const BACKEND_URL = API_BASE.replace(/\/api$/, '') || '';

interface EcoCreationViewProps {
  searchQuery: string;
}

export default function EcoCreationView({ searchQuery }: EcoCreationViewProps) {
  const { user } = useAuth();
  
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Upload Form states
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Sains Rumah');
  const [uploadDuration, setUploadDuration] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Edit Form states
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Sains Rumah');
  const [editDuration, setEditDuration] = useState('');
  const [oldFileDeleted, setOldFileDeleted] = useState(false);
  const [newFileToUpload, setNewFileToUpload] = useState<File | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editProgress, setEditProgress] = useState(-1);

  const uploadFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch videos on mount
  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const data = await videoService.getVideos();
      setVideos(data);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // State for active video comments
  const [videoComments, setVideoComments] = useState<VideoComment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Fetch comments for active video
  const fetchComments = async (videoId: number) => {
    try {
      setIsCommentsLoading(true);
      const data = await videoService.getVideoComments(videoId);
      setVideoComments(data);
    } catch (err) {
      console.error('Failed to load video comments:', err);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeVideo) {
      fetchComments(activeVideo.id);
      setNewCommentText('');
      setEditingCommentId(null);
    } else {
      setVideoComments([]);
    }
  }, [activeVideo]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVideo || !newCommentText.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const comment = await videoService.addVideoComment(activeVideo.id, newCommentText);
      setVideoComments(prev => [comment, ...prev]);
      setNewCommentText('');
      
      // Update comments count in parent list and active modal state
      setVideos(prev => 
        prev.map(v => v.id === activeVideo.id ? { ...v, comments_count: (v.comments_count || 0) + 1 } : v)
      );
      setActiveVideo(prev => prev ? { ...prev, comments_count: (prev.comments_count || 0) + 1 } : null);
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan komentar.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStartEditComment = (comment: VideoComment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveEditComment = async (commentId: number) => {
    if (!editingCommentText.trim() || isSavingEdit) return;

    try {
      setIsSavingEdit(true);
      await videoService.editVideoComment(commentId, editingCommentText);
      setVideoComments(prev => 
        prev.map(c => c.id === commentId ? { ...c, content: editingCommentText } : c)
      );
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah komentar.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return;

    try {
      await videoService.deleteVideoComment(commentId);
      setVideoComments(prev => prev.filter(c => c.id !== commentId));
      
      // Update comments count in parent list and active modal state
      setVideos(prev => 
        prev.map(v => v.id === activeVideo.id ? { ...v, comments_count: Math.max(0, (v.comments_count || 0) - 1) } : v)
      );
      setActiveVideo(prev => prev ? { ...prev, comments_count: Math.max(0, (prev.comments_count || 0) - 1) } : null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus komentar.');
    }
  };

  const formatCommentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const calculateDuration = (file: File, callback: (durStr: string) => void) => {
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoEl.src);
      const durationSecs = videoEl.duration;
      if (!isNaN(durationSecs)) {
        const minutes = Math.floor(durationSecs / 60);
        const seconds = Math.floor(durationSecs % 60);
        callback(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        callback('00:00');
      }
    };
    videoEl.onerror = () => {
      callback('00:00');
    };
    videoEl.src = URL.createObjectURL(file);
  };

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('video/')) {
        setUploadError('File harus berupa video (MP4, MOV, dll.)');
        setSelectedFile(null);
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setUploadError('Ukuran file maksimal adalah 100MB.');
        setSelectedFile(null);
        return;
      }

      setUploadDuration('Calculating...');
      calculateDuration(file, (durStr) => {
        setUploadDuration(durStr);
      });

      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('video/')) {
        setEditError('File harus berupa video (MP4, MOV, dll.)');
        setNewFileToUpload(null);
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setEditError('Ukuran file maksimal adalah 100MB.');
        setNewFileToUpload(null);
        return;
      }

      setEditDuration('Calculating...');
      calculateDuration(file, (durStr) => {
        setEditDuration(durStr);
      });

      setNewFileToUpload(file);
      setEditError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      setUploadError('Judul video wajib diisi.');
      return;
    }
    if (!selectedFile) {
      setUploadError('Pilih file video terlebih dahulu.');
      return;
    }

    try {
      setUploadError(null);
      setUploadProgress(10);
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const finalDuration = uploadDuration === 'Calculating...' ? '00:00' : uploadDuration;

      const newVideo = await videoService.uploadVideo(
        uploadTitle,
        uploadCategory,
        finalDuration || '00:00',
        selectedFile
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setVideos(prev => [newVideo, ...prev]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      closeUploadModal();
    } catch (err: any) {
      setUploadProgress(-1);
      setUploadError(err.message || 'Gagal mengunggah video ke server.');
    }
  };

  const handleEditClick = (e: React.MouseEvent, video: VideoItem) => {
    e.stopPropagation(); // Prevent play
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditCategory(video.category);
    setEditDuration(video.duration);
    setOldFileDeleted(false);
    setNewFileToUpload(null);
    setEditError(null);
    setEditProgress(-1);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    if (!editTitle.trim()) {
      setEditError('Judul video tidak boleh kosong.');
      return;
    }
    if (oldFileDeleted && !newFileToUpload) {
      setEditError('Anda menghapus video lama. Harap pilih file video baru sebelum menyimpan.');
      return;
    }

    try {
      setIsEditing(true);
      setEditError(null);
      setEditProgress(10);

      const progressInterval = setInterval(() => {
        setEditProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const finalDuration = editDuration === 'Calculating...' ? '00:00' : editDuration;

      const updatedVideo = await videoService.editVideo(
        editingVideo.id,
        editTitle,
        editCategory,
        oldFileDeleted && newFileToUpload ? finalDuration : undefined,
        oldFileDeleted && newFileToUpload ? newFileToUpload : undefined
      );

      clearInterval(progressInterval);
      setEditProgress(100);

      // Update state locally
      setVideos(prev => 
        prev.map(v => v.id === editingVideo.id ? { 
          ...v, 
          title: updatedVideo.title, 
          category: updatedVideo.category,
          filename: updatedVideo.filename,
          original_name: updatedVideo.original_name,
          duration: updatedVideo.duration
        } : v)
      );

      closeEditModal();
    } catch (err: any) {
      setEditProgress(-1);
      setEditError(err.message || 'Gagal memperbarui video.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent, videoId: number) => {
    e.stopPropagation();
    if (!window.confirm('Apakah Anda yakin ingin menghapus video ini secara permanen dari galeri EcoCreation?')) {
      return;
    }

    try {
      await videoService.deleteVideo(videoId);
      setVideos(prev => prev.filter(v => v.id !== videoId));
      if (editingVideo && editingVideo.id === videoId) {
        closeEditModal();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus video.');
    }
  };

  const handleLike = async (e: React.MouseEvent, videoId: number) => {
    e.stopPropagation();
    
    setVideos(prev => 
      prev.map(v => v.id === videoId ? { ...v, likes: v.likes + 1 } : v)
    );

    try {
      await videoService.likeVideo(videoId);
    } catch (err) {
      console.error('Failed to like video:', err);
    }
  };

  const handlePlayVideo = async (video: VideoItem) => {
    setActiveVideo(video);
    
    setVideos(prev => 
      prev.map(v => v.id === video.id ? { ...v, views: v.views + 1 } : v)
    );

    try {
      await videoService.trackView(video.id);
    } catch (err) {
      console.error('Failed to track view:', err);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadProgress(-1);
    setSelectedFile(null);
    setUploadTitle('');
    setUploadCategory('Sains Rumah');
    setUploadDuration('');
    setUploadError(null);
  };

  const closeEditModal = () => {
    setEditingVideo(null);
    setEditTitle('');
    setEditCategory('Sains Rumah');
    setEditDuration('');
    setOldFileDeleted(false);
    setNewFileToUpload(null);
    setEditError(null);
    setEditProgress(-1);
  };

  const filteredVideos = videos.filter(v => {
    const term = searchQuery.toLowerCase();
    return (
      v.title.toLowerCase().includes(term) ||
      v.category.toLowerCase().includes(term) ||
      v.student_name.toLowerCase().includes(term)
    );
  });

  const getCategoryGradient = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('sains')) return 'from-[#154212] to-emerald-600';
    if (c.includes('robotik')) return 'from-teal-600 to-[#154212]';
    if (c.includes('teknologi')) return 'from-emerald-700 to-[#006e1c]';
    if (c.includes('lingkungan')) return 'from-[#006e1c] to-emerald-500';
    return 'from-[#154212] to-emerald-700';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">

      {/* Header - Consistent with standard layout */}
      <section className="text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-display font-black text-2xl text-[#154212] mb-1 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#006e1c]" />
              EcoCreation — Galeri Video Siswa
            </h2>
            <p className="text-xs md:text-sm text-[#42493e] max-w-2xl">
              Unggah dan kelola video inovasi lingkungan Anda. Durasi dideteksi otomatis saat memilih berkas. Siswa dapat mengedit judul atau mengganti file videonya kapan saja.
            </p>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-[#006e1c] hover:bg-[#154212] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Karya Video</span>
          </button>
        </div>
      </section>

      {/* Upload success notification */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-5 h-5 text-[#006e1c] shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-bold text-emerald-950">Video berhasil dipublikasikan!</p>
            <p className="text-xs text-gray-600 mt-0.5">Karya Anda sekarang dapat langsung dilihat oleh seluruh siswa di galeri EcoCreation.</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <Loader2 className="w-10 h-10 text-[#006e1c] animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Memuat galeri video...</p>
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const isOwner = user && video.student_id === user.id;

            return (
              <div 
                key={video.id}
                onClick={() => handlePlayVideo(video)}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer text-left flex flex-col h-full relative"
              >
                {/* Cover Preview */}
                <div className="relative h-44 bg-gray-950 flex items-center justify-center overflow-hidden">
                  <video 
                    src={`${API_BASE}/stream-video.php?filename=${video.filename}`}
                    preload="metadata"
                    muted
                    playsInline
                    loop
                    onMouseEnter={(e) => {
                      const playPromise = e.currentTarget.play();
                      if (playPromise !== undefined) {
                        playPromise.catch(() => {});
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent z-[1]"></div>
                  
                  {/* Floating Category Badge */}
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#006e1c] text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wide z-10">
                    {video.category}
                  </span>

                  {/* Edit/Delete Overlays for Owners */}
                  {isOwner && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      <button 
                        onClick={(e) => handleEditClick(e, video)}
                        className="bg-white/95 hover:bg-white text-gray-700 p-1.5 rounded-lg shadow-sm hover:scale-105 transition-all cursor-pointer border border-gray-100"
                        title="Edit Detail Konten"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteClick(e, video.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-sm hover:scale-105 transition-all cursor-pointer"
                        title="Hapus Konten Permanen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-all duration-300 z-10">
                    <div className="w-12 h-12 rounded-full bg-white/95 shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-5 h-5 text-[#006e1c] fill-[#006e1c] translate-x-0.5" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {video.duration && video.duration !== 'Calculating...' && (
                    <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 z-10">
                      <Clock className="w-3.5 h-3.5" />
                      {video.duration}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-gray-800 line-clamp-2 leading-snug group-hover:text-[#006e1c] transition-colors">
                      {video.title}
                    </h3>
                    
                    {/* Meta Uploader */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium line-clamp-1">{video.student_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {new Date(video.submitted_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1" title="Tayangan">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span>{video.views}</span>
                      </span>
                      <span className="flex items-center gap-1" title="Komentar">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span>{video.comments_count || 0}</span>
                      </span>
                    </div>
                    
                    <button 
                      onClick={(e) => handleLike(e, video.id)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#006e1c] font-bold rounded-lg transition-colors cursor-pointer group/like"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 transition-transform group-hover/like:-translate-y-0.5" />
                      <span>{video.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-left">
          <div className="bg-gradient-to-r from-[#154212] to-emerald-700 p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Video className="w-8 h-8 text-[#91f78e]" />
              <h3 className="font-display font-bold text-lg">Galeri Video EcoCreation</h3>
            </div>
            <p className="text-sm text-[#bcf0ae] leading-relaxed">
              Belum ada video dari siswa yang diunggah. Unggah video kreatif Anda untuk berbagi inovasi dengan komunitas GAS!
            </p>
          </div>

          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[280px]">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-[#006e1c]">
              <Play className="w-10 h-10" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-700">Galeri Video Kosong</p>
              <p className="text-sm text-gray-500 mt-1 max-w-md">
                Jadilah siswa pertama yang membagikan karya video kreatif Anda tentang lingkungan atau ekoenzim di sini.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-2 bg-[#154212] hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Unggah Video Pertama
            </button>
          </div>
        </div>
      )}

      {/* Guidelines card */}
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 text-left space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-[#006e1c] shrink-0" />
          <h4 className="font-bold text-sm text-[#154212]">Panduan Unggah Video EcoCreation</h4>
        </div>
        <ul className="space-y-2">
          {[
            'Video harus berkaitan dengan pembelajaran lingkungan, inovasi ramah lingkungan, atau proses pembuatan ekoenzim.',
            'Durasi video dideteksi otomatis saat memilih berkas video (tidak diinput manual).',
            'Format video yang didukung: MP4, MOV, AVI, WEBM, MKV (Maks. 100MB).',
            'Unggahan bersifat instan dan langsung tampil di galeri utama tanpa memerlukan peninjauan guru.',
            'Anda dapat mengedit judul, mengganti berkas video, atau menghapus konten Anda sendiri melalui opsi edit di kartu video.',
          ].map((g, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[#42493e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006e1c] mt-1.5 shrink-0"></span>
              <span>{g}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#154212] p-5 text-white flex justify-between items-center">
              <div>
                <h4 className="font-display font-bold text-sm flex items-center gap-1.5">
                  <Video className="w-4.5 h-4.5" />
                  Unggah Video Baru
                </h4>
                <p className="text-[10px] text-emerald-100">Karya inovasi Anda akan langsung dipublikasikan</p>
              </div>
              <button onClick={closeUploadModal} className="text-white hover:text-emerald-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-left">
              {uploadError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold">
                  {uploadError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Judul Video</label>
                <input 
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Contoh: Panen Ekoenzim Kelompok 3"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#154212] focus:border-[#154212] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Kategori</label>
                <select 
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#154212] focus:border-[#154212] focus:outline-none cursor-pointer"
                >
                  <option>Sains Rumah</option>
                  <option>Teknologi</option>
                  <option>Robotik</option>
                  <option>Lingkungan</option>
                  <option>Komunitas</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">File Video</label>
                {uploadProgress === -1 ? (
                  <label className="border-2 border-dashed border-gray-200 hover:border-[#154212] p-6 text-center rounded-2xl cursor-pointer block transition-colors bg-gray-50">
                    <FileVideo className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <span className="text-xs text-gray-600 font-bold block truncate max-w-full px-2">
                      {selectedFile ? selectedFile.name : 'Pilih file video'}
                    </span>
                    {selectedFile && uploadDuration && (
                      <span className="text-[10px] text-[#006e1c] font-bold block mt-1">
                        Durasi dideteksi: {uploadDuration}
                      </span>
                    )}
                    <span className="block text-[10px] text-gray-400 mt-1">MP4, MOV, AVI, WEBM · Maks 100MB</span>
                    <input 
                      type="file" 
                      ref={uploadFileInputRef}
                      accept="video/*" 
                      onChange={handleUploadFileChange} 
                      className="hidden" 
                    />
                  </label>
                ) : (
                  <div className="space-y-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex justify-between text-xs font-semibold text-emerald-900">
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <FileVideo className="w-4 h-4 text-[#006e1c] shrink-0" />
                        {selectedFile?.name}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-[#154212] rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-emerald-700 block text-center">Sedang memproses & menyimpan berkas...</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={closeUploadModal} 
                  disabled={uploadProgress !== -1}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={uploadProgress !== -1 || uploadDuration === 'Calculating...'}
                  className="px-4 py-2 bg-[#154212] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {uploadProgress !== -1 && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Kirim & Publikasikan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#154212] p-5 text-white flex justify-between items-center">
              <div>
                <h4 className="font-display font-bold text-sm flex items-center gap-1.5">
                  <Edit className="w-4.5 h-4.5" />
                  Edit Detail Konten
                </h4>
                <p className="text-[10px] text-emerald-100">Ubah judul, kategori, atau ganti file video Anda</p>
              </div>
              <button onClick={closeEditModal} className="text-white hover:text-emerald-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-left">
              {editError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Judul Video</label>
                <input 
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#154212] focus:border-[#154212] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Kategori</label>
                <select 
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-[#154212] focus:border-[#154212] focus:outline-none cursor-pointer"
                >
                  <option>Sains Rumah</option>
                  <option>Teknologi</option>
                  <option>Robotik</option>
                  <option>Lingkungan</option>
                  <option>Komunitas</option>
                </select>
              </div>

              {/* Video File Edit Area */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">File Video</label>
                
                {!oldFileDeleted ? (
                  // Show current video file with delete option
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 font-semibold text-gray-700 truncate mr-2">
                      <FileVideo className="w-4 h-4 text-[#006e1c] shrink-0" />
                      <span className="truncate max-w-[150px]">{editingVideo.original_name}</span>
                      <span className="text-[10px] text-gray-400 font-normal">({editDuration})</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setOldFileDeleted(true)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-bold shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </div>
                ) : (
                  // File is deleted, allow uploading a new one while staying in edit view
                  <div>
                    {editProgress === -1 ? (
                      <label className="border-2 border-dashed border-gray-200 hover:border-[#154212] p-5 text-center rounded-2xl cursor-pointer block transition-colors bg-amber-50/50">
                        <FileVideo className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <span className="text-xs text-[#006e1c] font-bold block">
                          {newFileToUpload ? newFileToUpload.name : 'Pilih file video baru'}
                        </span>
                        {newFileToUpload && editDuration && (
                          <span className="text-[10px] text-[#006e1c] font-bold block mt-1">
                            Durasi dideteksi: {editDuration}
                          </span>
                        )}
                        <span className="block text-[10px] text-gray-400 mt-1">MP4, MOV, AVI, WEBM · Maks 100MB</span>
                        <input 
                          type="file" 
                          ref={editFileInputRef}
                          accept="video/*" 
                          onChange={handleEditFileChange} 
                          className="hidden" 
                        />
                      </label>
                    ) : (
                      <div className="space-y-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <div className="flex justify-between text-xs font-semibold text-emerald-900">
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <FileVideo className="w-4 h-4 text-[#006e1c] shrink-0" />
                            {newFileToUpload?.name}
                          </span>
                          <span>{editProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-[#154212] rounded-full transition-all duration-300" 
                            style={{ width: `${editProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={closeEditModal} 
                  disabled={isEditing}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isEditing || (oldFileDeleted && !newFileToUpload) || editDuration === 'Calculating...'}
                  className="px-4 py-2 bg-[#154212] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isEditing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gray-900 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 text-left border border-gray-800">
            {/* Modal Title / Top Bar */}
            <div className="p-4 bg-gray-950 flex justify-between items-center text-white border-b border-gray-800 sticky top-0 z-10">
              <div>
                <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide mr-2">
                  {activeVideo.category}
                </span>
                <span className="font-bold text-xs sm:text-sm">{activeVideo.title}</span>
              </div>
              <button 
                onClick={() => setActiveVideo(null)} 
                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Component */}
            <div className="bg-black aspect-video flex items-center justify-center relative group">
              <video 
                src={`${API_BASE}/stream-video.php?filename=${activeVideo.filename}`} 
                controls 
                autoPlay
                className="w-full h-full object-contain max-h-[70vh]"
              />
            </div>

            {/* Video Uploader Info */}
            <div className="p-5 bg-gray-950 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-[#91f78e] font-bold text-sm shrink-0">
                  {activeVideo.student_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Diunggah oleh siswa</p>
                  <p className="text-sm font-bold text-white">{activeVideo.student_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0 flex-wrap">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {activeVideo.views}x ditonton
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {activeVideo.comments_count || 0} komentar
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {activeVideo.likes} disukai
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(activeVideo.submitted_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="p-6 bg-gray-900 border-t border-gray-800 text-white space-y-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm">Diskusi Karya ({videoComments.length})</h4>
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2 items-center">
                <input 
                  type="text"
                  required
                  placeholder="Tulis komentar atau apresiasi untuk karya ini..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 bg-gray-955 border border-gray-800 text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-gray-500 text-white bg-black/40"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newCommentText.trim()}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                  title="Kirim Komentar"
                >
                  {isSubmittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {isCommentsLoading ? (
                  <div className="py-8 flex justify-center items-center gap-2 text-gray-400 text-xs font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    Memuat komentar...
                  </div>
                ) : videoComments.length > 0 ? (
                  videoComments.map((c) => {
                    const isOwner = user && c.student_id === user.id;
                    const isEditingThis = editingCommentId === c.id;

                    return (
                      <div key={c.id} className="bg-gray-950 rounded-2xl p-4 border border-gray-800 animate-in fade-in duration-200 text-left">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-400">{c.author}</span>
                            {isOwner && (
                              <span className="bg-emerald-950/80 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-800">Anda</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] text-gray-500">{formatCommentDate(c.created_at)}</span>
                            
                            {/* Owner Edit/Delete Controls */}
                            {isOwner && !isEditingThis && (
                              <div className="flex items-center gap-1.5">
                                <button 
                                  onClick={() => handleStartEditComment(c)}
                                  className="text-gray-500 hover:text-emerald-400 p-0.5 rounded transition-colors"
                                  title="Edit Komentar"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteComment(c.id)}
                                  className="text-gray-500 hover:text-rose-400 p-0.5 rounded transition-colors"
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
                              className="flex-1 bg-gray-900 border border-gray-700 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                            />
                            <button 
                              onClick={() => handleSaveEditComment(c.id)}
                              disabled={isSavingEdit || !editingCommentText.trim()}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer disabled:opacity-50 flex items-center justify-center"
                              title="Simpan Perubahan"
                            >
                              {isSavingEdit ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <span className="text-xs font-bold px-1">Simpan</span>
                              )}
                            </button>
                            <button 
                              onClick={handleCancelEditComment}
                              className="text-xs text-gray-400 hover:text-white px-2 py-1.5"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          /* Comment Text */
                          <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {c.content}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-gray-500">
                    Belum ada diskusi untuk video ini. Berikan apresiasi atau pertanyaan Anda!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
