import { useState } from 'react';
import axios from 'axios';
import { Search, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookCard from './components/BookCard';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tone, setTone] = useState("All");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchBooks = async () => {
    if (!query) return;
    setLoading(true);
    setBooks([]);
    setHasSearched(true);
    try {
      const params = { query };
      if (category !== "All") params.category = category;
      if (tone !== "All") params.tone = tone;

      const res = await axios.get(`${API_URL}/recommend`, { params });
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Animated Background */}
      <div className="mesh-bg" />

      {/* Overlay Pattern */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <header className="py-32 text-center flex flex-col items-center justify-center min-h-[60vh] relative">


          {/* Glowing Orbs */}
          <div className="absolute left-1/4 top-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute right-1/4 bottom-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute left-1/3 bottom-1/3 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 relative z-10"
          >
            <div className="absolute -inset-10 bg-violet-600/20 blur-3xl rounded-full animate-float opacity-50" />
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/10 backdrop-blur-sm relative z-10 inline-block mb-6">
              <BookOpen className="w-10 h-10 text-violet-400" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight tracking-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 drop-shadow-[0_0_40px_rgba(139,92,246,0.4)]">
              Semantic Book Recommender
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl max-w-2xl mx-auto font-light leading-relaxed tracking-wide mb-12"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-300 via-violet-200 to-slate-300">Discover your next obsession through the power of </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 font-medium">AI emotion analysis</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-300 via-violet-200 to-slate-300">.</span>
          </motion.p>

          {/* Search Bar - Hero Placement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-7xl"
          >
            <div className="glass-panel p-8 pl-12 rounded-[3rem] flex items-start gap-6 transition-all focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500/50 hover:border-white/20 relative">
              <Search className="text-slate-400 w-12 h-12 flex-shrink-0 mt-4" />

              <textarea
                placeholder="Describe the vibe, plot, or feeling you want...&#10;(e.g., 'A cyberpunk detective story with a gloomy atmosphere and a twist ending')"
                className="w-full bg-transparent border-none focus:ring-0 text-2xl font-medium placeholder-slate-500 h-48 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] resize-none py-4 leading-relaxed scrollbar-hide"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    searchBooks();
                  }
                }}
              />

              <button
                onClick={searchBooks}
                className="self-end mb-2 px-12 h-16 rounded-2xl font-bold text-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 group flex-shrink-0"
                style={{
                  background: 'linear-gradient(145deg, #22c55e, #16a34a)',
                  color: 'white',
                  boxShadow: '0 10px 25px rgba(34, 197, 94, 0.5), 0 6px 10px rgba(0,0,0,0.3), inset 0 3px 0 rgba(255,255,255,0.2), inset 0 -3px 0 rgba(0,0,0,0.2)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  transform: 'translateY(0)',
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(3px)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Sparkles className="w-8 h-8 group-hover:animate-pulse" />
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-green-100 filter drop-shadow-sm">Find</span>
              </button>
            </div>

            {/* Filters Row */}
            <div className="flex gap-8 mt-32 justify-center">
              <select
                className="bg-slate-800/80 border-2 border-violet-500/40 rounded-full px-8 py-4 text-violet-400 text-lg font-bold hover:bg-slate-700/80 hover:border-violet-400 transition-all focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 appearance-none cursor-pointer shadow-lg tracking-wide drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="All">All Category</option>
                <option value="Fiction">Fiction</option>
                <option value="Nonfiction">Nonfiction</option>
                <option value="Mystery">Mystery</option>
                <option value="Thriller">Thriller</option>
                <option value="Horror">Horror</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Romance">Romance</option>
                <option value="Adventure">Adventure</option>
                <option value="Drama">Drama</option>
                <option value="Comedy">Comedy</option>
                <option value="History">History</option>
                <option value="Biography">Biography</option>
                <option value="Memoir">Memoir</option>
                <option value="Business">Business</option>
                <option value="Self-Help">Self-Help</option>
                <option value="Psychology">Psychology</option>
                <option value="Philosophy">Philosophy</option>
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="Health">Health</option>
                <option value="Cooking">Cooking</option>
                <option value="Travel">Travel</option>
                <option value="Art">Art</option>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Poetry">Poetry</option>
                <option value="Comics">Comics</option>
                <option value="Children">Children</option>
                <option value="Young Adult">Young Adult</option>
                <option value="Religion">Religion</option>
                <option value="True Crime">True Crime</option>
              </select>

              <select
                className="bg-slate-800/80 border-2 border-fuchsia-500/40 rounded-full px-8 py-4 text-fuchsia-400 text-lg font-bold hover:bg-slate-700/80 hover:border-fuchsia-400 transition-all focus:outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30 appearance-none cursor-pointer shadow-lg tracking-wide drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="All">All Tone</option>
                <option value="Happy">Happy</option>
                <option value="Sad">Sad</option>
                <option value="Angry">Angry</option>
                <option value="Hopeful">Hopeful</option>
                <option value="Inspiring">Inspiring</option>
                <option value="Romantic">Romantic</option>
                <option value="Humorous">Humorous</option>
                <option value="Dark">Dark</option>
                <option value="Suspenseful">Suspenseful</option>
                <option value="Emotional">Emotional</option>
                <option value="Mysterious">Mysterious</option>
                <option value="Thoughtful">Thoughtful</option>
                <option value="Nostalgic">Nostalgic</option>
              </select>
            </div>
          </motion.div>
        </header>

        <main className="pb-32 mt-24">
          {/* Results Grid */}
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-400 rounded-full animate-spin mb-6" />
              <p className="text-slate-400 text-lg animate-pulse">Consulting the neural network...</p>
            </div>
          ) : (
            <>
              {books.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-32 mb-16 pt-16 border-t border-white/10"
                >
                  <div className="flex items-center justify-center gap-6">
                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-violet-500 to-transparent rounded-full" />
                    <h2 className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-400 text-4xl font-bold tracking-wide">
                      Recommended Books
                    </h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-violet-500 to-transparent rounded-full" />
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 perspective-container">
                <AnimatePresence mode='wait'>
                  {books.map((book) => (
                    <BookCard key={book.isbn13 + book.title} book={book} />
                  ))}
                </AnimatePresence>
              </div>

              {!loading && books.length === 0 && hasSearched && (
                <div className="text-center py-20 glass-panel rounded-3xl max-w-md mx-auto">
                  <p className="text-slate-400 text-lg">No matches found in our library.</p>
                  <button onClick={() => setQuery('')} className="mt-4 text-violet-400 hover:text-violet-300 font-medium">Clear Search</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
