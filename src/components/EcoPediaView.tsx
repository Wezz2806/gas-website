import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { initialBooks } from '../data';
import { 
  BookOpen, 
  Download, 
  ArrowLeft,
  BookMarked
} from 'lucide-react';

interface EcoPediaViewProps {
  searchQuery: string;
  initialBookId?: string | null;
  onClearInitialBook?: () => void;
}

export default function EcoPediaView({ 
  searchQuery, 
  initialBookId = null, 
  onClearInitialBook 
}: EcoPediaViewProps) {
  const [books] = useState<Book[]>(initialBooks);
  const [activeReadingBook, setActiveReadingBook] = useState<Book | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialBookId) {
      const book = books.find(b => b.id === initialBookId);
      if (book) {
        setActiveReadingBook(book);
      }
    }
  }, [initialBookId, books]);

  const handleClose = () => {
    setActiveReadingBook(null);
    if (onClearInitialBook) {
      onClearInitialBook();
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadPDF = (bookTitle: string) => {
    setDownloadSuccessMessage(`Mengunduh PDF "${bookTitle}"... Selesai.`);
    setTimeout(() => {
      setDownloadSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Toast Notification */}
      {downloadSuccessMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-900 border-2 border-[#91f78e] text-white px-5 py-3 rounded-2xl z-50 flex items-center gap-2 shadow-2xl animate-bounce">
          <BookMarked className="w-5 h-5 text-[#91f78e]" />
          <span className="text-xs font-semibold">{downloadSuccessMessage}</span>
        </div>
      )}

      {/* Conditionally render: In-App Book Reader */}
      {activeReadingBook ? (
        <article className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm text-left space-y-6">
          <button 
            onClick={handleClose}
            className="flex items-center gap-2 text-xs font-bold text-[#154212] hover:text-[#006e1c] pb-2 border-b border-gray-100 w-full"
          >
            <ArrowLeft className="w-4 h-4" /> Kembalilah ke Rak Buku EcoPedia
          </button>

          <header className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <img 
              alt={activeReadingBook.title} 
              src={activeReadingBook.coverUrl} 
              referrerPolicy="no-referrer"
              className="w-32 h-44 object-cover rounded-2xl shadow-md border"
            />
            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-50 text-[#006e1c] rounded-full text-[10px] font-bold tracking-wider uppercase">
                {activeReadingBook.category}
              </span>
              <h3 className="font-display font-black text-xl md:text-2xl text-[#154212]">
                {activeReadingBook.title}
              </h3>
              <p className="text-sm text-gray-500 italic max-w-xl">{activeReadingBook.description}</p>
            </div>
          </header>

          <main className="prose text-sm text-gray-700 leading-relaxed pt-4 border-t border-gray-100">
            <h4 className="font-display font-bold text-[#154212] mb-3">Ringkasan Materi Utama</h4>
            <p className="whitespace-pre-wrap">{activeReadingBook.content}</p>
          </main>

          <footer className="pt-4 border-t border-gray-100 flex flex-wrap gap-4 justify-between">
            <button 
              onClick={() => handleDownloadPDF(activeReadingBook.title)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#006e1c] hover:bg-[#154212] text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Unduh Dokumen Pendukung (PDF)
            </button>
            <button 
              onClick={handleClose}
              className="px-4 py-2 text-gray-500 font-semibold text-xs border border-gray-200 hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
            >
              Tutup Bacaan
            </button>
          </footer>
        </article>
      ) : (
        <>
          {/* Main Collection Heading */}
          <header className="text-left">
            <h2 className="font-display font-black text-2xl text-[#154212] mb-2">
              Ruang Belajar EcoPedia
            </h2>
            <p className="font-sans text-sm text-[#42493e] max-w-2xl leading-relaxed">
              Jelajahi koleksi digital pengetahuan keberlanjutan kami yang terkurasi. Dari kimia molekuler hingga solusi eko komunal.
            </p>
          </header>

          {/* Book Collection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredBooks.map((book) => (
              <article 
                key={book.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col md:flex-row group text-left"
              >
                <div className="md:w-2/5 relative overflow-hidden h-56 md:h-auto select-none">
                  <img 
                    alt={`${book.title} Cover`} 
                    src={book.coverUrl} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#154212] opacity-5"></div>
                </div>

                <div className="md:w-3/5 p-6 flex flex-col justify-between">
                  <div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3.5 text-[10px] font-bold tracking-wider uppercase ${book.tagClass}`}>
                      <BookOpen className="w-3.5 h-3.5 text-current" />
                      <span>{book.category}</span>
                    </div>

                    <h3 className="font-display font-bold text-base md:text-lg text-[#154212] mb-2 leading-snug group-hover:text-[#006e1c] transition-colors">
                      {book.title}
                    </h3>
                    
                    <p className="font-sans text-xs text-[#42493e] leading-relaxed mb-6 line-clamp-3">
                      {book.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <button 
                      onClick={() => setActiveReadingBook(book)}
                      className="flex-1 bg-gradient-to-r from-[#154212] to-[#006e1c] text-white py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:shadow-md transition-all active:scale-95 cursor-pointer hover:opacity-90"
                    >
                      <BookMarked className="w-4 h-4 text-[#91f78e]" />
                      <span>Baca Sekarang</span>
                    </button>

                    <button 
                      onClick={() => handleDownloadPDF(book.title)}
                      className="p-2 border-2 border-[#c2c9bb] text-[#154212] rounded-xl hover:bg-gray-100 transition-colors cursor-pointer shrink-0" 
                      title="Unduh PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {filteredBooks.length === 0 && (
              <div className="col-span-2 py-12 bg-white rounded-3xl text-center border text-[#42493e] text-sm">
                Tidak ada modul pustaka/buku yang cocok dengan pencarian: "{searchQuery}"
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
