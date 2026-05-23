
import { motion } from 'framer-motion';

const BookCard = ({ book }) => {
    // Determine dominant emotion for tag
    const getDominantEmotion = () => {
        const emotions = [
            { name: "Joyful", val: book.joy, color: "text-yellow-200" },
            { name: "Suspense", val: book.fear, color: "text-purple-200" },
            { name: "Sad", val: book.sadness, color: "text-blue-200" },
            { name: "Angry", val: book.anger, color: "text-red-200" },
        ];
        // Filter significant emotions and sort
        const significant = emotions.filter(e => e.val > 0.3).sort((a, b) => b.val - a.val);
        return significant.length > 0 ? significant[0].name : null;
    };

    const emotionTag = getDominantEmotion();
    // Show only category as requested
    const footerText = book.categories;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative h-full group"
        >
            <div
                className="glass-panel p-5 h-full flex flex-col hover:border-violet-500/50 transition-all duration-300 rounded-2xl relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-500/20"
            >
                {/* Shiny gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative aspect-[2/3] mb-5 overflow-hidden rounded-lg bg-slate-800 shadow-2xl group-hover:shadow-violet-500/20 transition-shadow duration-500">
                    <img
                        src={book.thumbnail || "/cover-not-found.jpg"}
                        alt={book.title}
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/200x300?text=No+Cover" }}
                    />
                </div>

                <h3 className="font-bold text-xl leading-tight mb-2 text-violet-300 tracking-tight group-hover:text-cyan-300 transition-colors duration-300 selection:bg-fuchsia-500/30">{book.title}</h3>
                <p className="text-sm text-fuchsia-300 mb-3 font-medium uppercase tracking-wider selection:bg-fuchsia-500/30">{book.authors}</p>
                <p className="text-sm text-slate-300 line-clamp-3 mb-6 flex-grow font-light leading-relaxed selection:bg-fuchsia-500/30">{book.description}</p>

                <div className="mt-auto pt-4 border-t border-white/5">
                    <p className="text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">
                        {footerText}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default BookCard;
