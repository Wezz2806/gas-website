import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Trash2, 
  Loader2, 
  Eye, 
  ThumbsUp, 
  Calendar, 
  User, 
  MessageSquare, 
  Search, 
  Play, 
  X, 
  Film, 
  Heart, 
  MessageCircle, 
  Tv
} from 'lucide-react';
import { videoService, VideoItem, VideoComment } from '@/services/videoService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminEcocreationView() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Active Video Player Modal
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Comments Moderation Modal
  const [commentingVideo, setCommentingVideo] = useState<VideoItem | null>(null);
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Fetch videos
  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await videoService.getVideos();
      setVideos(data);
    } catch (err: any) {
      console.error(err);
      setError('Masalah koneksi jaringan saat memuat galeri video.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle Video Deletion
  const handleDeleteVideo = async (video: VideoItem) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus video "${video.title}" dari ${video.student_name} secara permanen? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      await videoService.deleteVideo(video.id);
      setVideos(prev => prev.filter(v => v.id !== video.id));
      alert('Video berhasil dihapus dari galeri.');
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus video.');
    }
  };

  // Open Comments Modal
  const handleOpenComments = async (video: VideoItem) => {
    setCommentingVideo(video);
    setIsLoadingComments(true);
    try {
      const data = await videoService.getVideoComments(video.id);
      setComments(data);
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil komentar video.');
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Handle Comment Deletion
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Hapus komentar ini secara permanen?')) return;

    try {
      await videoService.deleteVideoComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      // Update comment count in local state
      if (commentingVideo) {
        setVideos(prev => 
          prev.map(v => v.id === commentingVideo.id 
            ? { ...v, comments_count: Math.max(0, (v.comments_count || 0) - 1) } 
            : v
          )
        );
        setCommentingVideo(prev => prev 
          ? { ...prev, comments_count: Math.max(0, (prev.comments_count || 0) - 1) } 
          : null
        );
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus komentar.');
    }
  };

  // Filter Categories
  const categories = ['Semua', 'Sains Rumah', 'Teknologi', 'Robotik', 'Lingkungan', 'Komunitas'];

  // Filter logic
  const filteredVideos = videos.filter(v => {
    const matchesSearch = 
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Semua' || v.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const totalVideos = videos.length;
  const totalViews = videos.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalLikes = videos.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  const totalComments = videos.reduce((acc, curr) => acc + (curr.comments_count || 0), 0);

  return (
    <div className="space-y-10 text-left">
      {/* Header */}
      <header className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-800 flex items-center gap-2">
            <Video className="w-7 h-7 text-cyan-600" />
            Kelola Karya EcoCreation
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Moderasi dan kelola video karya inovasi lingkungan yang diunggah oleh murid.
          </p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-center gap-3 text-rose-800 text-sm animate-in fade-in duration-200">
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-cyan-50 text-cyan-600 rounded-2xl">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Video</span>
            <span className="text-xl font-black text-slate-800 block mt-0.5">{totalVideos}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tayangan</span>
            <span className="text-xl font-black text-slate-800 block mt-0.5">{totalViews}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Suka</span>
            <span className="text-xl font-black text-slate-800 block mt-0.5">{totalLikes}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Komentar</span>
            <span className="text-xl font-black text-slate-800 block mt-0.5">{totalComments}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari judul, murid, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-250 rounded-2xl text-xs focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none text-slate-700"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-cyan-600 text-white shadow-sm' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Video Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className="overflow-x-auto border border-slate-100 rounded-2xl mt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-455 uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">Video</th>
                  <th className="py-3.5 px-4 w-1/3">Judul Karya</th>
                  <th className="py-3.5 px-4">Pengunggah (Murid)</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4 text-center">Tayangan / Suka</th>
                  <th className="py-3.5 px-4 text-center">Komentar</th>
                  <th className="py-3.5 px-4 text-right w-64">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Thumbnail video play button */}
                    <td className="py-4 px-4 text-center">
                      <button 
                        onClick={() => setActiveVideo(video)}
                        className="w-12 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white hover:scale-105 transition-transform cursor-pointer relative overflow-hidden group shadow-sm border border-slate-200"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-cyan-400 group-hover:scale-110 transition-transform" />
                      </button>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-800">
                      <div className="space-y-0.5">
                        <span className="line-clamp-2" title={video.title}>{video.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(video.submitted_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 space-y-0.5">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {video.student_name}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {video.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-slate-600" title="Views">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {video.views}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-600" title="Likes">
                          <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                          {video.likes}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold">
                        {video.comments_count || 0}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenComments(video)}
                          className="px-3 py-1.5 bg-cyan-55 bg-opacity-20 hover:bg-opacity-30 text-cyan-700 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer border border-cyan-100"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Komentar</span>
                        </button>
                        <button
                          onClick={() => setActiveVideo(video)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-150"
                        >
                          <Play className="w-3.5 h-3.5 text-slate-500" />
                          <span>Putar</span>
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer border border-rose-100"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 font-medium">
            Tidak ditemukan karya video yang sesuai dengan kriteria filter.
          </div>
        )}
      </div>

      {/* Video Streaming Modal */}
      {activeVideo && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[99] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-cyan-400" />
                <h4 className="font-display font-bold text-sm truncate max-w-[600px]">
                  {activeVideo.title} — Karya {activeVideo.student_name}
                </h4>
              </div>
              <button 
                onClick={() => setActiveVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="bg-black aspect-video flex items-center justify-center">
              <video 
                src={`${API_BASE}/stream-video.php?filename=${activeVideo.filename}`}
                controls
                autoPlay
                className="w-full h-full max-h-[70vh] object-contain"
              />
            </div>
            
            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100 shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Kategori: <strong>{activeVideo.category}</strong>
              </span>
              <button
                onClick={() => setActiveVideo(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Moderation Modal */}
      {commentingVideo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="font-display font-bold text-sm">
                    Moderasi Komentar Video
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Judul: <strong>{commentingVideo.title}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCommentingVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
              {isLoadingComments ? (
                <div className="flex flex-col items-center justify-center h-full py-12 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                  <span className="text-xs text-gray-500 font-bold">Memuat komentar...</span>
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-4 hover:border-slate-200 transition-colors"
                  >
                    {/* User Avatar */}
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-xs uppercase text-slate-600 border border-slate-200">
                      {comment.avatar_url ? (
                        <img 
                          src={`${API_BASE.replace(/\/api$/, '')}${comment.avatar_url}`}
                          alt={comment.author} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        comment.author.substring(0, 2)
                      )}
                    </div>

                    {/* Content & Metadata */}
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-800">{comment.author}</span>
                          <span className="text-[10px] text-slate-450 block font-medium">
                            {new Date(comment.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        {/* Delete comment button */}
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Komentar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-400 space-y-2">
                  <MessageSquare className="w-10 h-10 opacity-30" />
                  <p className="text-xs font-medium">Belum ada komentar untuk video ini.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-150 shrink-0">
              <button
                onClick={() => setCommentingVideo(null)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
