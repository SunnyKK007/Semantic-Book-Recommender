
import React from 'react';
import BookCard from './BookCard';

const ResultsGrid = ({ loading, error, books, hasSearched, setSelectedBook, query }) => {
  if (!hasSearched) return null;

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin mb-space-2xl mt-12">
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700 mb-4"></div>
          <p className="font-body-md text-slate-500">Synthesizing vectors and retrieving resonance matches...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-rose-50 rounded-2xl border border-rose-200">
          <span className="material-symbols-outlined text-rose-500 text-4xl mb-4">error</span>
          <p className="font-headline-sm text-rose-700 font-semibold mb-2">Vector Retrieval Failed</p>
          <p className="font-body-md text-rose-600/80">{error}</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="material-symbols-outlined text-slate-400 text-4xl mb-4">search_off</span>
          <p className="font-headline-sm text-slate-700 font-semibold mb-2">No Resonance Found</p>
          <p className="font-body-md text-slate-500">Adjust your semantic parameters or reduce the threshold.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md mb-space-lg">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-600 animate-ping"></span>
                <span className="font-label-sm text-label-sm tracking-widest uppercase text-slate-700 font-bold">Curated Matches</span>
              </div>
              <h2 className="mt-1 font-headline-lg text-3xl sm:text-4xl text-slate-900 font-serif font-medium">Curated For You</h2>
            </div>
            <div className="flex items-center gap-space-sm text-slate-600 font-body-sm text-sm">
              <span>Query Vector: <span className="text-slate-900 font-medium italic">"{query || 'General Topology'}"</span></span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <div className="hidden md:flex items-center gap-3">
                <span className="text-slate-700 font-semibold bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">{books.length} Matches Found</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {books.map((book, idx) => (
              <BookCard 
                key={book.isbn13 || idx} 
                book={book} 
                onClick={() => setSelectedBook(book)} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsGrid;
