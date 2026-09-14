import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, BookOpen, Layers } from 'lucide-react';
import { useEffect } from 'react';

const EMOTION_COLORS = {
    joy:      { label: 'Joy',      color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
    sadness:  { label: 'Sadness',  color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    anger:    { label: 'Anger',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    fear:     { label: 'Fear',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    surprise: { label: 'Surprise', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    disgust:  { label: 'Disgust',  color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
    neutral:  { label: 'Neutral',  color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

const NO_COVER_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'><rect width='200' height='300' fill='%23f1f5f9'/><rect x='30' y='40' width='140' height='180' rx='6' fill='%23e2e8f0' stroke='%23cbd5e1' stroke-width='2'/><text x='100' y='145' font-family='sans-serif' font-size='13' fill='%2394a3b8' text-anchor='middle'>No Cover</text></svg>`;

const BookModal = ({ book, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!book) return null;

    const emotions = Object.entries(EMOTION_COLORS)
        .map(([key, config]) => ({
            ...config,
            key,
            value: book[key] || 0,
        }))
        .sort((a, b) => b.value - a.value);

    return (
        <AnimatePresence>
            <motion.div
                className="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="modal-content"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    initial={{ opacity: 0, scale: 0.92, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 30 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header with cover */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            position: 'absolute', inset: 0, height: '200px',
                            background: `linear-gradient(180deg, rgba(15,23,42,0.06) 0%, transparent 100%)`,
                            borderRadius: '24px 24px 0 0',
                        }} />

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            aria-label="Close modal"
                            style={{
                                position: 'absolute', top: '16px', right: '16px', zIndex: 10,
                                background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.05)',
                                borderRadius: '50%', width: '36px', height: '36px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#64748b',
                                transition: 'all 0.2s', backdropFilter: 'blur(4px)'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; e.currentTarget.style.color = '#64748b'; }}
                        >
                            <X size={16} />
                        </button>

                        {/* Book info header */}
                        <div style={{ display: 'flex', gap: '24px', padding: '32px', position: 'relative', zIndex: 1 }}>
                            <img
                                src={book.thumbnail || NO_COVER_SVG}
                                alt={book.title}
                                onError={(e) => { e.target.src = NO_COVER_SVG; }}
                                style={{
                                    width: '140px', height: '210px', objectFit: 'cover',
                                    borderRadius: '12px', flexShrink: 0,
                                    boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                                }}
                            />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h2 style={{
                                    fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0',
                                    color: '#0f172a',
                                    lineHeight: 1.3,
                                }}>{book.title}</h2>
                                <p style={{ color: '#4f46e5', fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    {book.authors}
                                </p>

                                {/* Meta pills */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {book.categories && (
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600,
                                            background: 'rgba(15,23,42,0.1)', border: '1px solid rgba(15,23,42,0.2)', color: '#4f46e5',
                                        }}>
                                            <Layers size={12} /> {book.categories}
                                        </span>
                                    )}
                                    {book.published_year && (
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600,
                                            background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#0891b2',
                                        }}>
                                            <Calendar size={12} /> {book.published_year}
                                        </span>
                                    )}
                                    {book.average_rating && (
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600,
                                            background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', color: '#ca8a04',
                                        }}>
                                            <Star size={12} /> {book.average_rating}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ padding: '0 32px 24px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                            <BookOpen size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                            Description
                        </h3>
                        <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.75, margin: 0 }}>
                            {book.description || 'No description available.'}
                        </p>
                    </div>

                    {/* Emotion Analysis */}
                    <div style={{ padding: '0 32px 32px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                            Mood Analysis
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {emotions.map((emotion) => (
                                <div key={emotion.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: emotion.color, width: '70px', textAlign: 'right' }}>
                                        {emotion.label}
                                    </span>
                                    <div className="emotion-bar-track" style={{ flex: 1 }}>
                                        <div
                                            className="emotion-bar-fill"
                                            style={{
                                                width: `${Math.round(emotion.value * 100)}%`,
                                                background: `linear-gradient(90deg, ${emotion.bg}, ${emotion.color})`,
                                            }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', width: '38px' }}>
                                        {Math.round(emotion.value * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BookModal;
