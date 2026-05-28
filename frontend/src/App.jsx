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
  
  // Keep track of the current request to allow cancellation
  const abortControllerRef = useRef(null);
  // Track each request with an ID to prevent stale updates
  const requestIdRef = useRef(0);

  const searchBooks = async (overrideQuery) => {
    const searchQuery = typeof overrideQuery === 'string' ? overrideQuery : query;
    if (!searchQuery) return;
    
    // Cancel any previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    // Track this specific request
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
      
      // Only update state if this is still the latest request
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

  // Automatically re-fetch when category changes (needs new data from API)
  useEffect(() => {
    if (hasSearched && query) {
      searchBooks();
    }
  }, [category]);

  // Sort books by tone on the frontend — instant, no API call needed
  const books = useMemo(() => {
    if (!rawBooks.length) return rawBooks;
    if (!tone || tone === "All") return rawBooks;

    const emotionField = TONE_EMOTION_MAP[tone];
    if (!emotionField) return rawBooks;

    // Create a sorted copy (don't mutate the original)
    return [...rawBooks].sort((a, b) => {
      const scoreA = a[emotionField] || 0;
      const scoreB = b[emotionField] || 0;
      return scoreB - scoreA; // Descending: highest emotion first
    });
  }, [rawBooks, tone]);

  return (
    <div style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
      {/* Animated Background */}
      <div className="mesh-bg" />

      {/* Dot pattern overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 0, opacity: 0.025, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <Navbar />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>

        <header style={{ paddingTop: '140px', paddingBottom: '60px', textAlign: 'center', position: 'relative' }}>
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
        </header>

        {!hasSearched && <HowItWorks />}

        <ResultsGrid 
          loading={loading}
          error={error}
          books={books}
          hasSearched={hasSearched}
          searchBooks={searchBooks}
          setQuery={setQuery}
          setCategory={setCategory}
          setTone={setTone}
          setSelectedBook={setSelectedBook}
        />

        <Footer />
      </div>

      {/* ===== BOOK MODAL ===== */}
      {selectedBook && (
        <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
}

export default App;
