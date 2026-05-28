import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const EXAMPLE_QUERIES = [
  "A dystopian world where books are forbidden",
  "Heartwarming story about unlikely friendships",
  "A lonely detective solving one last case in the rain",
  "Self-improvement through ancient philosophy",
];

const Hero = ({ query, setQuery, searchBooks, hasSearched }) => {
  return (
    <>
      {/* Glowing Orbs */}
      <div style={{ position: 'absolute', left: '15%', top: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', right: '15%', top: '30%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px',
          padding: '6px 16px', borderRadius: '9999px',
          background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
          fontSize: '13px', fontWeight: 600, color: '#c4b5fd',
        }}>
          <Sparkles size={14} /> Powered by AI Emotion Analysis
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900,
          lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.03em',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #c4b5fd, #e9d5ff, #a78bfa, #67e8f9)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Find books by vibe,
          </span>
          <br />
          <span style={{ color: '#475569' }}>
            not just keywords
          </span>
        </h1>

        <p style={{
          fontSize: '18px', maxWidth: '560px', margin: '0 auto 40px',
          color: '#94a3b8', fontWeight: 400, lineHeight: 1.7,
        }}>
          Describe the mood, feeling, or atmosphere you want. Our AI analyzes emotions in book descriptions to find your perfect match.
        </p>
      </motion.div>

      {/* ===== SEARCH BAR ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel"
        style={{
          display: 'flex', alignItems: 'center', maxWidth: '640px', margin: '0 auto',
          padding: '8px', borderRadius: '20px',
        }}
      >
        <input
          type="text"
          aria-label="Search queries"
          placeholder="A cyberpunk detective story with a gloomy atmosphere..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') searchBooks(); }}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: '15px', fontWeight: 500, color: '#e2e8f0', padding: '14px 16px',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={searchBooks}
          style={{
            padding: '12px 28px', borderRadius: '14px', border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: 'white', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.2s', flexShrink: 0,
            boxShadow: '0 4px 15px rgba(139,92,246,0.3)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(139,92,246,0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(139,92,246,0.3)'; }}
        >
          <Sparkles size={16} />
          Search
        </button>
      </motion.div>

      {/* Example queries */}
      {!hasSearched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}
        >
          <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500, padding: '6px 0' }}>Try:</span>
          {EXAMPLE_QUERIES.map((eq) => (
            <button
              key={eq}
              onClick={() => { 
                setQuery(eq); 
                searchBooks(eq);
              }}
              style={{
                padding: '6px 14px', borderRadius: '9999px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                color: '#94a3b8', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.color = '#c4b5fd'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              "{eq}"
            </button>
          ))}
        </motion.div>
      )}
    </>
  );
};

export default Hero;
