import React from 'react';

const EMOTIONS = [
  { key: "joy", label: "Joy", colorClass: "emerald" },
  { key: "sadness", label: "Sadness", colorClass: "slate" },
  { key: "anger", label: "Anger", colorClass: "rose" },
  { key: "fear", label: "Fear", colorClass: "amber" },
  { key: "surprise", label: "Surprise", colorClass: "sky" },
  { key: "disgust", label: "Disgust", colorClass: "slate" },
  { key: "neutral", label: "Neutral", colorClass: "slate" }
];

const getBgColor = (c) => `bg-${c}-500`;
const getTextColor = (c) => `text-${c}-700`;
const getBadgeBg = (c) => `bg-${c}-100`;
const getBadgeBorder = (c) => `border-${c}-200`;
const getIcon = (c) => {
  if (c === 'emerald') return 'sentiment_very_satisfied';
  if (c === 'slate') return 'sentiment_dissatisfied';
  if (c === 'amber') return 'warning';
  if (c === 'rose') return 'local_fire_department';
  if (c === 'sky') return 'psychology_alt';
  return 'sentiment_neutral';
};

const BookCard = ({ book, onClick }) => {
  const emotionScores = EMOTIONS.map(e => ({
    ...e,
    score: Math.round((book[e.key] || 0) * 100)
  })).sort((a, b) => b.score - a.score);

  const topEmotion = emotionScores[0];
  const secondEmotion = emotionScores[1];

  const c1 = topEmotion.colorClass;
  const c2 = secondEmotion.colorClass;

  const resonanceScore = topEmotion.score > 0 ? topEmotion.score : 85;

  return (
    <div 
      className="group flex flex-col rounded-2xl bg-white p-space-md border border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 cursor-pointer text-left"
      onClick={onClick}
    >
      <div className="relative w-full h-72 rounded-xl overflow-hidden bg-slate-900 border border-slate-100 flex items-center justify-center p-2">
        {book.thumbnail ? (
          <img 
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-700 shadow-md" 
            src={book.thumbnail} 
            alt={book.title} 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
            <span className="material-symbols-outlined text-[40px] mb-2">auto_stories</span>
            <span className="font-label-sm">No Cover</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none"></div>
        
        {/* Affinity Pill */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm border ${getBadgeBorder(c1)} flex items-center gap-1.5`}>
          <span className={`font-label-sm text-xs font-bold ${getTextColor(c1)}`}>{resonanceScore}% Match</span>
        </div>
        
        {/* Genre/Source Tag */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-slate-900 font-label-sm text-xs font-semibold shadow-sm border border-white/60">
          {book.categories || "Fiction"}
        </div>
        
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-600/90 backdrop-blur-sm text-white font-label-sm text-[10px] font-bold shadow-sm uppercase tracking-wider">
          {book.source === 'live' ? 'Live' : 'Offline'}
        </div>
      </div>
      
      <div className="pt-space-md flex flex-col flex-grow">
        <h3 className="font-headline-sm text-xl text-slate-900 font-serif font-semibold line-clamp-1 group-hover:text-slate-700 transition-colors">
          {book.title}
        </h3>
        <span className="font-body-sm text-sm text-slate-700 font-semibold mt-0.5">
          {book.authors || "Unknown Author"} {book.published_year ? `• ${book.published_year}` : ''}
        </span>
        <p className="mt-space-sm font-body-sm text-sm text-slate-600 leading-relaxed line-clamp-3">
          {book.description || "No description available for this volume."}
        </p>
        
        <div className="mt-space-md pt-space-sm flex flex-col gap-1.5 bg-slate-50/50 border border-slate-100/70 p-3 rounded-xl mt-auto">
          <span className="font-label-sm text-[10px] uppercase tracking-wider text-slate-500 font-bold">Mood Analysis</span>
          
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-700">{topEmotion.label}</span>
            <span className={`font-bold ${getTextColor(c1)}`}>{topEmotion.score}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full w-[${topEmotion.score}%] ${getBgColor(c1)}`} style={{ width: `${topEmotion.score}%` }}></div>
          </div>
          
          <div className="flex items-center justify-between text-xs font-medium mt-1">
            <span className="text-slate-700">{secondEmotion.label}</span>
            <span className={`font-bold ${getTextColor(c2)}`}>{secondEmotion.score}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full w-[${secondEmotion.score}%] ${getBgColor(c2)}`} style={{ width: `${secondEmotion.score}%` }}></div>
          </div>
        </div>
        
        <button 
          className="mt-space-md w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-label-sm text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          <span className="material-symbols-outlined text-[18px]">info</span>
          <span>View Details</span>
        </button>
      </div>
    </div>
  );
};

export default BookCard;
