from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas import Book
from data.data_processor import DataProcessor
from langchain_chroma import Chroma
import pandas as pd
import time
import threading

router = APIRouter()

# --- Simple in-memory cache (TTL = 10 minutes) ---
_cache: dict = {}
_cache_lock = threading.Lock()
CACHE_TTL = 600  # seconds
MAX_CACHE_SIZE = 1000

def _clean_cache():
    """Remove expired items or clear if size exceeds limit."""
    now = time.time()
    expired = [k for k, v in _cache.items() if (now - v["ts"]) > CACHE_TTL]
    for k in expired:
        _cache.pop(k, None)
    if len(_cache) > MAX_CACHE_SIZE:
        _cache.clear()

# Initialize Processor to get embedding function
# In a production app, we might use dependency injection or a singleton
processor = DataProcessor(persist_directory="./chroma_db")

# Initialize Chroma for reading
db_books = Chroma(
    embedding_function=processor.embedding_function, 
    persist_directory=processor.persist_directory
)

# Category map for Google Books query augmentation
CAT_MAP = {
    "Fiction": "subject:fiction",
    "Nonfiction": "subject:nonfiction",
    "Mystery": "subject:mystery",
    "Thriller": "subject:thriller",
    "Horror": "subject:horror",
    "Sci-Fi": "subject:science fiction",
    "Fantasy": "subject:fantasy",
    "Romance": "subject:romance",
    "Adventure": "subject:adventure",
    "Drama": "subject:drama",
    "Comedy": "subject:humor",
    "History": "subject:history",
    "Biography": "subject:biography",
    "Memoir": "subject:autobiography",
    "Business": "subject:business",
    "Self-Help": "subject:self-help",
    "Psychology": "subject:psychology",
    "Philosophy": "subject:philosophy",
    "Science": "subject:science",
    "Technology": "subject:computers",
    "Health": "subject:health",
    "Cooking": "subject:cooking",
    "Travel": "subject:travel",
    "Art": "subject:art",
    "Music": "subject:music",
    "Sports": "subject:sports",
    "Poetry": "subject:poetry",
    "Comics": "subject:comics",
    "Children": "subject:juvenile",
    "Young Adult": "subject:young adult",
    "Religion": "subject:religion",
    "True Crime": "subject:true crime"
}

# Keyword map for ChromaDB category filtering
KEYWORD_MAP = {
    "Fiction": ["fiction", "novel", "literature"],
    "Nonfiction": ["nonfiction", "fact", "history", "biography", "science"],
    "Mystery": ["mystery", "detective", "crime"],
    "Thriller": ["thriller", "suspense", "espionage"],
    "Horror": ["horror", "scary", "ghost"],
    "Sci-Fi": ["science fiction", "sci-fi", "space", "future"],
    "Fantasy": ["fantasy", "magic", "wizard"],
    "Romance": ["romance", "love"],
    "Adventure": ["adventure", "action"],
    "Drama": ["drama", "play"],
    "Comedy": ["comedy", "humor", "funny"],
    "History": ["history", "past"],
    "Biography": ["biography", "autobiography", "memoir"],
    "Memoir": ["memoir", "autobiography"],
    "Business": ["business", "economics", "finance"],
    "Self-Help": ["self-help", "improvement", "guide"],
    "Psychology": ["psychology", "mental"],
    "Philosophy": ["philosophy", "thought"],
    "Science": ["science", "physics", "biology", "chemistry"],
    "Technology": ["technology", "computer", "coding", "digital"],
    "Health": ["health", "fitness", "medicine", "wellness"],
    "Cooking": ["cooking", "food", "recipes", "culinary"],
    "Travel": ["travel", "journey", "guide"],
    "Art": ["art", "design", "painting"],
    "Music": ["music", "song", "band"],
    "Sports": ["sports", "athlete", "game"],
    "Poetry": ["poetry", "poem", "verse"],
    "Comics": ["comics", "graphic novel", "manga"],
    "Children": ["juvenile", "children", "kids"],
    "Young Adult": ["young adult", "teen", "ya"],
    "Religion": ["religion", "spiritual", "faith", "theology"],
    "True Crime": ["crime", "murder", "forensic"]
}

# Tone → Emotion mapping
TONE_MAP = {
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
    "Nostalgic": "joy"
}


def _save_to_chromadb(live_results: list):
    """Background task: save live-fetched books to ChromaDB with quality filter + dedup + cap."""
    try:
        processor.update_vector_store_safe(live_results)
    except Exception as e:
        print(f"Background ChromaDB save failed (non-fatal): {e}")


def _apply_tone_sorting(books: List[Book], tone: Optional[str]) -> List[Book]:
    """Sort books by the emotion matching the user's selected tone."""
    if tone and tone != "All":
        target_emotion = TONE_MAP.get(tone)
        if target_emotion:
            books.sort(key=lambda x: getattr(x, target_emotion, 0.0) or 0.0, reverse=True)
    return books


def _build_book_from_dict(b_dict: dict) -> Book:
    """Convert a raw book dict to a Book pydantic model."""
    return Book(
        isbn13=b_dict.get("isbn13"),
        title=b_dict.get("title"),
        authors=b_dict.get("authors"),
        categories=b_dict.get("categories"),
        description=b_dict.get("description"),
        thumbnail=b_dict.get("thumbnail"),
        published_year=b_dict.get("published_year"),
        num_pages=b_dict.get("num_pages"),
        average_rating=b_dict.get("average_rating"),
        joy=b_dict.get("joy", 0.0),
        sadness=b_dict.get("sadness", 0.0),
        anger=b_dict.get("anger", 0.0),
        fear=b_dict.get("fear", 0.0),
        surprise=b_dict.get("surprise", 0.0),
        disgust=b_dict.get("disgust", 0.0),
        neutral=b_dict.get("neutral", 0.0),
        source="live"
    )


