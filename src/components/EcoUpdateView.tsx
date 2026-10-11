import React, { useState, useEffect } from 'react';
import { initialNews } from '../data';
import { NewsArticle } from '../types';
import { 
  X,
  ExternalLink,
  Newspaper,
  Calendar,
  User,
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

interface NewsCoverImageProps {
  articleUrl: string;
  fallbackUrl: string;
  alt: string;
  className?: string;
}

function NewsCoverImage({ articleUrl, fallbackUrl, alt, className }: NewsCoverImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(fallbackUrl);

  useEffect(() => {
    if (!articleUrl) return;

    // Simple session cache to avoid duplicate fetches
    const cacheKey = `news_cover_${articleUrl}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setImgSrc(cached);
      return;
    }

    const scraperUrl = `${API_BASE}/get-news-cover.php?url=${encodeURIComponent(articleUrl)}`;
    
    fetch(scraperUrl)
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        if (data && data.image) {
          setImgSrc(data.image);
          sessionStorage.setItem(cacheKey, data.image);
        }
      })
      .catch(() => {
        // Fallback is already set
      });
  }, [articleUrl, fallbackUrl]);

  return (
    <img 
      alt={alt} 
      src={imgSrc} 
      referrerPolicy="no-referrer"
      className={className}
      onError={() => {
        if (imgSrc !== fallbackUrl) {
          setImgSrc(fallbackUrl);
        }
      }}
    />
  );
}

interface EcoUpdateProps {
  searchQuery?: string;
}

export default function EcoUpdateView({ searchQuery = '' }: EcoUpdateProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/ecoupdate.php`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.news && data.news.length > 0) {
          const mappedNews = data.news.map((n: any) => ({
            id: String(n.id),
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
          setNews(mappedNews);
        } else {
          setNews(initialNews);
        }
      })
      .catch(err => {
        console.error('Error fetching news:', err);
        setNews(initialNews);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const categories = ['Semua', 'Berita Lokal', 'Berita Global'];

  const filteredNews = news.filter(art => {
    const matchesTab = activeCategory === 'Semua' || art.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300 text-left">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-[#f4fbe9] to-[#F5F5DC] p-6 sm:p-8 rounded-3xl border border-[#c2c9bb]/40 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#006e1c] font-bold text-xs uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5" />
              EcoUpdate Warta Lingkungan
            </span>
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-[#154212] tracking-tight">
            Kabar Terkini Sains & Kimia Hijau
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Perluas wawasan keberlanjutan bumi melalui kurasi berita aksi lingkungan, riset ekoenzim terbaru, dan terobosan green chemistry dari berbagai penjuru dunia.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <section className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#154212] text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-emerald-50/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Article Reader Modal / Full View */}
      {readingArticle ? (
        <article className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-md text-left space-y-6">
          <div className="flex justify-between items-center gap-4 flex-wrap border-b border-stone-100 pb-4">
            <button 
              onClick={() => setReadingArticle(null)}
              className="flex items-center gap-2 text-xs font-bold text-[#154212] hover:underline cursor-pointer"
            >
              <X className="w-4 h-4" /> Kembali ke Portal Berita
            </button>
            {readingArticle.url && (
              <a 
                href={readingArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                Buka Artikel Sumber <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <header className="space-y-3">
            <div className="flex gap-3 items-center text-xs">
              <span className="px-3 py-0.5 bg-emerald-100 text-[#006e1c] font-bold rounded-full">
                {readingArticle.category}
              </span>
              <span className="text-stone-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {readingArticle.date}
              </span>
              {readingArticle.readTime && (
                <span className="text-stone-400 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {readingArticle.readTime}
                </span>
              )}
            </div>
            <h3 className="font-display font-black text-xl md:text-2xl lg:text-3xl text-[#154212] leading-tight">
              {readingArticle.title}
            </h3>
            {readingArticle.author && (
              <p className="text-xs text-stone-400 font-bold block pt-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Penulis: {readingArticle.author}
              </p>
            )}
          </header>

          <main className="text-sm text-stone-700 leading-relaxed space-y-4 border-t border-stone-100 pt-6">
            <div className="whitespace-pre-line leading-relaxed text-stone-700 text-sm">
              {readingArticle.content}
            </div>
            <div className="text-xs text-stone-500 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/60 mt-6 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p>
                <strong>Catatan Edukasi:</strong> Artikel ini dikurasi secara khusus di platform Green Action for Sustainability (GAS) sebagai referensi literasi wawasan lingkungan hidup dan pendukung proyek pembelajaran murid.
              </p>
            </div>
          </main>

          <footer className="pt-4 border-t border-stone-100 flex justify-end items-center flex-wrap gap-4">
            <button 
              onClick={() => setReadingArticle(null)}
              className="px-5 py-2.5 bg-[#154212] hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Selesai Membaca & Tutup
            </button>
          </footer>
        </article>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-3xl border border-stone-100">
          <div className="w-8 h-8 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Featured Hero Banner */}
          {activeCategory === 'Semua' && filteredNews.length > 0 && (
            <section 
              onClick={() => setReadingArticle(filteredNews[0])}
              className="relative w-full aspect-[21/9] min-h-[220px] rounded-3xl overflow-hidden shadow-sm group cursor-pointer bg-stone-900 border border-stone-200"
            >
              <NewsCoverImage 
                articleUrl={filteredNews[0].url} 
                fallbackUrl={filteredNews[0].coverUrl} 
                alt={filteredNews[0].title} 
                className="w-full h-full object-cover opacity-80 group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent flex flex-col justify-end p-6 md:p-8 text-left">
                <div className="flex gap-2.5 mb-2 flex-wrap">
                  <span className="px-3.5 py-1 bg-emerald-400 text-emerald-950 text-[10px] font-black rounded-full uppercase tracking-wider">
                    Sorotan Warta
                  </span>
                  <span className="text-white/70 text-xs flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {filteredNews[0].date}
                  </span>
                </div>
                <h2 className="font-display font-black text-base md:text-lg lg:text-2xl text-white max-w-3xl leading-tight mb-2">
                  {filteredNews[0].title}
                </h2>
                <p className="text-xs text-white/80 line-clamp-2 max-w-2xl mb-4 hidden sm:block leading-relaxed">
                  {filteredNews[0].description}
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setReadingArticle(filteredNews[0]);
                    }}
                    className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Baca Ringkasan</span>
                  </button>
                  {filteredNews[0].url && (
                    <a 
                      href={filteredNews[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-sm border border-white/25 active:scale-95 cursor-pointer"
                    >
                      <span>Artikel Sumber</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* News Feed Grid */}
          <section className="text-left space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-base text-[#154212] flex items-center gap-2">
                <span>Daftar Artikel & Warta</span>
                <div className="h-1 w-10 bg-emerald-400 rounded-full"></div>
              </h4>
              <span className="text-xs font-semibold text-stone-500">
                {filteredNews.length} Berita
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {(activeCategory === 'Semua' ? filteredNews.slice(1) : filteredNews).map((art) => (
                <article 
                  onClick={() => setReadingArticle(art)}
                  key={art.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col border border-stone-200/80 cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden select-none bg-stone-100">
                    <NewsCoverImage 
                      articleUrl={art.url} 
                      fallbackUrl={art.coverUrl} 
                      alt={art.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-bold text-[#154212] border border-stone-200 uppercase tracking-wider">
                      {art.category}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <p className="text-[11px] text-stone-400 mb-2 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>{art.date}</span>
                      {art.author && <span>• {art.author}</span>}
                    </p>
                    <h4 className="font-display font-bold text-sm text-[#154212] mb-2 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 mb-4">
                      {art.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-stone-100 flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setReadingArticle(art);
                        }}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-xs active:scale-95 text-center cursor-pointer flex items-center justify-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Baca Ringkasan</span>
                      </button>
                      {art.url && (
                        <a 
                          href={art.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95 text-center border border-stone-200 cursor-pointer"
                        >
                          <span>Artikel Asli</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredNews.length === 0 && (
              <div className="py-16 bg-white rounded-3xl text-center border border-stone-200 text-stone-500 text-xs space-y-2">
                <Newspaper className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="font-bold text-stone-700">Tidak ada berita yang ditemukan</p>
                <p className="text-stone-400">Coba ubah kata kunci pencarian atau kategori filter.</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
