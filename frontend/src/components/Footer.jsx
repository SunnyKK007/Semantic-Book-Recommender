import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200/80 py-space-2xl mt-space-2xl">
      <div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin flex flex-col md:flex-row items-center justify-between gap-space-lg">
        <div className="flex flex-col items-center md:items-start gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="font-label-lg text-label-lg text-slate-900 font-semibold">Built by Sunny Kant Kumar</span>
          </div>
          <p className="font-body-sm text-sm text-slate-500">
            Finding your next favorite book by matching your exact mood and emotional vibe.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-space-lg">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
            <span className="font-label-sm text-xs text-slate-600 font-medium">Python • FastAPI • ChromaDB • Transformers</span>
          </div>
          <a className="font-label-sm text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors" href="http://localhost:8000/docs" target="_blank" rel="noreferrer">API Documentation</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
