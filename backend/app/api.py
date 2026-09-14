from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas import Book
from data.data_processor import DataProcessor
from langchain_chroma import Chroma
import pandas as pd
import time
import threading

router = APIRouter()


processor = DataProcessor(persist_directory="./chroma_db")
processor = DataProcessor(persist_directory="./chroma_db")

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
    ChromaDB's top-k already returns results ranked by similarity.
    """
    print("fallback: ChromaDB_offline_mode")
    fallback_books = []
    seen_isbns = set()

    try:
        # Log ChromaDB collection size for debugging
        try:
            db_count = db_books._collection.count()
            print(f"chromadb_status: doc_count={db_count}")
        except Exception:
            print("Could not get ChromaDB count.")

        results = db_books.similarity_search(query, k=limit + 20)
        print(f"chromadb_search: results={len(results)} query='{query}'")

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
        import traceback
        print(f"ChromaDB fallback error: {e}")
        traceback.print_exc()

    print(f"fallback_complete: returned={len(fallback_books)}")
    return fallback_books


@router.get("/recommend", response_model=List[Book])
def recommend_books(
    query: str,
    category: Optional[str] = None,
    tone: Optional[str] = None,
    limit: int = 16
):
    print(f"Request: query='{query}', category='{category}', tone='{tone}'")


    google_query = query
    if category and category != "All" and category in CAT_MAP:
        google_query += f" {CAT_MAP[category]}"

    live_results = []
    live_success = False
    
    try:
        from data.data_fetcher import GoogleBooksFetcher
        
        fetcher = GoogleBooksFetcher()
        print(f"live_fetch_start:{google_query}")
        live_results = fetcher.fetch_books(query=google_query, max_results=30)
        
        if live_results:
            print(f"emotion_analysis_start:{len(live_results)}")
            live_results = processor.process_emotions(live_results)
            live_success = True
            
    except Exception as e:
        print(f"live_fetch_error:{e}")

    TARGET_TOTAL = 30  # Aim for this many total results
    final_books = []
    seen_isbns = set()

    if live_success and live_results:
        print("chromadb_bg_sync_start")
        import threading
        threading.Thread(target=processor.update_vector_store_safe, args=(live_results,), daemon=True).start()
        
        incoming_isbns = [str(b.get("isbn13")) for b in live_results if b.get("isbn13")]
        existing_isbns = processor.get_existing_isbns(incoming_isbns) if incoming_isbns else set()
        truly_live_isbns = set(incoming_isbns) - existing_isbns
        
        for b_dict in live_results:
            final_books.append(_build_book_from_dict(b_dict))
            seen_isbns.add(b_dict.get("isbn13"))
    else:
        truly_live_isbns = set()
        
    chroma_books = _chromadb_fallback(query, category, 40)
    for fb in chroma_books:
        if fb.isbn13 not in seen_isbns:
            final_books.append(fb)
            seen_isbns.add(fb.isbn13)
    
    for fb in final_books:
        if fb.isbn13 in truly_live_isbns:
            fb.source = "live"
        else:
            fb.source = "offline"
            
    from collections import Counter
    authors_list = [b.authors for b in final_books if b.authors and b.authors != "Unknown Author" and b.authors != "Unknown"]
    primary_author = None
    if authors_list:
        most_common = Counter(authors_list).most_common(1)
        if most_common[0][1] > 2:
            primary_author = most_common[0][0]
            
    q_lower = query.strip().lower()
    
    def rank_score(b):
        score = 0
        if primary_author and b.authors == primary_author:
            score -= 2000
            
        title = b.title.lower()
        if q_lower == title:
            score -= 1000
        elif q_lower in title:
            score -= (100 - len(title))
            
        return score
        
    final_books.sort(key=rank_score)
            
    print(f"search_complete: total={len(final_books)} primary_author='{primary_author}'")
    result = final_books

    return result

@router.get("/categories")
def get_categories():
    return list(CAT_MAP.keys())
