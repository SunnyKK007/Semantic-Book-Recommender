import { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import HowItWorks from './components/HowItWorks';
import ResultsGrid from './components/ResultsGrid';
import Footer from './components/Footer';
import BookModal from './components/BookModal';
import './index.css';

const DEFAULT_API_URL = import.meta.env.PROD ? "/api" : "http://localhost:8000";
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, "");

// Tone → emotion field mapping (matches backend TONE_MAP)
const TONE_EMOTION_MAP = {
  "Happy": "joy",
  "Sad": "sadness",
  "Suspenseful": "fear",
  "Angry": "anger",
  "Surprising": "surprise",
  "Romantic": "joy",
  "Inspiring": "joy",
  "Dark": "sadness",
  "Humorous": "joy",
  "Intense": "fear",
  "Relaxing": "neutral",
  "Hopeful": "joy",
  "Melancholic": "sadness",
  "Curious": "surprise",
  "Disturbing": "disgust",
  "Emotional": "sadness",
  "Mysterious": "surprise",
  "Thoughtful": "neutral",
  "Nostalgic": "joy",
};

function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tone, setTone] = useState("All");
  const [rawBooks, setRawBooks] = useState([]); // Unsorted results from API
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);

  const searchBooks = async (overrideQuery) => {
    const searchQuery = typeof overrideQuery === 'string' ? overrideQuery : query;
    if (!searchQuery) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    const thisRequestId = ++requestIdRef.current;

    setLoading(true);
    setRawBooks([]);
    setError(null);
    setHasSearched(true);
    
    try {
      const params = { query: searchQuery };
      if (category !== "All") params.category = category;
      // Don't send tone to backend — we sort client-side now

      const res = await axios.get(`${API_URL}/recommend`, { 
        params,
        signal: controller.signal
      });
      
      if (thisRequestId === requestIdRef.current) {
        setRawBooks(res.data);
        setLoading(false);
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Request canceled", err.message);
      } else if (thisRequestId === requestIdRef.current) {
        console.error(err);
        setError("Couldn't reach the server. Please check your connection and try again.");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (hasSearched && query) {
      searchBooks();
    }
  }, [category]);

  const books = useMemo(() => {
    if (!rawBooks.length) return rawBooks;
    
    let processedBooks = [...rawBooks];

    if (!tone || tone === "All") return processedBooks;

    const emotionField = TONE_EMOTION_MAP[tone];
    if (!emotionField) return processedBooks;

    return processedBooks.sort((a, b) => {
      const scoreA = a[emotionField] || 0;
      const scoreB = b[emotionField] || 0;
      return scoreB - scoreA; // Descending: highest emotion first
    });
  }, [rawBooks, tone]);

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased selection:bg-slate-100 selection:text-slate-900 min-h-screen">
      <Navbar />

      <main className="w-full pt-20 bg-[#faf8ff] min-h-[calc(100vh-160px)]">
        <div className="flex flex-col w-full">
          <Hero 
            query={query} 
            setQuery={setQuery} 
            searchBooks={searchBooks} 
            hasSearched={hasSearched} 
          />
          
          <FilterBar 
            category={category} 
            setCategory={setCategory} 
            tone={tone} 
            setTone={setTone} 
          />

          <ResultsGrid 
            loading={loading}
            error={error}
            books={books}
            hasSearched={hasSearched}
            setSelectedBook={setSelectedBook}
            query={query}
          />
          
          <HowItWorks />
        </div>
      </main>

      <Footer />

      {/* ===== BOOK MODAL ===== */}
      {selectedBook && (
        <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
}

export default App;
