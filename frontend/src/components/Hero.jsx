import React from 'react';

const VIBE_STARTERS = [
  "Dystopian rain with existential tension",
  "Warm autumnal cozy mystery & found family",
  "Slow-burn deep space isolation & dread",
  "Dark academia in gothic archive rooms"
];

const Hero = ({ query, setQuery, searchBooks, hasSearched }) => {
  return (
    <div id="discover" className="relative w-full overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[840px] h-[520px] bg-gradient-to-b from-slate-200/45 via-slate-100/25 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-96 right-[-8%] w-[520px] h-[520px] bg-slate-100/50 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-[1200px] left-[-8%] w-[560px] h-[560px] bg-slate-100/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
      
      <div id="search" className="max-w-7xl mx-auto px-margin-mobile lg:px-margin pt-space-xl pb-space-2xl flex flex-col items-center text-center">
        {/* Vector Engine Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white text-slate-800 border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
          <span className="inline-block w-2 h-2 rounded-full bg-slate-600"></span>
          <span className="font-label-sm text-label-sm tracking-wider uppercase text-slate-600 font-semibold">Vibe-Based Book Search</span>
          <span className="material-symbols-outlined text-[15px] text-slate-600">menu_book</span>
        </div>
        
        {/* Headline */}
        <h1 className="mt-space-lg font-headline-lg text-4xl sm:text-5xl lg:text-[56px] lg:leading-[64px] max-w-4xl text-slate-900 tracking-tight font-serif">
          Find books by{' '}
          <span className="bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent italic">
            emotional atmosphere
          </span>,{' '}
          not just keywords.
        </h1>
        
        {/* Subtitle */}
        <p className="mt-space-md font-body-lg text-lg sm:text-xl text-slate-600 max-w-2xl font-serif leading-relaxed">
          Describe the exact feeling, sensory atmosphere, or narrative tension you crave. Our neural model decomposes your intuition across 7 emotional vectors to retrieve uncanny literary matches.
        </p>
        
        {/* Glassmorphic Search Console */}
        <div className="mt-space-xl w-full max-w-3xl rounded-2xl bg-white p-space-sm shadow-[0_8px_30px_rgba(15,23,42,0.08)] border border-slate-200/70 transition-all duration-300 focus-within:border-slate-500 focus-within:shadow-[0_10px_35px_rgba(15,23,42,0.14)]">
          <div className="flex flex-col gap-space-sm p-space-sm">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-slate-800 mt-3 text-[22px]">explore</span>
              <textarea 
                id="vibe-input" 
                className="w-full bg-transparent border-none outline-none resize-none font-body-md text-base text-slate-900 placeholder:text-slate-400 placeholder:italic focus:outline-none focus:ring-0" 
                placeholder="e.g. A rainy cyberpunk mystery in Tokyo where an aging detective contemplates forgotten memories, synthetic rain, and melancholic jazz..." 
                rows="3"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    searchBooks();
                  }
                }}
              ></textarea>
            </div>
            
            {/* Action bar within search console */}
            <div className="flex flex-wrap items-center gap-3 pt-space-xs border-t border-slate-100 justify-end">
              <button 
                id="search-btn" 
                className="group inline-flex items-center gap-2 px-space-lg py-2.5 rounded-xl bg-slate-900 text-white font-label-lg text-label-lg shadow-md hover:bg-slate-800 hover:shadow-lg transition-all active:scale-[0.98] font-medium"
                onClick={() => {
                  if (!query.trim()) {
                    document.getElementById('vibe-input').focus();
                  } else {
                    searchBooks();
                  }
                }}
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">search</span>
                <span>Discover Books</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Vibe Prompt Starters */}
        {!hasSearched && (
          <div className="mt-space-lg w-full max-w-3xl flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-wider text-slate-500 font-semibold">
              <span className="material-symbols-outlined text-[16px] text-slate-600">lightbulb</span>
              <span>Sample Prompt Vectors</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {VIBE_STARTERS.map((starter) => (
                <button 
                  key={starter}
                  className="vibe-pill"
                  onClick={() => {
                    setQuery(starter);
                    searchBooks(starter);
                  }}
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
