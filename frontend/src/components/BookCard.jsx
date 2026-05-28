
import { motion } from 'framer-motion';

const EMOTION_CONFIG = [
    { name: "Joyful",  key: "joy",     emoji: "🌟", bg: "rgba(234,179,8,0.15)",   border: "rgba(234,179,8,0.4)",   text: "#fde047" },
    { name: "Suspense",key: "fear",    emoji: "😨", bg: "rgba(139,92,246,0.15)",  border: "rgba(139,92,246,0.4)",  text: "#c4b5fd" },
    { name: "Sad",     key: "sadness", emoji: "💧", bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.4)",  text: "#93c5fd" },
    { name: "Angry",   key: "anger",   emoji: "🔥", bg: "rgba(239,68,68,0.15)",   border: "rgba(239,68,68,0.4)",   text: "#fca5a5" },
    { name: "Surprising", key: "surprise", emoji: "✨", bg: "rgba(6,182,212,0.15)", border: "rgba(6,182,212,0.4)", text: "#67e8f9" },
    { name: "Disturbing", key: "disgust",  emoji: "🌑", bg: "rgba(107,114,128,0.15)",border: "rgba(107,114,128,0.4)",text: "#d1d5db" },
];

const NO_COVER_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'><rect width='200' height='300' fill='%231e293b'/><rect x='30' y='40' width='140' height='180' rx='6' fill='%230f172a' stroke='%23334155' stroke-width='2'/><text x='100' y='145' font-family='sans-serif' font-size='13' fill='%2364748b' text-anchor='middle'>No Cover</text><text x='100' y='165' font-size='28' text-anchor='middle' fill='%2364748b'>📖</text></svg>`;

const BookCard = ({ book, index = 0, onClick }) => {
    const getDominantEmotion = () => {
        const candidates = EMOTION_CONFIG
            .map(e => ({ ...e, val: book[e.key] || 0 }))
            .filter(e => e.val > 0.3)
            .sort((a, b) => b.val - a.val);
        return candidates.length > 0 ? candidates[0] : null;
    };

    const dominantEmotion = getDominantEmotion();
    const footerText = book.categories;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="book-card-shell"
            onClick={() => onClick && onClick(book)}
        >
            <div
                className="glass-panel book-card"
            >
                {/* Shiny gradient overlay */}
                <div className="book-card-shine" />

                <div className="book-card-cover-wrap">
                    {dominantEmotion && (
                        <div
                            className="book-emotion-badge"
                            style={{
                                background: dominantEmotion.bg,
                                border: `1px solid ${dominantEmotion.border}`,
                                color: dominantEmotion.text,
                                backdropFilter: 'blur(8px)',
                                fontSize: '11px',
                            }}
                        >
                            <span>{dominantEmotion.emoji}</span>
                            <span>{dominantEmotion.name}</span>
                        </div>
                    )}

                    {/* Rating badge */}
                    {book.average_rating && (
                        <div
                            className="book-rating-badge"
                            style={{
                                background: 'rgba(0,0,0,0.5)',
                                border: '1px solid rgba(234,179,8,0.3)',
                                backdropFilter: 'blur(8px)',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#fde047',
                            }}
                        >
                            <span>⭐</span>
                            <span>{book.average_rating}</span>
                        </div>
                    )}

                    {/* Source badge */}
                    {book.source && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: book.source === 'live' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(168, 162, 158, 0.15)',
                                border: `1px solid ${book.source === 'live' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(168, 162, 158, 0.4)'}`,
                                color: book.source === 'live' ? '#86efac' : '#d6d3d1',
                                backdropFilter: 'blur(8px)',
                                fontSize: '10px',
                                fontWeight: 600,
                                padding: '3px 8px',
                                borderRadius: '12px',
                                zIndex: 10,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            {book.source === 'live' ? '⚡ Live' : '🗄️ Offline'}
                        </div>
                    )}

                    <img
                        src={book.thumbnail || NO_COVER_SVG}
                        alt={book.title}
                        className="book-cover-img"
                        onError={(e) => { e.target.src = NO_COVER_SVG; }}
                    />
                </div>

                <h3 className="book-card-title">{book.title}</h3>
                <p className="book-card-author">{book.authors}</p>
                <p className="book-card-description">{book.description}</p>

                <div className="book-card-footer">
                    <p className="book-card-category">
                        {footerText}
                    </p>
                    <span className="book-card-view">
                        View →
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default BookCard;