def _chromadb_fallback(query: str, category: Optional[str], limit: int) -> List[Book]:
    """
    Offline fallback: query ChromaDB when live fetch fails.
    Returns books from the vector store with optional category filtering.
    """
    print("Falling back to ChromaDB offline mode...")
    fallback_books = []
    seen_isbns = set()

    try:
        results = db_books.similarity_search(query, k=50)
        
        for res in results:
            metadata = res.metadata
            isbn = str(metadata.get("isbn13"))
            
            if isbn in seen_isbns:
                continue
            
            # Category filter for vector results
            if category and category != "All":
                db_cats = str(metadata.get("categories", "")).lower()
                target_keywords = KEYWORD_MAP.get(category, [category.lower()])
                if not any(k in db_cats for k in target_keywords):
                    continue

            description = res.page_content.replace(str(metadata.get("isbn13", "")), "", 1).strip()
            
            book = Book(
                isbn13=isbn,
                title=metadata.get("title", "Unknown Title"),
                authors=str(metadata.get("authors", "Unknown Author")),
                categories=str(metadata.get("categories", "Unknown Category")),
                description=description,
                thumbnail=metadata.get("thumbnail"),
                joy=metadata.get("joy"),
                sadness=metadata.get("sadness"),
                anger=metadata.get("anger"),
                fear=metadata.get("fear"),
                surprise=metadata.get("surprise"),
                disgust=metadata.get("disgust"),
                neutral=metadata.get("neutral"),
                source="offline"
            )
            fallback_books.append(book)
            seen_isbns.add(isbn)
            
            if len(fallback_books) >= limit + 10:
                break
                
    except Exception as e:
        print(f"ChromaDB fallback error: {e}")

    return fallback_books


@router.get("/recommend", response_model=List[Book])
def recommend_books(
    query: str,
    category: Optional[str] = None,
    tone: Optional[str] = None,
    limit: int = 16
):
    print(f"Request: query='{query}', category='{category}', tone='{tone}'")

    # --- Cache check (tone excluded — sorting is done client-side) ---
    cache_key = (query.strip().lower(), category)
    with _cache_lock:
        _clean_cache()
        cached = _cache.get(cache_key)
        if cached and (time.time() - cached["ts"]) < CACHE_TTL:
            print(f"Cache hit for key: {cache_key}")
            return cached["data"]
    
    # 0. QUERY AUGMENTATION
    google_query = query
    if category and category != "All" and category in CAT_MAP:
        google_query += f" {CAT_MAP[category]}"

    # 1. TRY LIVE FETCH (Fresh Data)
    live_results = []
    live_success = False
    
    try:
        from data.data_fetcher import GoogleBooksFetcher
        
        fetcher = GoogleBooksFetcher()
        print(f"Fetching live data with query: {google_query}")
        live_results = fetcher.fetch_books(query=google_query, max_results=30)
        
        if live_results:
            # REAL-TIME EMOTION ANALYSIS
            print(f"Running real-time emotion analysis on {len(live_results)} live books...")
            live_results = processor.process_emotions(live_results)
            live_success = True
            
    except Exception as e:
        print(f"Live fetch failed: {e}")

    # 2. BUILD RESULTS (Hybrid: Live first, then fill from ChromaDB)
    TARGET_TOTAL = 30  # Aim for this many total results
    final_books = []
    seen_isbns = set()

    if live_success and live_results:
        # --- Step A: Add live results first ---
        for b_dict in live_results:
            isbn = b_dict.get("isbn13")
            if isbn not in seen_isbns:
                final_books.append(_build_book_from_dict(b_dict))
                seen_isbns.add(isbn)

        live_count = len(final_books)
        print(f"Live fetch returned {live_count} unique books.")

        # Background: save live results to ChromaDB (async, non-blocking)
        threading.Thread(
            target=_save_to_chromadb,
            args=(live_results,),
            daemon=True
        ).start()

        # --- Step B: Fill remaining slots from ChromaDB ---
        remaining = TARGET_TOTAL - live_count
        if remaining > 0:
            print(f"Filling {remaining} remaining slots from ChromaDB...")
            filler_books = _chromadb_fallback(query, category, remaining + 10)
            filler_added = 0
            for fb in filler_books:
                if fb.isbn13 not in seen_isbns:
                    final_books.append(fb)
                    seen_isbns.add(fb.isbn13)
                    filler_added += 1
                    if filler_added >= remaining:
                        break
            print(f"Added {filler_added} filler books from ChromaDB. Total: {len(final_books)}")

    else:
        # --- API FAILED: Fall back entirely to ChromaDB offline ---
        final_books = _chromadb_fallback(query, category, TARGET_TOTAL)
        print(f"Full offline fallback: {len(final_books)} books from ChromaDB.")

    # 3. Tone sorting is handled client-side for instant UX.
    #    Backend still accepts tone param for backward compatibility,
    #    but we no longer sort here to avoid caching issues.

    result = final_books[:TARGET_TOTAL]

    # --- Store in cache ---
    with _cache_lock:
        _cache[cache_key] = {"data": result, "ts": time.time()}
    print(f"Cache stored for key: {cache_key} ({len(result)} books)")

    return result

@router.get("/categories")
def get_categories():
    return list(CAT_MAP.keys())
