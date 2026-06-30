import React, { useState, useEffect } from 'react';
import { BookOpen, Edit, Check, AlertCircle, Loader2, Upload, Plus, Trash2 } from 'lucide-react';
import { Book } from '../../types';

export default function AdminEcopediaView() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Form Fields
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [formFlipUrl, setFormFlipUrl] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);

  // Delete States
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const res = await fetch('/api/upload-image.php', {
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

  const fetchBooks = () => {
    setIsLoading(true);
    setError(null);
    fetch('/api/ecopedia.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.books) {
          const mapped = data.books.map((b: any) => ({
            id: b.id,
            title: b.title,
            coverUrl: b.cover_url || '',
            category: b.category || '',
            tagClass: b.tag_class || '',
            icon: b.icon || '',
            description: b.description || '',
            content: b.content || '',
            pdfUrl: b.pdf_url || '#',
            flipUrl: b.flip_url || ''
          }));
          setBooks(mapped);
        } else {
          setError(data.message || 'Gagal memuat buku.');
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
    fetchBooks();
  }, []);

  const handleOpenAdd = () => {
    setSelectedBook(null);
    setFormId('');
    setFormTitle('');
    setFormCoverUrl('');
    setFormFlipUrl('');
    setSaveSuccess(false);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book: Book) => {
    setSelectedBook(book);
    setFormId(book.id);
    setFormTitle(book.title);
    setFormCoverUrl(book.coverUrl);
    setFormFlipUrl(book.flipUrl || '');
    setSaveSuccess(false);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!selectedBook) {
      // Auto slugify for the ID
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormId(slug);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim()) {
      setSaveError('ID Buku tidak boleh kosong.');
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/ecopedia.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formId,
          title: formTitle,
          flip_url: formFlipUrl,
          cover_url: formCoverUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        fetchBooks();
        setTimeout(() => {
          setIsModalOpen(false);
        }, 1200);
      } else {
        setSaveError(data.message || 'Gagal menyimpan data buku.');
      }
    } catch (err) {
      setSaveError('Terjadi kesalahan jaringan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/ecopedia.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id: bookToDelete.id
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchBooks();
        setBookToDelete(null);
      } else {
        alert(data.message || 'Gagal menghapus buku.');
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
            <BookOpen className="w-7 h-7 text-cyan-600" />
            Kelola Pustaka EcoPedia
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tambah, sunting, dan hapus buku ajar, sampul depan, dan tautan e-book pembelajaran EcoPedia.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Buku Baru</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {books.map((book) => (
            <div key={book.id} className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm flex flex-col md:flex-row gap-5">
              <div className="w-full md:w-1/3 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 select-none">
                <img 
                  src={book.coverUrl} 
                  alt={book.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=80';
                  }}
                />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="inline-block px-2.5 py-0.5 bg-cyan-50 text-cyan-800 border border-cyan-150 text-[10px] font-bold uppercase rounded-md">
                    ID: {book.id}
                  </span>
                  <h4 className="font-display font-bold text-slate-800 text-base leading-snug line-clamp-3">
                    {book.title}
                  </h4>
                  <div className="text-xs text-slate-500 leading-relaxed font-mono truncate max-w-[280px]">
                    <span className="font-sans font-bold text-slate-400">Link E-Book: </span>
                    <a href={book.flipUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">
                      {book.flipUrl || '-'}
                    </a>
                  </div>
                </div>

                <div className="pt-4 mt-auto flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(book)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit Buku</span>
                  </button>
                  <button
                    onClick={() => setBookToDelete(book)}
                    className="p-2 text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                    title="Hapus Buku"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h4 className="font-display font-bold text-sm">
                  {selectedBook ? 'Edit Data Buku Pustaka' : 'Tambah Buku EcoPedia Baru'}
                </h4>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-left">
              {saveSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Buku berhasil disimpan!</span>
                </div>
              )}
              {saveError && (
                <div className="p-4 bg-rose-50 border border-rose-250 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      ID Buku {selectedBook ? '(Statis)' : '(Unik)'}
                    </label>
                    <input 
                      type="text" 
                      required
                      disabled={!!selectedBook}
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      placeholder="Contoh: buku-kimia-lingkungan"
                      className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                        selectedBook 
                          ? 'bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed' 
                          : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Buku</label>
                    <input 
                      type="text" 
                      required
                      value={formTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Masukkan judul buku..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL Cover Buku</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        required
                        value={formCoverUrl}
                        onChange={(e) => setFormCoverUrl(e.target.value)}
                        placeholder="Contoh: ./Cover Buku 1.png atau unggah..."
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
                          onChange={(e) => handleUploadImage(e, 'ecopedia', setFormCoverUrl)} 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tautan / Link E-Book (FlipHTML5)</label>
                  <input 
                    type="text" 
                    required
                    value={formFlipUrl}
                    onChange={(e) => setFormFlipUrl(e.target.value)}
                    placeholder="Contoh: https://online.fliphtml5.com/..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
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
                  <span>{selectedBook ? 'Simpan Perubahan' : 'Tambah Buku'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-sm text-slate-800">Hapus Buku EcoPedia?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus buku <strong>"{bookToDelete.title}"</strong>? Aksi ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
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
