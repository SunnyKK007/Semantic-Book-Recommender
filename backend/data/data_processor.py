import pandas as pd
import numpy as np
from transformers import pipeline
import torch
from typing import List, Dict, Any
from tqdm import tqdm
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
import os

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
                "neutral": book.get("neutral", 0.0)
            }
            documents.append(Document(page_content=page_content, metadata=metadata))
        
        if documents:
            db = Chroma(embedding_function=self.embedding_function, persist_directory=self.persist_directory)
            db.add_documents(documents)
            print(f"Added {len(documents)} documents to ChromaDB.")
        else:
            print("No documents to add.")

if __name__ == "__main__":
    # Test run
    processor = DataProcessor()
    # Mock data or run with fetched data
    # ...
    pass
