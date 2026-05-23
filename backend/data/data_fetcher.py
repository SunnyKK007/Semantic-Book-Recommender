import os
import requests
import dotenv
from typing import List, Dict, Any

dotenv.load_dotenv()

GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")

class GoogleBooksFetcher:
    BASE_URL = "https://www.googleapis.com/books/v1/volumes"

    def __init__(self, api_key: str = GOOGLE_BOOKS_API_KEY):
        self.api_key = api_key

    def fetch_books(self, query: str = "subject:fiction", max_results: int = 40) -> List[Dict[str, Any]]:
        """
        Fetches books from Google Books API.
        query: Search query (e.g., 'subject:fiction', 'machine learning')
        """
        params = {
            "q": query,
            "maxResults": max_results,
            "langRestrict": "en",
            "printType": "books"
        }
        if self.api_key:
            params["key"] = self.api_key

        print(f"Fetching data from Google Books API for query: '{query}'...")
        response = requests.get(self.BASE_URL, params=params)
        
        if response.status_code != 200:
            print(f"Error fetching data: {response.text}")
            return []

        items = response.json().get("items", [])
        books = []
        for item in items:
            volume_info = item.get("volumeInfo", {})
            industry_identifiers = volume_info.get("industryIdentifiers", [])
            isbn13 = next((id['identifier'] for id in industry_identifiers if id['type'] == 'ISBN_13'), None)

            # Skip books without ISBN or title
            if not isbn13 or not volume_info.get("title"):
                continue

            description = volume_info.get("description", "")
            # Filter minimal quality: needs a description of reasonable length
            if len(description.split()) < 20:
                continue

            book = {
                "isbn13": isbn13,
                "title": volume_info.get("title", ""),
                "authors": ";".join(volume_info.get("authors", [])),
                "categories": ";".join(volume_info.get("categories", [])),
                "description": description,
                "thumbnail": volume_info.get("imageLinks", {}).get("thumbnail", ""),
                "average_rating": volume_info.get("averageRating", None),
                "published_year": int(volume_info.get("publishedDate", "0")[:4]) if volume_info.get("publishedDate") else None,
                "num_pages": volume_info.get("pageCount", None)
            }
            books.append(book)
        
        print(f"Successfully processed {len(books)} books.")
        return books

if __name__ == "__main__":
    fetcher = GoogleBooksFetcher()
    # Test fetch
    books = fetcher.fetch_books(query="subject:mystery", max_results=10)
    for b in books:
        print(f"- {b['title']} ({b['published_year']})")
