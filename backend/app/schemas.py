from pydantic import BaseModel
from typing import Optional

class Book(BaseModel):
    isbn13: str
    title: str
    authors: str
    categories: str
    description: str
    thumbnail: Optional[str] = None
    average_rating: Optional[float] = None
    published_year: Optional[int] = None
    num_pages: Optional[int] = None
    # Emotion scores
    joy: Optional[float] = 0.0
    sadness: Optional[float] = 0.0
    anger: Optional[float] = 0.0
    fear: Optional[float] = 0.0
    surprise: Optional[float] = 0.0
    disgust: Optional[float] = 0.0
    neutral: Optional[float] = 0.0
