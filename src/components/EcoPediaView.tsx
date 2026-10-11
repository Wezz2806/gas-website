import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { initialBooks } from '../data';
import { 
  BookOpen, 
  Download, 
  BookMarked
} from 'lucide-react';
import BookReaderModal from './BookReaderModal';

import { roomService } from '../services/roomService';

interface EcoPediaViewProps {
  searchQuery: string;
  initialBookId?: string | null;
  onClearInitialBook?: () => void;
  roomId?: number;
}

export default function EcoPediaView({ 
  searchQuery, 
  initialBookId = null, 
  onClearInitialBook,
  roomId
}: EcoPediaViewProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeReadingBook, setActiveReadingBook] = useState<Book | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    if (roomId) {
      roomService.getRoomEcopedia(roomId)
        .then(data => {
          if (data && data.length > 0) {
            setBooks(data);
          } else {
            setBooks(initialBooks);
          }
        })
        .catch(err => {
          console.error('Error fetching room books:', err);
          setBooks(initialBooks);
        })
        .finally(() => setIsLoading(false));
      return;
    }

    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    fetch(`${API_BASE}/ecopedia.php`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.books) {
          const mappedBooks = data.books.map((b: any) => ({
            id: b.id,
            title: b.title,
            category: b.category || '',
            tagClass: b.tag_class || 'bg-primary-container text-on-primary-fixed',
            icon: b.icon || 'science',
            description: b.description || '',
            content: b.content || '',
            pdfUrl: b.pdf_url || '#',
            flipUrl: b.flip_url || null,
            coverUrl: b.cover_url || ''
          }));
          setBooks(mappedBooks);
        } else {
          setBooks(initialBooks);
        }
      })
      .catch(err => {
        console.error('Error fetching books:', err);
        setBooks(initialBooks);
      })
      .finally(() => setIsLoading(false));
  }, [roomId]);

  useEffect(() => {
    if (initialBookId && books.length > 0) {
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
    (book.description || '').toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Main Collection Heading */}
      <header className="text-left">
        <h2 className="font-display font-black text-2xl text-[#154212] mb-2">
          Ruang Belajar EcoPedia
        </h2>
        <p className="font-sans text-sm text-[#42493e] max-w-2xl leading-relaxed">
          Jelajahi pengetahuan mengenai green chemistry dan eco enzyme sebagai wujud aksi nyata keberlanjutan bagi lingkungan
        </p>
      </header>

      {/* Book Collection Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-[#154212] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
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
                  <h3 className="font-display font-bold text-base md:text-lg text-[#154212] mb-6 leading-snug group-hover:text-[#006e1c] transition-colors">
                    {book.title}
                  </h3>
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
      )}

      {/* Book Reader Modal */}
      {activeReadingBook && (
        <BookReaderModal 
          book={activeReadingBook} 
          onClose={handleClose} 
        />
      )}
    </div>
  );
}
