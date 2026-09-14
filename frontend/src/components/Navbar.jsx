import React from 'react';

const Navbar = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-[0_1px_6px_rgba(15,23,42,0.04)]">
      <div className="h-16 max-w-7xl mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-gutter">
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-50/70 border border-slate-100 flex items-center justify-center text-slate-700 transition-colors group-hover:bg-slate-600 group-hover:text-white">
              <span className="material-symbols-outlined text-[18px]">auto_stories</span>
            </div>
            <span className="font-headline-sm text-base text-slate-900 tracking-tight font-serif font-semibold">
              BookSense
            </span>
          </a>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors" href="#discover">Discover</a>
          <a className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors" href="#methodology">Methodology</a>
          <a className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors" href="http://localhost:8000/docs" target="_blank" rel="noreferrer">API Docs</a>
        </nav>
        <div className="flex items-center gap-4">
          <a className="hidden sm:inline-flex text-xs font-semibold text-slate-500 hover:text-slate-600 transition-colors" href="http://localhost:8000/docs" target="_blank" rel="noreferrer">API Spec</a>
          <a 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-label-sm text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98]" 
            href="#search"
          >
            <span className="material-symbols-outlined text-[14px]">explore</span>
            <span>Explore</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
