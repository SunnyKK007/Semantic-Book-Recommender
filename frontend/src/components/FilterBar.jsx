import React from 'react';

const CATEGORIES = [
  "All", "Fiction", "Nonfiction", "Mystery", "Thriller", "Horror", "Sci-Fi", "Fantasy",
  "Romance", "Adventure", "Drama", "Comedy", "History", "Biography", "Memoir",
  "Business", "Self-Help", "Psychology", "Philosophy", "Science", "Technology",
  "Health", "Cooking", "Travel", "Art", "Music", "Sports", "Poetry", "Comics",
  "Children", "Young Adult", "Religion", "True Crime"
];

const TONES = [
  "All", "Happy", "Sad", "Angry", "Hopeful", "Inspiring", "Romantic",
  "Humorous", "Dark", "Suspenseful", "Emotional", "Mysterious", "Thoughtful", "Nostalgic"
];

const getToneColor = (tone) => {
  if (["Happy", "Hopeful", "Inspiring", "Romantic", "Humorous"].includes(tone)) return "bg-emerald-500";
  if (["Sad", "Emotional", "Nostalgic", "Dark"].includes(tone)) return "bg-slate-600";
  if (["Angry"].includes(tone)) return "bg-rose-500";
  if (["Suspenseful", "Intense"].includes(tone)) return "bg-amber-500";
  if (["Mysterious", "Surprising", "Curious"].includes(tone)) return "bg-sky-500";
  return "bg-slate-400";
};

const FilterBar = ({ category, setCategory, tone, setTone }) => {

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin mb-space-2xl mt-12">
      <div className="rounded-[24px] bg-white/70 backdrop-blur-xl p-space-xl shadow-[0_8px_32px_rgba(15,23,42,0.06)] border border-white/80 text-left relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col gap-space-xl relative z-10">
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-5 bg-gradient-to-b from-slate-500 to-slate-800 rounded-full shadow-sm"></span>
              <span className="font-label-sm text-[11px] tracking-[0.2em] uppercase text-slate-800 font-bold">Literary Genre</span>
              <span className="w-1.5 h-5 bg-gradient-to-b from-slate-500 to-slate-800 rounded-full shadow-sm"></span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`genre-chip ${category === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent"></div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-5 bg-gradient-to-b from-slate-700 to-slate-900 rounded-full shadow-sm"></span>
              <span className="font-label-sm text-[11px] tracking-[0.2em] uppercase text-slate-800 font-bold">Emotion Polar</span>
              <span className="w-1.5 h-5 bg-gradient-to-b from-slate-700 to-slate-900 rounded-full shadow-sm"></span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
              {TONES.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`mood-chip ${tone === t ? 'active' : ''}`}
                >
                  {t !== "All" && (
                    <span className={`w-2 h-2 rounded-full ${getToneColor(t)} shadow-sm`}></span>
                  )}
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>
      </div>
    </div>
    </div>
  );
};

export default FilterBar;
