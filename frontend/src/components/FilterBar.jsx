import { Palette, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

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

const FilterBar = ({ category, setCategory, tone, setTone }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      style={{ marginTop: '32px' }}
    >
      {/* Category filter */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', justifyContent: 'center' }}>
          <Palette size={13} color="#64748b" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Genre</span>
        </div>
        <div className="filter-scroll" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tone filter */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', justifyContent: 'center' }}>
          <Heart size={13} color="#64748b" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Emotional Tone</span>
        </div>
        <div className="filter-scroll" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          {TONES.map(t => (
            <button
              key={t}
              className={`filter-pill filter-pill-tone ${tone === t ? 'active' : ''}`}
              onClick={() => setTone(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FilterBar;
