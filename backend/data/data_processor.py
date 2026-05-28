import pandas as pd
import numpy as np
from transformers import pipeline
import torch
from typing import List, Dict, Any, Set
from tqdm import tqdm
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
import os
import time

MAX_DB_SIZE = 15000  # Maximum number of books allowed in ChromaDB

class DataProcessor:
    def __init__(self, persist_directory: str = "./backend/chroma_db"):
        self.device = self._get_device()
        print(f"Initializing emotion classifier on {self.device}...")
        self.classifier = pipeline("text-classification",
                                   model="j-hartmann/emotion-english-distilroberta-base",
                                   top_k=None,
                                   device=self.device)
        self.emotion_labels = ["anger", "disgust", "fear", "joy", "neutral", "sadness", "surprise"]
        
        # Vector Store settings
        self.embedding_function = HuggingFaceEmbeddings(
            model_name="sentence-transformers/paraphrase-MiniLM-L3-v2",
            model_kwargs={'device': 'cpu'} # Keep CPU for embeddings to avoid freezing on Mac
        )
        self.persist_directory = persist_directory

    def _get_device(self):
        if torch.backends.mps.is_available():
            return "mps"
        elif torch.cuda.is_available():
            return 0
        return -1

    def _get_chroma_db(self):
        """Get a Chroma DB instance."""
        return Chroma(
            embedding_function=self.embedding_function,
            persist_directory=self.persist_directory
        )

    def calculate_max_emotion_scores(self, predictions):
        per_emotion_scores = {label: [] for label in self.emotion_labels}
        for prediction in predictions:
            sorted_predictions = sorted(prediction, key=lambda x: x["label"])
            for index, label in enumerate(self.emotion_labels):
                per_emotion_scores[label].append(sorted_predictions[index]["score"])
        return {label: np.max(scores) if scores else 0.0 for label, scores in per_emotion_scores.items()}

    def process_emotions(self, books: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Runs emotion analysis on a list of book dictionaries.
        Returns the list with appended emotion scores.
        """
        print("Processing emotions...")
        processed_books = []
        for book in tqdm(books):
            desc = book.get("description", "")
            # Simple sentence splitting
            sentences = [s for s in str(desc).split(".") if s.strip()]
            
            if not sentences:
                book.update({label: 0.0 for label in self.emotion_labels})
                processed_books.append(book)
                continue

            try:
                predictions = self.classifier(sentences, truncation=True, max_length=512)
                scores = self.calculate_max_emotion_scores(predictions)
                book.update(scores)
                processed_books.append(book)
            except Exception as e:
                print(f"Error processing book {book.get('title')}: {e}")
                book.update({label: 0.0 for label in self.emotion_labels})
                processed_books.append(book)
        return processed_books

    def get_book_count(self) -> int:
        """Returns the total number of documents in ChromaDB."""
        try:
            db = self._get_chroma_db()
            collection = db._collection
            return collection.count()
        except Exception as e:
            print(f"Error getting book count: {e}")
            return 0

    def get_existing_isbns(self, isbn_list: List[str]) -> Set[str]:
        """
        Checks which ISBNs from the given list already exist in ChromaDB.
        Returns a set of ISBNs that are already stored.
        """
        try:
            db = self._get_chroma_db()
            # Query metadata for matching ISBNs
            results = db.get(where={"isbn13": {"$in": isbn_list}})
            existing = set()
            if results and results.get("metadatas"):
                for meta in results["metadatas"]:
                    isbn = meta.get("isbn13")
                    if isbn:
                        existing.add(isbn)
            return existing
        except Exception as e:
            print(f"Error checking existing ISBNs: {e}")
            return set()

    def delete_oldest_books(self, count: int):
        """
        Deletes the oldest `count` books from ChromaDB based on stored_at timestamp.
        Books without stored_at are deleted first (legacy data).
        """
        try:
            db = self._get_chroma_db()
            all_data = db.get(include=["metadatas"])
            
            if not all_data or not all_data.get("ids"):
                return
            
            # Pair IDs with their stored_at timestamps
            id_timestamps = []
            for i, doc_id in enumerate(all_data["ids"]):
                stored_at = all_data["metadatas"][i].get("stored_at", 0)  # 0 = oldest (legacy)
                id_timestamps.append((doc_id, stored_at))
            
            # Sort by timestamp (oldest first)
            id_timestamps.sort(key=lambda x: x[1])
            
            # Delete the oldest ones
            ids_to_delete = [item[0] for item in id_timestamps[:count]]
            if ids_to_delete:
                db._collection.delete(ids=ids_to_delete)
                print(f"Evicted {len(ids_to_delete)} oldest books from ChromaDB.")
        except Exception as e:
            print(f"Error deleting oldest books: {e}")

    def update_vector_store(self, books: List[Dict[str, Any]]):
        """
        Updates (or creates) the ChromaDB vector store with the provided books.
        """
        print(f"Updating vector store at {self.persist_directory}...")
        documents = []
        for book in books:
            # We construct the content to be embedded. 
            # Combining ISBN and Description helps in unique identification and semantic search.
            page_content = f"{book['isbn13']} {book['description']}"
            
            # Metadata for filtering/retrieval
            metadata = {
                "isbn13": str(book["isbn13"]),
                "title": book["title"],
                "authors": str(book["authors"]),
                "categories": str(book["categories"]),
                "thumbnail": str(book.get("thumbnail", "")),
                "joy": book.get("joy", 0.0),
                "sadness": book.get("sadness", 0.0),
                "anger": book.get("anger", 0.0),
                "fear": book.get("fear", 0.0),
                "surprise": book.get("surprise", 0.0),
                "disgust": book.get("disgust", 0.0),
                "neutral": book.get("neutral", 0.0),
                "stored_at": book.get("stored_at", time.time()),
            }
            documents.append(Document(page_content=page_content, metadata=metadata))
        
        if documents:
            db = Chroma(embedding_function=self.embedding_function, persist_directory=self.persist_directory)
            db.add_documents(documents)
            print(f"Added {len(documents)} documents to ChromaDB.")
        else:
            print("No documents to add.")

    def update_vector_store_safe(self, books: List[Dict[str, Any]]):
        """
        Safe version of update_vector_store with:
        - ISBN deduplication (skip books already in DB)
        - Quality filtering (skip low-quality books)
        - DB size cap with LRU eviction (delete oldest when full)
        
        Designed to be called from a background thread — never raises exceptions.
        """
        try:
            if not books:
                return

            # 1. Quality filter
            quality_books = []
            for book in books:
                desc = book.get("description", "")
                title = book.get("title", "")
                authors = book.get("authors", "")
                
                # Skip books with short descriptions
                if len(str(desc).split()) < 30:
                    continue
                # Skip books without valid title/author
                if not title or title == "Unknown Title":
                    continue
                if not authors or authors == "Unknown Author":
                    continue
                # Skip books where no emotion scored above 0.2
                max_emotion = max(
                    book.get("joy", 0), book.get("sadness", 0), book.get("anger", 0),
                    book.get("fear", 0), book.get("surprise", 0), book.get("disgust", 0),
                )
                if max_emotion <= 0.2:
                    continue
                
                quality_books.append(book)
            
            if not quality_books:
                print("No quality books to save after filtering.")
                return

            # 2. ISBN deduplication
            incoming_isbns = [str(b.get("isbn13", "")) for b in quality_books if b.get("isbn13")]
            existing_isbns = self.get_existing_isbns(incoming_isbns) if incoming_isbns else set()
            
            new_books = [b for b in quality_books if str(b.get("isbn13", "")) not in existing_isbns]
            
            if not new_books:
                print(f"All {len(quality_books)} books already exist in ChromaDB. Skipping.")
                return
            
            print(f"Filtered: {len(books)} total → {len(quality_books)} quality → {len(new_books)} new")

            # 3. DB size cap with LRU eviction
            current_count = self.get_book_count()
            space_needed = (current_count + len(new_books)) - MAX_DB_SIZE
            
            if space_needed > 0:
                print(f"DB at {current_count}/{MAX_DB_SIZE}. Evicting {space_needed} oldest entries...")
                self.delete_oldest_books(space_needed)

            # 4. Add stored_at timestamp and save
            now = time.time()
            for book in new_books:
                book["stored_at"] = now
            
            self.update_vector_store(new_books)
            print(f"Background save complete: {len(new_books)} new books added to ChromaDB.")
            
        except Exception as e:
            print(f"Background ChromaDB save error (non-fatal): {e}")

if __name__ == "__main__":
    # Test run
    processor = DataProcessor()
    print(f"Current DB size: {processor.get_book_count()} books")
