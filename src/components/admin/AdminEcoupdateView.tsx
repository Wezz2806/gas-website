import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, Edit, Trash2, Check, AlertCircle, Loader2, Upload, Sparkles } from 'lucide-react';
import { NewsArticle } from '../../types';

export default function AdminEcoupdateView() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  
  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Berita Lokal');
  const [formDescription, setFormDescription] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formUrl, setFormUrl] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);

  // Metadata Fetching State
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  const handleFetchMetadata = async () => {
    if (!formUrl || !formUrl.startsWith('http')) {
      alert('Masukkan tautan URL portal berita yang valid terlebih dahulu.');
      return;
    }
    
    setIsFetchingMeta(true);
    try {
      const res = await fetch(`${API_BASE}/fetch-metadata.php?url=${encodeURIComponent(formUrl)}`);
      const data = await res.json();
      if (data.success) {
        if (data.title) setFormTitle(data.title);
        if (data.coverUrl) setFormCoverUrl(data.coverUrl);
        if (data.description) {
          setFormDescription(data.description);
          setFormContent(data.description);
        }
        if (data.author) setFormAuthor(data.author);
      } else {
        alert(data.message || 'Gagal mengambil data berita secara otomatis.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat mengambil data berita.');
    } finally {
      setIsFetchingMeta(false);
    }
  };

  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    moduleType: string,
    callback: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', moduleType);

    try {
      const res = await fetch(`${API_BASE}/upload-image.php`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        callback(data.url);
      } else {
        alert(data.message || 'Gagal mengunggah gambar.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat mengunggah.');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete States
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNews = () => {
    setIsLoading(true);
    setError(null);
    fetch(`${API_BASE}/ecoupdate.php`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.news) {
          const mapped = data.news.map((n: any) => ({
            id: n.id,
            title: n.title,
            category: n.category,
            date: n.date,
            readTime: n.read_time,
            description: n.description,
            content: n.content,
            coverUrl: n.cover_url,
            author: n.author,
            likes: parseInt(n.likes) || 0,
            commentsCount: parseInt(n.comments_count) || 0,
            url: n.url || ''
          }));
          setNews(mapped);
        } else {
          setError(data.message || 'Gagal memuat berita.');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Koneksi internet bermasalah.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleOpenAdd = () => {
    setSelectedArticle(null);
    setFormTitle('');
    setFormCategory('Berita Lokal');
    setFormDescription('');
    setFormContent('');
    setFormCoverUrl('');
    setFormAuthor('');
    setFormUrl('');
    setSaveSuccess(false);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article: NewsArticle) => {
    setSelectedArticle(article);
    setFormTitle(article.title);
    setFormCategory(article.category);
    setFormDescription(article.description);
    setFormContent(article.content);
    setFormCoverUrl(article.coverUrl);
    setFormAuthor(article.author);
    setFormUrl(article.url);
    setSaveSuccess(false);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        id: selectedArticle ? selectedArticle.id : undefined,
        title: formTitle,
        category: formCategory,
        description: formDescription,
        content: formContent,
        cover_url: formCoverUrl,
        author: formAuthor,
        url: formUrl
      };

      const res = await fetch(`${API_BASE}/ecoupdate.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        fetchNews();
        setTimeout(() => {
          setIsModalOpen(false);
        }, 1200);
      } else {
        setSaveError(data.message || 'Gagal menyimpan artikel.');
      }
    } catch (err) {
      setSaveError('Terjadi kesalahan jaringan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/ecoupdate.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id: articleToDelete.id
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchNews();
        setArticleToDelete(null);
      } else {
        alert(data.message || 'Gagal menghapus berita.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <header className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-800 flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-cyan-600" />
            Kelola Portal EcoUpdate
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tambah, sunting, dan hapus artikel atau berita terkait lingkungan di portal murid.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Berita Baru</span>
        </button>
      </header>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
        </div>
      ) : (
        <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Info Cover</th>
                  <th className="py-4 px-6">Judul Berita</th>
                  <th className="py-4 px-6">Kategori</th>
                  <th className="py-4 px-6">Tanggal & Penulis</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {news.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                        <img 
                          src={art.coverUrl} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800 max-w-xs truncate">
                      {art.title}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 bg-cyan-50 text-cyan-800 border border-cyan-100 rounded-md font-bold text-[9px] uppercase">
                        {art.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      <div>{art.date}</div>
                      <div className="text-[10px] font-medium text-slate-400">Oleh: {art.author}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(art)}
                          className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all cursor-pointer"
                          title="Sunting Berita"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setArticleToDelete(art)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          title="Hapus Berita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {news.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      Belum ada berita yang tersedia. Klik tombol di kanan atas untuk membuat berita baru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-cyan-400" />
                <h4 className="font-display font-bold text-sm">
                  {selectedArticle ? 'Edit Artikel Berita' : 'Tambah Berita EcoUpdate Baru'}
                </h4>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-left max-h-[75vh] overflow-y-auto">
              {saveSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Berita berhasil disimpan!</span>
                </div>
              )}
              {saveError && (
                <div className="p-4 bg-rose-50 border border-rose-250 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 space-y-3">
                <label className="block text-xs font-bold text-cyan-800 uppercase">Tautan URL Berita Asli (Auto-Fill)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="Tempel link portal berita (misal: https://news.detik.com/...)"
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    disabled={isFetchingMeta}
                    onClick={handleFetchMetadata}
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isFetchingMeta ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Ambil Data</span>
                  </button>
                </div>
                <p className="text-[10px] text-cyan-700">
                  Tempel URL lalu klik <strong>Ambil Data</strong> untuk mengisi otomatis judul, cover, penulis, dan ringkasan berita.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Berita</label>
                  <input 
                    type="text" 
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Masukkan judul berita..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="Berita Lokal">Berita Lokal</option>
                    <option value="Berita Global">Berita Global</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cover / Foto Berita</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      required
                      value={formCoverUrl}
                      onChange={(e) => setFormCoverUrl(e.target.value)}
                      placeholder="Tautan gambar atau unggah..."
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <label className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                      {isUploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>Unggah</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={isUploading}
                        onChange={(e) => handleUploadImage(e, 'ecoupdate', setFormCoverUrl)} 
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Penulis</label>
                  <input 
                    type="text" 
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="Kosongkan untuk otomatis nama Anda"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Singkat / Intro</label>
                <input 
                  type="text" 
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ringkasan singkat berita 1 kalimat..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Isi Berita Lengkap</label>
                <textarea 
                  rows={6}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Tulis artikel berita secara detail..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{selectedArticle ? 'Simpan Suntingan' : 'Terbitkan Berita'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-sm text-slate-800">Hapus Artikel Berita?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus berita <strong>"{articleToDelete.title}"</strong>? Aksi ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setArticleToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
