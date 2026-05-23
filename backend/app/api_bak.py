from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.app.schemas import Book
from backend.data.data_processor import DataProcessor
from langchain_chroma import Chroma
import pandas as pd

router = APIRouter()

# Initialize Processor to get embedding function
# In a production app, we might use dependency injection or a singleton
processor = DataProcessor(persist_directory="./backend/chroma_db")

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
    
    # Semantic Search
    # Fetch more candidates initially for filtering
    initial_k = 50 
    results = db_books.similarity_search(query, k=initial_k)
    
    if not results:
        return []

    # Map results to Book objects
    # Note: We stored metadata in Chroma. We can reconstruct Book from metadata + page_content logic?
    # Or we construct it from the metadata we saved.
    
    books = []
    for res in results:
        metadata = res.metadata
        # Metadata contains: isbn13, title, authors, categories, thumbnail
        # Description is part of page_content "isbn13 description"
        # We need to extract description or better yet, store description in metadata too?
        # In data_processor.py update_vector_store, I used:
        # page_content = f"{book['isbn13']} {book['description']}"
        # metadata = {isbn13, title, authors, categories, thumbnail}
        # Ideally we should have stored description in metadata or fetch from DB.
        # For simplicity, we can extract it or modify data_processor to store it.
        # Let's see if we can extract it from page_content.
        
        description = res.page_content.replace(str(metadata.get("isbn13", "")), "", 1).strip()
        
        book = Book(
            isbn13=str(metadata.get("isbn13")),
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
        # Add emotion scores? They are not in metadata yet.
        # We need to update data_processor.py to store emotion scores in metadata if we want filtering by tone.
        
        books.append(book)

    # Filtering in memory (since Chroma metadata filtering is strict match, but tone is a range/score optimization)
    # The legacy app had a CSV `books` dataframe it joined against.
    # Here we only have Chroma.
    # CRITICAL: We need emotion scores to filter by tone.
    # I should update data_processor.py to include emotion scores in metadata.
    
    # For now, without emotion scores in metadata, tone filtering won't work efficiently.
    # I will modify this later. Assuming basic search works.
    
    # Filter by Category
    if category and category != "All":
        books = [b for b in books if category.lower() in b.categories.lower()]

    return books[:limit]

@router.get("/categories")
def get_categories():
    # In a real app, aggregation query. Here, generic list or explicit logic.
    return ["Fiction", "Nonfiction", "Children's Fiction", "Children's Nonfiction"]
