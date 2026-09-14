from data.data_fetcher import GoogleBooksFetcher
from data.data_processor import DataProcessor

def run_pipeline(query="subject:fiction"):
    fetcher = GoogleBooksFetcher()
    processor = DataProcessor(persist_directory="./backend/chroma_db")
    
    print(f"--- Starting Pipeline for query: {query} ---")
    books = fetcher.fetch_books(query=query)
    
    if not books:
        print("No books fetched.")
        return
        
    print(f"Fetched {len(books)} books. Starting processing...")
    books_with_emotions = processor.process_emotions(books)
    
    processor.update_vector_store(books_with_emotions)
    print("--- Pipeline Complete ---")

if __name__ == "__main__":
    run_pipeline(query="subject:mystery")
