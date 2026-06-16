import React, { useState } from 'react';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { Book } from '../types';

interface BookReaderModalProps {
  book: Book;
  onClose: () => void;
}

export default function BookReaderModal({ book, onClose }: BookReaderModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!book.flipUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 md:p-6 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-150 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <header className="bg-[#154212] px-6 py-4 text-white flex justify-between items-center text-left shrink-0">
          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 bg-emerald-100/20 text-[#91f78e] text-[9px] font-bold uppercase tracking-wider rounded-full">
              {book.category}
            </span>
            <h3 className="font-display font-bold text-sm sm:text-base leading-tight">
              {book.title}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Tutup Buku"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content Body (Iframe) */}
        <div className="flex-1 bg-gray-100 relative min-h-0">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/90 text-gray-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#006e1c]" />
              <span className="text-xs font-semibold">Memuat Buku Ajar Digital...</span>
            </div>
          )}

          <iframe
            src={book.flipUrl}
            title={book.title}
            className="w-full h-full border-none"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          ></iframe>
        </div>

        {/* Footer */}
        <footer className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <p className="text-[10px] text-gray-400 font-medium hidden sm:block">
            Membaca modul interaktif via FlipHTML5
          </p>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <a
              href={book.flipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#154212] font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di Tab Baru</span>
            </a>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
