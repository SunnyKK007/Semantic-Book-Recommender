from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas import Book
from data.data_processor import DataProcessor
from langchain_chroma import Chroma
import pandas as pd

router = APIRouter()

# Initialize Processor to get embedding function
# In a production app, we might use dependency injection or a singleton
processor = DataProcessor(persist_directory="./chroma_db")

# Initialize Chroma for reading
db_books = Chroma(
    embedding_function=processor.embedding_function, 
    persist_directory=processor.persist_directory
)

@router.get("/recommend", response_model=List[Book])
def recommend_books(
    query: str,
    category: Optional[str] = None,
    tone: Optional[str] = None,
    limit: int = 16
):
    print(f"Request: query='{query}', category='{category}', tone='{tone}'")
    
    seen_isbns = set()
    final_books = []
    
    # 0. QUERY AUGMENTATION
    # Guide Google Books to the right category upstream
    google_query = query
    if category and category != "All":
        # Map UI categories to Google 'subject' terms for better precision
        cat_map = {
            "Fiction": "subject:fiction",
            "Nonfiction": "subject:nonfiction", # Added
            "Mystery": "subject:mystery",
            "Thriller": "subject:thriller",
            "Horror": "subject:horror",
            "Sci-Fi": "subject:science fiction",
            "Fantasy": "subject:fantasy",
            "Romance": "subject:romance",
            "Adventure": "subject:adventure", # Added
            "Drama": "subject:drama", # Added
            "Comedy": "subject:humor", # Added
            "History": "subject:history",
            "Biography": "subject:biography",
            "Memoir": "subject:autobiography", # Added
            "Business": "subject:business",
            "Self-Help": "subject:self-help",
            "Psychology": "subject:psychology",
            "Philosophy": "subject:philosophy",
            "Science": "subject:science", # Added
            "Technology": "subject:computers",
            "Health": "subject:health",
            "Cooking": "subject:cooking",
            "Travel": "subject:travel",
            "Art": "subject:art",
            "Music": "subject:music", # Added
            "Sports": "subject:sports", # Added
            "Poetry": "subject:poetry",
            "Comics": "subject:comics",
            "Children": "subject:juvenile",
            "Young Adult": "subject:young adult", # Added
            "Religion": "subject:religion",
            "True Crime": "subject:true crime"
        }
        if category in cat_map:
            google_query += f" {cat_map[category]}"

    # 1. LIVE FETCH (Fresh Data)
    try:
        from data.data_fetcher import GoogleBooksFetcher
        
        fetcher = GoogleBooksFetcher()
        # Increase results to ensure we have enough after filtering/dedup
        print(f"Fetching live data with query: {google_query}")
        live_results = fetcher.fetch_books(query=google_query, max_results=30)
        
        # REAL-TIME EMOTION ANALYSIS
        # The user requested semantic analysis on fetched books.
        # This will add latency but improve quality significantly.
        if live_results:
            print(f"Running real-time emotion analysis on {len(live_results)} live books...")
            live_results = processor.process_emotions(live_results)

        for b_dict in live_results:
            isbn = b_dict.get("isbn13")
            if isbn not in seen_isbns:
                book_obj = Book(
                    isbn13=isbn,
                    title=b_dict.get("title"),
                    authors=b_dict.get("authors"),
                    categories=b_dict.get("categories"),
                    description=b_dict.get("description"),
                    thumbnail=b_dict.get("thumbnail"),
                    published_year=b_dict.get("published_year"),
                    average_rating=b_dict.get("average_rating"),
                    # Now we have real emotion scores!
                    joy=b_dict.get("joy", 0.0),
                    sadness=b_dict.get("sadness", 0.0),
                    anger=b_dict.get("anger", 0.0),
                    fear=b_dict.get("fear", 0.0),
                    surprise=b_dict.get("surprise", 0.0),
                    disgust=b_dict.get("disgust", 0.0),
                    neutral=b_dict.get("neutral", 0.0)
                )
                final_books.append(book_obj)
                seen_isbns.add(isbn)
                
    except Exception as e:
        print(f"Live fetch warning: {e}")

    # 2. VECTOR SEARCH (Historical/Cured Data)
    # We still query the vector DB to fill gaps or find deepcuts
    if len(final_books) < limit:
        try:
            # For vector search, we rely on semantic similarity of the *original* query (without subject: tags)
            # But filtering is applied post-fetch.
            results = db_books.similarity_search(query, k=50) 
            
            for res in results:
                metadata = res.metadata
                isbn = str(metadata.get("isbn13"))
                
                if isbn in seen_isbns:
                    continue
                
                # Loose Category Filter for Vector Results
                if category and category != "All":
                    db_cats = str(metadata.get("categories", "")).lower()
                    # Map UI categories to simple keywords because legacy data has diverse tags
                    keyword_map = {
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
                    target_keywords = keyword_map.get(category, [category.lower()])
                    
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
                    neutral=metadata.get("neutral")
                )
                final_books.append(book)
                seen_isbns.add(isbn)
                
                if len(final_books) >= limit + 10: 
                    break
                    
        except Exception as e:
             print(f"Vector search error: {e}")

    # 3. Tone Sorting / Ranking
    if tone and tone != "All":
        # Compound Emotion Mapping
        # "Thriller" -> High Fear + Surprise
        # "Romantic" -> High Joy (mapped loosely)
        
        tone_map = {
            "Happy": "joy",
            "Sad": "sadness",
            "Suspenseful": "fear", # Thriller
            "Angry": "anger",
            "Surprising": "surprise",
            "Romantic": "joy", # Proxy
            "Inspiring": "joy", # Proxy
            "Dark": "sadness", # Proxy for Gloomy/Dark
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
        
        target_emotion = tone_map.get(tone)
        if target_emotion:
            final_books.sort(key=lambda x: getattr(x, target_emotion, 0.0) or 0.0, reverse=True)
            
    return final_books[:max(limit, 20)]

@router.get("/categories")
def get_categories():
    # In a real app, aggregation query. Here, generic list or explicit logic.
    return ["Fiction", "Nonfiction", "Children's Fiction", "Children's Nonfiction"]
