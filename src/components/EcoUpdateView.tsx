import React, { useState, useEffect } from 'react';
import { initialNews } from '../data';
import { NewsArticle } from '../types';
import { 
  Heart, 
  BookMarked, 
  Clock, 
  X,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

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

    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(articleUrl)}`;
    
    fetch(proxyUrl)
      .then(res => {
        if (!res.ok) throw new Error('Proxy error');
        return res.json();
      })
      .then(data => {
        const html = data.contents;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        let foundUrl = '';
        const ogImage = doc.querySelector('meta[property="og:image"]');
        if (ogImage) {
          foundUrl = ogImage.getAttribute('content') || '';
        } else {
          const twitterImage = doc.querySelector('meta[name="twitter:image"]');
          if (twitterImage) {
            foundUrl = twitterImage.getAttribute('content') || '';
          }
        }
        
        if (foundUrl) {
          if (foundUrl.startsWith('/')) {
            const urlObj = new URL(articleUrl);
            foundUrl = `${urlObj.origin}${foundUrl}`;
          }
          setImgSrc(foundUrl);
          sessionStorage.setItem(cacheKey, foundUrl);
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
  searchQuery: string;
}

export default function EcoUpdateView({ searchQuery }: EcoUpdateProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Unggulan');
  const [news, setNews] = useState<NewsArticle[]>(initialNews);
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);

  const categories = ['Unggulan', 'Berita Lokal', 'Berita Global'];

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNews(news.map(art => {
      if (art.id === id) {
        const isLiked = !art.isLiked;
        return { ...art, likes: isLiked ? art.likes + 1 : art.likes - 1, isLiked };
      }
      return art;
    }));
  };

  const handleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNews(news.map(art => {
      if (art.id === id) return { ...art, isSaved: !art.isSaved };
      return art;
    }));
  };

  const filteredNews = news.filter(art => {
    const matchesTab = activeCategory === 'Unggulan' || art.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Category Tabs */}
      <section className="flex gap-3 overflow-x-auto pb-2 scrollbar-none text-left">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#154212] text-white shadow-md'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-[#bcf0ae]/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Article Reader */}
      {readingArticle ? (
        <article className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-md text-left space-y-6">
          <div className="flex justify-between items-center gap-4 flex-wrap border-b border-gray-100 pb-4">
            <button 
              onClick={() => setReadingArticle(null)}
              className="flex items-center gap-2 text-xs font-bold text-[#154212] hover:underline"
            >
              <X className="w-4 h-4" /> Kembali ke Indeks Portal EcoUpdate
            </button>
            <a 
              href={readingArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#154212] hover:bg-emerald-900 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
            >
              Buka Artikel Asli <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <header className="space-y-3">
            <div className="flex gap-3 items-center text-xs">
              <span className="px-3 py-0.5 bg-emerald-100 text-[#006e1c] font-bold rounded-full">
                {readingArticle.category}
              </span>
              <span className="text-gray-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {readingArticle.readTime}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 font-medium">{readingArticle.date}</span>
            </div>
            <h3 className="font-display font-black text-xl md:text-2xl lg:text-3xl text-[#154212] leading-tight">
              {readingArticle.title}
            </h3>
            <p className="text-xs text-gray-400 font-bold block pt-1.5">Penulis Utama: {readingArticle.author}</p>
          </header>

          <main className="text-sm text-gray-700 leading-relaxed space-y-4 border-t border-gray-100 pt-6">
            <p>{readingArticle.content}</p>
            <p className="text-xs text-gray-500 bg-[#F5F5DC]/40 p-4 rounded-xl border border-[#c2c9bb]/30">
              Disclaimer: Seluruh isi berita ini diterbitkan secara eksklusif dalam kerangka platform Green Action for Sustainable (GAS) untuk melatih wawasan kritis siswa.
            </p>
          </main>

          <footer className="pt-4 border-t border-gray-150 flex justify-between items-center text-gray-500 flex-wrap gap-4">
            <div className="flex gap-4">
              <button 
                onClick={(e) => {
                  setNews(news.map(art => {
                    if (art.id === readingArticle.id) {
                      const l = !art.isLiked;
                      const res = { ...art, likes: l ? art.likes + 1 : art.likes - 1, isLiked: l };
                      setReadingArticle(res);
                      return res;
                    }
                    return art;
                  }));
                }}
                className={`flex items-center gap-1 text-xs font-bold ${readingArticle.isLiked ? 'text-red-500' : 'text-gray-500'}`}
              >
                <Heart className={`w-4 h-4 ${readingArticle.isLiked ? 'fill-current' : ''}`} />
                <span>Suka ({readingArticle.likes})</span>
              </button>
              <span className="text-xs flex items-center gap-1 font-semibold">
                <MessageSquare className="w-4 h-4" />
                <span>Komentar ({readingArticle.commentsCount})</span>
              </span>
            </div>
            <button 
              onClick={() => setReadingArticle(null)}
              className="px-4 py-2 bg-[#154212] hover:bg-emerald-900 text-white font-bold text-xs rounded-xl"
            >
              Selesai Membaca & Tutup
            </button>
          </footer>
        </article>
      ) : (
        <>
          {/* Featured Hero Banner */}
          {activeCategory === 'Unggulan' && filteredNews.length > 0 && (
            <section 
              onClick={() => setReadingArticle(filteredNews[0])}
              className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-md group cursor-pointer bg-inverse-surface border border-gray-150"
            >
              <NewsCoverImage 
                articleUrl={filteredNews[0].url} 
                fallbackUrl={filteredNews[0].coverUrl} 
                alt={filteredNews[0].title} 
                className="w-full h-full object-cover opacity-80 group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8 text-left">
                <div className="flex gap-3 mb-2 flex-wrap">
                  <span className="px-3.5 py-1 bg-[#94f990] text-[#002204] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Berita Utama
                  </span>
                  <span className="text-white/80 text-xs font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {filteredNews[0].readTime}
                  </span>
                </div>
                <h2 className="font-display font-black text-base md:text-lg lg:text-2xl text-white max-w-3xl leading-tight mb-2">
                  {filteredNews[0].title}
                </h2>
                <p className="text-xs text-white/70 line-clamp-1 max-w-2xl mb-4 hidden md:block">
                  {filteredNews[0].description}
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setReadingArticle(filteredNews[0]);
                    }}
                    className="px-4 py-2 bg-[#94f990] hover:bg-[#bcf0ae] text-[#002204] font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Baca Ringkasan
                  </button>
                  <a 
                    href={filteredNews[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-sm border border-white/20 active:scale-95"
                  >
                    Buka Artikel Asli <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* News Feed Grid — full width */}
          <section className="text-left">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-display font-bold text-base text-[#154212] flex items-center gap-2">
                <span>Pembaruan Rekomendasi</span>
                <div className="h-1 w-12 bg-[#94f990] rounded-full"></div>
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              {filteredNews.slice(0, 6).map((art) => (
                <article 
                  onClick={() => setReadingArticle(art)}
                  key={art.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col border border-gray-150 cursor-pointer"
                >
                  <div className="relative h-44 overflow-hidden select-none">
                    <NewsCoverImage 
                      articleUrl={art.url} 
                      fallbackUrl={art.coverUrl} 
                      alt={art.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-bold text-[#154212] border border-gray-100 uppercase tracking-wider">
                      {art.category}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <p className="text-[10px] text-gray-400 mb-2 font-medium">{art.date} • {art.readTime}</p>
                    <h4 className="font-semibold text-sm text-[#154212] mb-2 leading-snug group-hover:text-[#006e1c] transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                    <p className="text-xs text-[#42493e] leading-relaxed line-clamp-3 mb-4">
                      {art.description}
                    </p>

                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                      <span className="font-semibold text-[10px] text-[#154212]">Oleh: {art.author}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => handleLike(art.id, e)}
                          className={`p-1.5 hover:bg-gray-100 rounded-full transition-colors ${art.isLiked ? 'text-red-500' : ''}`}
                          title="Sukai Artikel"
                        >
                          <Heart className={`w-4 h-4 ${art.isLiked ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                          onClick={(e) => handleSave(art.id, e)}
                          className={`p-1.5 hover:bg-gray-100 rounded-full transition-colors ${art.isSaved ? 'text-emerald-700' : ''}`}
                          title="Simpan Bacaan"
                        >
                          <BookMarked className="w-4 h-4" />
                        </button>
                        <a 
                          href={art.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-[#154212]"
                          title="Buka Artikel Asli"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredNews.length === 0 && (
              <div className="py-12 bg-white rounded-3xl text-center border text-[#42493e] text-sm">
                Tidak ada berita yang cocok dengan kategori/pencarian ini.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
