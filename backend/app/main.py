import warnings
warnings.filterwarnings("ignore", message="urllib3 v2 only supports OpenSSL.*")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router
import os
from dotenv import load_dotenv

load_dotenv()

# In production set ALLOWED_ORIGIN=https://semantic-book-recommender.vercel.app
# Leave unset (or set to *) for local development
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "*")
origins = [ALLOWED_ORIGIN] if ALLOWED_ORIGIN != "*" else ["*"]

app = FastAPI(title="Book Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Book Recommender API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
