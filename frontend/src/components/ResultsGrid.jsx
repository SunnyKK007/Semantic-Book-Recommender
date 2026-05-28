import { motion, AnimatePresence } from 'framer-motion';
import SkeletonCard from './SkeletonCard';
import BookCard from './BookCard';

const ResultsGrid = ({ loading, error, books, hasSearched, searchBooks, setQuery, setCategory, setTone, setSelectedBook }) => {
  return (
    <main style={{ paddingBottom: '100px' }}>
      {/* Loading skeleton */}
      {loading && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 500 }}>
              <span style={{ display: 'inline-block', animation: 'float 2s ease-in-out infinite' }}>🧠</span>
              {' '}Analyzing emotions across book descriptions...
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '60px 20px' }}
        >
          <div className="glass-panel" style={{ display: 'inline-block', padding: '40px 48px', borderRadius: '24px', maxWidth: '420px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
            <p style={{ color: '#f87171', fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Something went wrong</p>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>{error}</p>
            <button
              onClick={searchBooks}
              style={{
                padding: '12px 32px', borderRadius: '9999px', border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🔄 Try Again
            </button>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {!loading && !error && books.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#e2e8f0', marginBottom: '4px', letterSpacing: '-0.02em' }}>
                Recommended for you
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                Found <span style={{ color: '#a78bfa', fontWeight: 700 }}>{books.length}</span> books matching your vibe
              </p>
            </div>
            <div style={{
              padding: '6px 14px', borderRadius: '9999px',
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              fontSize: '12px', fontWeight: 600, color: '#4ade80',
            }}>
              ● Live Results
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            <AnimatePresence mode='wait'>
              {books.map((book, index) => (
                <BookCard
                  key={book.isbn13 + book.title}
                  book={book}
                  index={index}
                  onClick={(b) => setSelectedBook(b)}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* No results */}
      {!loading && !error && books.length === 0 && hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '60px 20px' }}
        >
          <div className="glass-panel" style={{ display: 'inline-block', padding: '40px 48px', borderRadius: '24px', maxWidth: '420px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
            <p style={{ color: '#e2e8f0', fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>No matches found</p>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Try a different query or adjust your filters.</p>
            <button
              onClick={() => { setQuery(''); setCategory('All'); setTone('All'); }}
              style={{
                padding: '10px 24px', borderRadius: '9999px', border: '1px solid rgba(139,92,246,0.3)',
                background: 'transparent', color: '#a78bfa', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Clear Filters
            </button>
          </div>
        </motion.div>
      )}
    </main>
  );
};

export default ResultsGrid;
