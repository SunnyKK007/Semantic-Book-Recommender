# 📚 Semantic Book Recommender

> **"Don't search for keywords. Search for a vibe."**

An AI-powered book recommendation system that understands the **emotional tone**, **semantic meaning**, and **human intent** behind a query — not just keywords. Built end-to-end with a FastAPI backend, HuggingFace AI models, ChromaDB vector database, live Google Books API integration, and a React + Framer Motion frontend.

---

## 📌 Table of Contents

1. [Why I Built This — The Problem](#-why-i-built-this--the-problem)
2. [What Problem This Solves](#-what-problem-this-solves)
3. [How It Works — Full Pipeline Deep Dive](#-how-it-works--full-pipeline-deep-dive)
4. [AI Models Used — And Why These Specific Ones](#-ai-models-used--and-why-these-specific-ones)
5. [Tech Stack — And Why Each Technology](#-tech-stack--and-why-each-technology)
6. [Project Architecture](#-project-architecture)
7. [Project Structure](#-project-structure)
8. [API Reference](#-api-reference)
9. [Key Design Decisions & Trade-offs](#-key-design-decisions--trade-offs)
10. [How to Run Locally](#-how-to-run-locally)
11. [Example Queries](#-example-queries-to-try)
12. [Potential Improvements](#-potential-improvements--future-scope)

---

## 🌟 Why I Built This — The Problem

As a reader, I was frustrated with existing book discovery platforms like Goodreads, Amazon, or Google Books. The core issue is this:

**Traditional book search is broken for humans.**

When a person wants to read a book, they rarely think in keywords. They think in *feelings* and *vibes*:
- *"I want something that feels like a rainy Sunday afternoon"*
- *"I need a book that gives me the same feeling as Interstellar"*
- *"A story that's dark but hopeful at the end"*

But when you search those exact phrases on any book platform, the results are garbage — because those platforms are doing **string matching**, not **meaning matching**.

They match the word "dark" in a title. They match "hopeful" in a review tag. They have no idea what you actually *feel* like reading.

**I built this project to solve that gap** — using real AI to bridge human emotional intent and book discovery.

---

## 🧩 What Problem This Solves

### Problem 1: Keyword Search is Not Semantic Search
| Old Way (Keyword) | This Project (Semantic) |
|-------------------|------------------------|
| Matches exact words in title/description | Understands the **meaning and context** of your query |
| `"sad war story"` → finds books with those exact words | `"sad war story"` → finds books *about* loss, grief, conflict even if those words don't appear |
| No understanding of nuance | Understands that "gloomy", "melancholic", "dark" are related |

**How we solve it:** We use a Sentence Transformer model (`paraphrase-MiniLM-L3-v2`) to convert both the user query and book descriptions into high-dimensional vectors. Similar meanings produce similar vectors. We then use **cosine similarity** to find the closest matches — this is called **semantic search**.

---

### Problem 2: No Emotional Filtering in Book Discovery
Most platforms filter by genre (Mystery, Sci-Fi) or star rating. But genre doesn't capture *feeling*. A Mystery novel can be funny (Agatha Christie) or deeply disturbing (Gone Girl). The genre tag tells you nothing about the emotional experience.

**How we solve it:** We run every book description through a **fine-tuned emotion classification model** (`distilroberta-base`) that scores the text on 7 emotions: `joy`, `sadness`, `anger`, `fear`, `surprise`, `disgust`, `neutral`. We store these scores and allow users to filter/rank by emotional tone.

---

### Problem 3: Static Databases Go Stale
Most recommendation systems work off a fixed dataset. New books aren't included. Popular recent releases are missing.

**How we solve it:** Every search **hits the Google Books API in real-time** to fetch fresh, live results. We then run AI analysis on those results on-the-fly before returning them. The ChromaDB vector store serves as a supplementary historical database to fill gaps.

---

### Problem 4: Cold Start Problem in Recommendations
Traditional collaborative filtering ("users who liked X also liked Y") requires a lot of user history data to work. A new user gets terrible recommendations. This is the **cold start problem**.

**How we solve it:** Our system is **content-based** — it never needs user history. It only needs your description of what you want right now. The AI understands the *content* of books, not the behavior of other users.

---

## 🧠 How It Works — Full Pipeline Deep Dive

Here is the complete journey from your query to the final results:

```
┌─────────────────────────────────────────────────────┐
│                   USER INTERFACE                     │
│  Query: "a lonely astronaut in deep space"           │
│  Category: Sci-Fi    Tone: Melancholic               │
└──────────────────────┬──────────────────────────────┘
                       │  HTTP GET /recommend
                       ▼
┌─────────────────────────────────────────────────────┐
│              STEP 1: QUERY AUGMENTATION              │
│                                                      │
│  Category "Sci-Fi" is mapped to Google subject tag:  │
│  "subject:science fiction"                           │
│                                                      │
│  Final Google query:                                 │
│  "a lonely astronaut in deep space                   │
│   subject:science fiction"                           │
│                                                      │
│  WHY: This steers the Google Books API upstream      │
│  so we get genre-relevant results before any         │
│  AI processing — saving time and compute.            │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│           STEP 2: LIVE FETCH (Google Books API)      │
│                                                      │
│  Fetches up to 30 books from Google Books API        │
│                                                      │
│  Quality Filters Applied:                            │
│  ✅ Must have ISBN-13 (unique identifier)            │
│  ✅ Must have a title                                │
│  ✅ Description must be ≥ 20 words                  │
│  ✅ English language only                            │
│  ✅ Print books only (not magazines)                 │
│                                                      │
│  Data Extracted Per Book:                            │
│  - title, authors, categories, description           │
│  - thumbnail URL, average_rating                     │
│  - published_year, num_pages, isbn13                 │
│                                                      │
│  WHY LIVE FETCH: Ensures fresh, up-to-date results.  │
│  Static datasets miss recently published books.      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│        STEP 3: REAL-TIME EMOTION ANALYSIS            │
│                                                      │
│  Model: j-hartmann/emotion-english-distilroberta-base│
│  Runs on: Apple MPS (Mac GPU) / CUDA / CPU           │
│                                                      │
│  For each book:                                      │
│  1. Split description into individual sentences      │
│  2. Run each sentence through the classifier         │
│  3. Get 7 emotion scores per sentence                │
│  4. Take MAX score per emotion across all sentences  │
│                                                      │
│  Example output for one book:                        │
│  { joy: 0.72, sadness: 0.31, anger: 0.05,           │
│    fear: 0.48, surprise: 0.62,                       │
│    disgust: 0.03, neutral: 0.55 }                    │
│                                                      │
│  WHY MAX (not average): A book description might     │
│  start neutrally but have one intensely fearful      │
│  sentence. The MAX captures the emotional PEAK       │
│  which is more representative of reader experience.  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│         STEP 4: VECTOR SEARCH (ChromaDB)             │
│                                                      │
│  Only triggered if live results < requested limit    │
│                                                      │
│  Model: sentence-transformers/paraphrase-MiniLM-L3-v2│
│  DB: ChromaDB (local persistent vector store)        │
│                                                      │
│  Process:                                            │
│  1. Query is converted to a 384-dim vector           │
│  2. ChromaDB finds top-50 most similar book vectors  │
│     using cosine similarity                          │
│  3. Category filter applied using keyword matching   │
│  4. Deduplicated against live results (by ISBN)      │
│                                                      │
│  WHY ChromaDB: It's local, fast, persistent, and     │
│  integrates natively with LangChain. No external     │
│  server needed. Perfect for a self-contained app.   │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│           STEP 5: TONE-BASED RANKING                 │
│                                                      │
│  User selected tone: "Melancholic"                   │
│  → Mapped to emotion: "sadness"                      │
│                                                      │
│  All books (live + vector) are sorted by their       │
│  "sadness" score in descending order.                │
│                                                      │
│  The most emotionally matching books rise to top.    │
│                                                      │
│  Tone → Emotion Mapping:                             │
│  Happy/Romantic/Inspiring/Hopeful/Nostalgic → joy   │
│  Sad/Dark/Melancholic/Emotional → sadness            │
│  Suspenseful/Intense → fear                          │
│  Angry → anger                                       │
│  Surprising/Mysterious/Curious → surprise            │
│  Disturbing → disgust                                │
│  Relaxing/Thoughtful → neutral                       │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
              📖 Final Ranked Results
              returned as JSON to frontend
```

---

## 🤖 AI Models Used — And Why These Specific Ones

### Model 1: Emotion Classifier
**`j-hartmann/emotion-english-distilroberta-base`**

| Property | Detail |
|----------|--------|
| **Base Architecture** | RoBERTa (Robustly Optimized BERT Pretraining Approach) |
| **Variant** | DistilRoBERTa — distilled version, 40% smaller, 60% faster, retains ~97% accuracy |
| **Fine-tuned On** | Multiple emotion datasets (GoEmotions, ISEAR, TweetEval, etc.) |
| **Task** | Multi-class text classification → 7 emotion labels |
| **Output** | Softmax probability scores for each of: `anger`, `disgust`, `fear`, `joy`, `neutral`, `sadness`, `surprise` |
| **Input Limit** | 512 tokens (we use `truncation=True` to handle longer descriptions) |
| **Size** | ~329 MB |
| **Inference Speed** | ~2-3 books/second on CPU, 5-6/second on MPS |

**Why this model specifically?**
- It's the most downloaded and widely benchmarked model for 7-class emotion detection on HuggingFace
- The 7-emotion taxonomy (Ekman's basic emotions) maps perfectly to book "vibes"
- DistilRoBERTa is fast enough for real-time inference without a GPU cluster
- It was trained on diverse datasets, making it robust to different writing styles

**Why sentence-level, not document-level?**
- Book descriptions are short but dense. Running the entire description as one chunk loses nuance.
- By splitting into sentences and taking MAX scores, we capture the emotional *peaks* of a description — which is what readers actually respond to.

---

### Model 2: Sentence Embedding Model
**`sentence-transformers/paraphrase-MiniLM-L3-v2`**

| Property | Detail |
|----------|--------|
| **Base Architecture** | MiniLM (Microsoft's compact transformer) |
| **Layers** | 3 (extremely lightweight) |
| **Output** | 384-dimensional dense embedding vector |
| **Task** | Semantic similarity / sentence embeddings |
| **Size** | ~61 MB |
| **Inference Speed** | Very fast, even on CPU |

**Why this model specifically?**
- It's designed for semantic *paraphrase* detection — meaning it maps sentences with the same *meaning* (even different words) to nearby vectors. This is perfect for our use case.
- Only 3 layers → extremely fast inference → negligible startup overhead
- 384 dimensions is sufficient for book description similarity without being too large to store efficiently in ChromaDB
- Runs well on CPU — we intentionally keep it on CPU to avoid conflicts with the emotion model on MPS

**What is a vector/embedding?**
Think of it as converting text into coordinates in 384-dimensional space. Two sentences that mean the same thing end up close together. Two unrelated sentences end up far apart. We measure "closeness" using cosine similarity.

---

## 🛠️ Tech Stack — And Why Each Technology

### Backend

| Technology | Version | Why We Chose It |
|-----------|---------|-----------------|
| **FastAPI** | Latest | Async-first Python framework. Auto-generates Swagger docs at `/docs`. 3x faster than Flask for I/O bound tasks. Type hints built-in via Pydantic. |
| **Uvicorn** | Latest | ASGI server required for FastAPI. Supports `--reload` for development hot-reload. |
| **HuggingFace Transformers** | Latest | Industry standard for running pre-trained NLP models locally. No API calls, no cost, no rate limits. |
| **Sentence Transformers** | Latest | Simplifies generating high-quality sentence embeddings. Wrapper around HuggingFace for semantic similarity tasks. |
| **LangChain** | Latest | Orchestration layer connecting embedding models → vector store → retrieval. Abstracts ChromaDB operations cleanly. |
| **ChromaDB** | Latest | Local, embedded vector database. No server setup needed. Persistent storage. Native LangChain integration. |
| **PyTorch** | Latest | Deep learning framework running our HuggingFace models. Apple MPS support for Mac GPU acceleration. |
| **Pandas / NumPy** | Latest | Data manipulation for processing book lists and emotion score aggregation. |
| **Python-dotenv** | Latest | Loads `GOOGLE_BOOKS_API_KEY` from `.env` file securely without hardcoding secrets. |
| **Requests** | Latest | Simple HTTP client for calling the Google Books REST API. |

### Frontend

| Technology | Version | Why We Chose It |
|-----------|---------|-----------------|
| **React 18** | 18.x | Component-based UI. `useState` for managing search state, results, loading. Vite for blazing fast HMR. |
| **Vite** | 7.x | Modern build tool. Cold start in <500ms. Much faster than Create React App (Webpack). |
| **TailwindCSS** | Latest | Utility-first CSS. Rapid UI development. Dark mode, glassmorphism, gradients — all in className. |
| **Framer Motion** | Latest | Production-ready animation library for React. Used for card entrance animations, page transitions, and hover effects. |
| **Axios** | Latest | Promise-based HTTP client. Cleaner API than native fetch. Easy error handling. |
| **Lucide React** | Latest | Modern, clean SVG icon set. Used for Search, Sparkles, BookOpen icons. |

### DevOps / Infrastructure

| Technology | Why We Chose It |
|-----------|-----------------|
| **Docker** | Containerizes both frontend and backend for consistent, reproducible deployment across environments |
| **Docker Compose** | Orchestrates the two containers (frontend + backend) with a single `docker-compose up` command |
| **Nginx** | Serves the built React static files in the Docker frontend container. Also handles reverse proxying. |

---

## 🏗️ Project Architecture

```
                    ┌──────────────────┐
                    │   React Frontend  │
                    │   (Port 5173)     │
                    │                  │
                    │  - App.jsx        │
                    │  - BookCard.jsx   │
                    └────────┬─────────┘
                             │ HTTP GET /recommend
                             │ (Axios)
                             ▼
                    ┌──────────────────┐
                    │  FastAPI Backend  │
                    │  (Port 8000)     │
                    │                  │
                    │  main.py         │
                    │  (CORS + Router) │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ Google Books │  │  Emotion AI  │  │   ChromaDB   │
   │     API      │  │    Model     │  │ Vector Store │
   │  (Live Data) │  │ (distilRoBERTa)│ │ (Local DB)   │
   └──────────────┘  └──────────────┘  └──────────────┘
                             │
                    ┌────────▼─────────┐
                    │ Sentence Embedder │
                    │   (MiniLM-L3)    │
                    │  (For ChromaDB   │
                    │   similarity)    │
                    └──────────────────┘
```

**Data Flow Summary:**
1. Frontend sends `GET /recommend?query=...&category=...&tone=...`
2. Backend augments query with subject filters
3. Google Books API returns raw book data
4. Emotion classifier scores each book's description
5. ChromaDB fills gaps via semantic vector search
6. Results are sorted by tone/emotion match
7. JSON response returned to frontend
8. React renders animated book cards

---

## 📂 Project Structure

```
Semantic-Book-Recommender/
│
├── 📄 README.md                    ← You are here
├── 📄 docker-compose.yml           ← Run both services with one command
├── 📄 .gitignore                   ← Excludes venv, node_modules, chroma_db, .env, logs
│
├── 📁 backend/
│   ├── 📄 Dockerfile               ← Python container config
│   ├── 📄 requirements.txt         ← All Python dependencies
│   ├── 📄 __init__.py
│   │
│   ├── 📁 app/
│   │   ├── 📄 main.py              ← FastAPI app entry point
│   │   │                              Configures CORS (allows all origins for dev)
│   │   │                              Registers the API router
│   │   │                              Health check endpoint at GET /
│   │   │
│   │   ├── 📄 api.py               ← Core recommendation logic
│   │   │                              GET /recommend endpoint
│   │   │                              Orchestrates: fetch → analyze → vector search → sort
│   │   │
│   │   ├── 📄 schemas.py           ← Pydantic models (Book response schema)
│   │   │                              Validates and serializes API responses
│   │   │
│   │   └── 📄 api_bak.py           ← Backup of earlier API version
│   │
│   ├── 📁 data/
│   │   ├── 📄 data_fetcher.py      ← GoogleBooksFetcher class
│   │   │                              Calls Google Books API
│   │   │                              Filters by ISBN, description length, language
│   │   │
│   │   ├── 📄 data_processor.py    ← DataProcessor class
│   │   │                              Loads emotion classifier + embedding model
│   │   │                              process_emotions() → runs AI on book list
│   │   │                              update_vector_store() → saves to ChromaDB
│   │   │
│   │   └── 📄 pipeline.py          ← Offline batch ingestion script
│   │                                  Used to pre-populate ChromaDB with seed data
│   │
│   └── 📁 chroma_db/               ← [gitignored] Persisted vector store
│                                      Contains embedded book descriptions
│
└── 📁 frontend/
    ├── 📄 Dockerfile               ← Node build + Nginx serve config
    ├── 📄 vite.config.js           ← Vite config (port, plugins)
    ├── 📄 nginx.conf               ← Nginx config for Docker deployment
    ├── 📄 package.json             ← Node dependencies
    ├── 📄 index.html               ← HTML shell
    │
    └── 📁 src/
        ├── 📄 main.jsx             ← React entry point (renders <App />)
        ├── 📄 App.jsx              ← Main component
        │                              Manages: query, category, tone, books state
        │                              Calls /recommend API via Axios
        │                              Renders: Hero, Search bar, Filters, Book grid
        │
        ├── 📄 index.css            ← Global styles
        │                              Defines: .glass-panel, .mesh-bg, animations
        │                              Custom scrollbar, perspective container
        │
        └── 📁 components/
            └── 📄 BookCard.jsx     ← Individual book card component
                                       Displays: cover, title, author, description
                                       Computes dominant emotion tag
                                       Hover animations via Framer Motion
```

---

## 🔑 API Reference

### `GET /recommend`

The core endpoint. Returns a ranked list of book recommendations.

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | ✅ Yes | — | Natural language vibe/plot description |
| `category` | string | ❌ No | All | Genre filter — maps to Google Books `subject:` tag |
| `tone` | string | ❌ No | All | Emotional tone — maps to an emotion score for sorting |
| `limit` | int | ❌ No | 16 | Number of results to return |

**Example Request:**
```bash
curl "http://localhost:8000/recommend?query=dystopian+society+where+books+are+banned&category=Sci-Fi&tone=Dark&limit=8"
```

**Example Response (one book):**
```json
{
  "isbn13": "9780743273565",
  "title": "Fahrenheit 451",
  "authors": "Ray Bradbury",
  "categories": "Fiction",
  "description": "A fireman in charge of burning books...",
  "thumbnail": "https://books.google.com/...",
  "published_year": 1953,
  "average_rating": 4.1,
  "joy": 0.12,
  "sadness": 0.74,
  "anger": 0.58,
  "fear": 0.43,
  "surprise": 0.21,
  "disgust": 0.31,
  "neutral": 0.18
}
```

**Emotion scores** are floats between 0.0 and 1.0. Higher = stronger presence of that emotion in the book's description.

---

### `GET /`
Health check endpoint.

**Response:** `{"status": "ok", "message": "Book Recommender API is running"}`

---

### Interactive Docs
When backend is running, visit: **http://localhost:8000/docs** (Swagger UI — auto-generated by FastAPI)

---

## 💡 Key Design Decisions & Trade-offs

### Decision 1: Live Fetch + Vector DB (Hybrid Approach)
**Why not just a static dataset?**
Static datasets go stale. New bestsellers wouldn't appear. By fetching live from Google Books, we always have fresh results. ChromaDB acts as a supplementary deep archive for when the live API returns fewer results than requested.

**Trade-off:** Live fetch adds latency (~2-5 seconds for emotion analysis). We accept this because result quality is far higher.

---

### Decision 2: Running Models Locally (Not via API)
**Why not use OpenAI or a cloud emotion API?**
- **Cost:** Running 30 books through a cloud API per query adds up fast
- **Latency:** Network round-trips to a cloud API vs. local inference
- **Privacy:** User queries never leave the machine
- **Control:** We pick exactly which models to use and how

**Trade-off:** First startup requires downloading ~390 MB of model weights. After that, models are cached and load in ~5 seconds.

---

### Decision 3: MPS for Emotion Model, CPU for Embedding Model
On Mac with Apple Silicon, MPS (Metal Performance Shaders) provides GPU acceleration. We run the emotion classifier on MPS for speed. However, the embedding model stays on CPU intentionally — running both on MPS simultaneously caused memory conflicts and freezes in testing.

---

### Decision 4: MAX Score (Not Mean) for Emotion Aggregation
When processing a book description sentence by sentence, we take the **maximum** emotion score across all sentences rather than the average.

**Why:** A book might have 10 neutral sentences and 1 deeply terrifying one. The average would dilute the terror. But readers respond to the *peak* emotional moments in a description. MAX better represents the book's emotional potential.

---

### Decision 5: Query Augmentation Before Google Books Call
We append `subject:` tags to the Google Books query based on the selected category before making the API call. This filters at the *source*, not after fetching — meaning we waste fewer API calls on irrelevant books and reduce unnecessary emotion analysis compute.

---

## 🚀 How to Run Locally

### Prerequisites
- Python 3.9+
- Node.js 18+
- ~500 MB free disk space (for AI models)
- Internet connection (for Google Books API + first-time model download)

### Option 1: Local Development (Recommended)

**Step 1: Backend Setup**
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# (Optional but recommended) Add Google Books API key for higher rate limits
# Get free key at: https://console.cloud.google.com/apis/library/books.googleapis.com
echo "GOOGLE_BOOKS_API_KEY=your_key_here" > .env

# Start the server
python -m uvicorn app.main:app --reload --port 8000
```

> ⏳ **First run only:** AI models (~390 MB total) download from HuggingFace. Takes 1-3 minutes depending on internet. Subsequent starts are instant — models are cached at `~/.cache/huggingface/`.

**Step 2: Frontend Setup**
```bash
# Open a new terminal
cd frontend
npm install
npm run dev
```

**Step 3: Open in Browser**
→ **http://localhost:5173**

Backend API docs → **http://localhost:8000/docs**

---

### Option 2: Docker (For Deployment)

```bash
# From the root directory
docker-compose up --build -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

### Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Model download stuck at 0% | HuggingFace CDN issue or slow network | Run: `huggingface-cli download j-hartmann/emotion-english-distilroberta-base` |
| `Address already in use` on port 8000 | Previous backend still running | Run: `lsof -ti:8000 \| xargs kill` |
| Empty results for some queries | Google Books API rate limit (no key) | Add `GOOGLE_BOOKS_API_KEY` in `backend/.env` |
| `LibreSSL` warning in logs | urllib3 v2 vs macOS SSL | Harmless warning — safe to ignore |
| MPS / GPU errors on Mac | PyTorch MPS compatibility | Update PyTorch: `pip install torch --upgrade` |
| CORS error in browser | Backend not running | Ensure backend is running on port 8000 |

---

## 🎯 Example Queries to Try

| Query | Category | Tone | What It Tests |
|-------|----------|------|---------------|
| *"A dystopian world where books are banned"* | Sci-Fi | Dark | Semantic + emotion |
| *"A detective solving crimes in Victorian London"* | Mystery | Suspenseful | Category filter + fear emotion |
| *"Heartwarming story about family and forgiveness"* | Fiction | Happy | Joy emotion ranking |
| *"A soldier's trauma and journey home after war"* | History | Sad | Sadness emotion ranking |
| *"Building good habits and self-discipline"* | Self-Help | Inspiring | Joy proxy + category |
| *"A cyberpunk city with a corrupt government"* | Sci-Fi | Intense | Fear emotion + semantic |
| *"True story of survival against all odds"* | Biography | Emotional | Sadness proxy |
| *"Something funny and light for a weekend"* | Comedy | Humorous | Joy emotion + category |

---

## 🔭 Potential Improvements & Future Scope

| Feature | Description |
|---------|-------------|
| **User Accounts** | Save reading history and liked books for personalized future recommendations |
| **Collaborative Filtering** | Combine content-based (current) with CF for hybrid recommendations |
| **Google Books API Key** | Add proper key management for higher rate limits |
| **Book Preview Links** | Link to Google Books preview or Goodreads page |
| **Reading List** | Let users save books to a "Want to Read" list |
| **Emotion Visualization** | Show a radar/spider chart of the book's emotion scores |
| **Multi-language Support** | Extend to non-English books |
| **Caching Layer** | Redis cache for repeated queries to reduce API calls and latency |
| **Better Vector Store** | Migrate to Pinecone or Weaviate for production scale |
| **Feedback Loop** | "This was helpful / not helpful" buttons to improve ranking over time |

---

## 👤 Author

**Sunny Kant Kumar**  
GitHub: [@SunnyKK007](https://github.com/SunnyKK007)

Built with curiosity, caffeine, and a deep love for books. 📖✨

> *"The best recommendation engine is the one that understands you — not just your search history."*
