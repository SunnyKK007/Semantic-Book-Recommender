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
        print(f"init_classifier: device={self.device}")
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
        print("process_emotions: start")
        processed_books = []
        for book in tqdm(books):
            desc = book.get("description", "")
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
            
            id_timestamps = []
            for i, doc_id in enumerate(all_data["ids"]):
                stored_at = all_data["metadatas"][i].get("stored_at", 0)
                id_timestamps.append((doc_id, stored_at))
            
            id_timestamps.sort(key=lambda x: x[1])
            
            ids_to_delete = [item[0] for item in id_timestamps[:count]]
            if ids_to_delete:
                db._collection.delete(ids=ids_to_delete)
                print(f"evict_complete: count={len(ids_to_delete)}")
        except Exception as e:
            print(f"Error deleting oldest books: {e}")

    def update_vector_store(self, books: List[Dict[str, Any]]):
        """
        Updates (or creates) the ChromaDB vector store with the provided books.
        """
        print(f"update_vector_store: dir={self.persist_directory}")
        documents = []
        for book in books:
            page_content = f"Title: {book['title']}. Author: {book.get('authors', 'Unknown')}. Description: {book['description']}"
            
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
            print(f"chromadb_add: count={len(documents)}")
        else:
            print("chromadb_add: skip_empty")

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

            quality_books = []
            for book in books:
                desc = book.get("description", "")
                title = book.get("title", "")
                authors = book.get("authors", "")
                
                if len(str(desc).split()) < 30:
                    continue
                if not title or title == "Unknown Title":
                    continue
                if not authors or authors == "Unknown Author":
                    continue
                max_emotion = max(
                    book.get("joy", 0), book.get("sadness", 0), book.get("anger", 0),
                    book.get("fear", 0), book.get("surprise", 0), book.get("disgust", 0),
                )
                if max_emotion <= 0.2:
                    continue
                
                quality_books.append(book)
            
            if not quality_books:
                print("save_skip: no_quality_books")
                return

            incoming_isbns = [str(b.get("isbn13", "")) for b in quality_books if b.get("isbn13")]
            existing_isbns = self.get_existing_isbns(incoming_isbns) if incoming_isbns else set()
            
            new_books = [b for b in quality_books if str(b.get("isbn13", "")) not in existing_isbns]
            
            if not new_books:
                print(f"save_skip: all_duplicate count={len(quality_books)}")
                return
            
            print(f"save_filter: total={len(books)} quality={len(quality_books)} new={len(new_books)}")

            current_count = self.get_book_count()
            space_needed = (current_count + len(new_books)) - MAX_DB_SIZE
            
            if space_needed > 0:
                print(f"save_evict: db_size={current_count}/{MAX_DB_SIZE} evicting={space_needed}")
                self.delete_oldest_books(space_needed)

            now = time.time()
            for book in new_books:
                book["stored_at"] = now
            
            self.update_vector_store(new_books)
            print(f"save_complete: count={len(new_books)}")
            
        except Exception as e:
            print(f"Background ChromaDB save error (non-fatal): {e}")

if __name__ == "__main__":
    # Test run
    processor = DataProcessor()
    print(f"test_run: db_size={processor.get_book_count()}")
