# 📚 Semantic Book Recommender

> **"Don't search for keywords. Search for a vibe."**

An AI-powered book recommendation engine that understands **emotions**, **tone**, and **semantic meaning** — not just matching words. Built with a FastAPI backend, a ChromaDB vector database, live Google Books integration, and a beautiful React + Framer Motion frontend.

---

## 🌐 Live Demo

- **Frontend (Live App):** [Semantic Book Recommender on Vercel](https://semantic-book-recommender.vercel.app)
- **Backend API:** [Hosted on Hugging Face Spaces](https://sunny9523-semantic-book-recomender.hf.space)

---

## ✨ Recent Upgrades

This version upgrades the earlier project with:

### 🔄 Hybrid Results Engine
- **Live + Offline hybrid results** — live Google Books results appear first (⚡ Live badge), then ChromaDB fills remaining slots (🗄️ Offline badge) to deliver **30 books per search**
- **Source badge on every book card** — users always know if a result is freshly fetched or from the local AI library

### ⚡ Performance & UX
- **Client-side tone sorting** — switching tones (Happy, Sad, Romantic, etc.) is now **instant** with zero API calls using `useMemo`
- **Race condition fix** — eliminated the "No results" flash bug using request ID tracking instead of shared AbortController state
- **Optimised caching** — cache key excludes tone (since tone only affects sort order), preventing unnecessary re-fetches
- **Warning suppression** — silenced the `urllib3` LibreSSL warning for clean terminal output

### 🏗️ Architecture
- **Modular component architecture** — App.jsx refactored into 7 focused components (Navbar, Hero, FilterBar, HowItWorks, ResultsGrid, Footer, BookModal)
- Thread-safe in-memory cache with `threading.Lock`
- Background ChromaDB enrichment with quality filtering, ISBN deduplication, and 15K-entry LRU eviction
- ChromaDB offline fallback when live results are unavailable
- 32 genre filters and 19 emotional tones
- Clickable book detail modal with emotion breakdown bars
- Skeleton loading cards and polished card animations
- Docker/Nginx `/api` proxy routing for production containers
- Synced `hf-space/` backend deployment copy for Hugging Face Spaces

---

## 🌟 Why I Built This

As a reader, I was frustrated by how shallow most book discovery tools are.

Standard search engines are flawed. If you search for *"a sad story about war"*, they simply look for the text `"sad"` and `"war"` in the title or metadata. But that's not how readers think.

Readers search for **vibes**:
- *"A book that feels like a rainy Sunday"*
- *"A cyberpunk detective story with a gloomy atmosphere"*
- *"Something hopeful after a tough year"*

No search engine understood that — until now.

**This project bridges the gap between human emotional intent and book metadata.** It uses real AI — not filters, not tags — to understand what you *feel* like reading.

---

## 🧩 The Problem I Solved

| Old Way | This Project |
|---------|-------------|
| Match keywords in title/author | Understand the **meaning** behind a query |
| Filter by genre tags | Filter and rank by **emotional tone** (7 emotions) |
| Static database lookup | **Hybrid fetch** — Live API + Local AI database |
| Alphabetical or popularity sort | Sort by **emotional resonance** to your query |
| Cold, robotic results | Results that feel **personal and mood-aware** |
| Limited result count | **30 books per search** via hybrid filling |

---

## 🧠 How It Works — The Full Pipeline

```
User Types a Query → Clicks Search or Presses Enter
       │
       ▼
 ┌─────────────────────────────────────┐
 │  STEP 1: Cache Check                │
 │  Identical query + category within  │
 │  10 minutes returns instantly       │
 └──────────────┬──────────────────────┘
                │ (cache miss)
                ▼
 ┌─────────────────────────────────────┐
 │     STEP 2: Query Augmentation      │
 │  Category filter → appended as      │
 │  Google subject: prefix             │
 └──────────────┬──────────────────────┘
                │
                ▼
 ┌─────────────────────────────────────┐
 │  STEP 3: Live Fetch (Google Books)  │
 │  Fetches up to 30 fresh books       │
 │  Filters: English only, has ISBN13, │
 │  description ≥ 20 words             │
 └──────────────┬──────────────────────┘
                │
         ┌──────┴──────┐
    SUCCESS          FAILURE
         │               │
         ▼               ▼
 ┌───────────────┐ ┌────────────────────┐
 │  Emotion      │ │  ChromaDB Offline  │
 │  Analysis     │ │  Full Fallback     │
 │  (distil-     │ │  30 books from     │
 │  roberta)     │ │  semantic search   │
 └───────┬───────┘ └─────────┬──────────┘
         │                   │
         ▼                   │
 ┌───────────────┐           │
 │  STEP 4:      │           │
 │  Hybrid Fill  │           │
 │  Fill to 30   │           │
 │  from ChromaDB│           │
 │  (deduped)    │           │
 └───────┬───────┘           │
         │                   │
         ▼                   │
 ┌───────────────┐           │
 │  Background   │           │
 │  ChromaDB     │           │
 │  Save (async) │           │
 └───────┬───────┘           │
         │                   │
         └──────┬────────────┘
                ▼
 ┌─────────────────────────────────────┐
 │  STEP 5: Client-Side Tone Sorting   │
 │  Frontend instantly sorts by the    │
 │  emotion matching the user's        │
 │  selected tone using useMemo        │
 └──────────────┬──────────────────────┘
                │
                ▼
       📖 30 Ranked Book Results
          (⚡ Live + 🗄️ Offline)
```

### 🔄 Hybrid Results (Live + Offline Fill)

Every search aims to return **30 books**:
1. **Live books come first** — freshly fetched from Google Books API with real-time emotion analysis, tagged with `source: "live"`
2. **ChromaDB fills the rest** — semantically similar books from the local vector store fill remaining slots, tagged with `source: "offline"`
3. **ISBN deduplication** ensures no book appears twice
4. Users see clear **⚡ Live** and **🗄️ Offline** badges on each card

### 🎛️ Client-Side Tone Sorting

Tone sorting (Happy, Sad, Romantic, etc.) is handled entirely on the frontend using React's `useMemo`:
- Switching tones is **instant** — no network request, no loading spinner
- The same books are re-ordered by the matching emotion score (e.g., "Romantic" sorts by `joy` descending)
- Only changing the **Category** triggers a new API fetch

### 🔄 Cache-on-Demand (Background ChromaDB Update)

When a live fetch succeeds, the results are saved to ChromaDB **in a background thread** with:
- **Quality filter** — only books with description ≥ 30 words and at least one emotion score > 0.2
- **ISBN deduplication** — skips books that already exist in the vector store
- **LRU eviction** — if the DB exceeds 15,000 books, the oldest entries (by `stored_at` timestamp) are deleted first
- **Zero latency impact** — the save runs asynchronously after the response is sent

### 🧯 Offline Fallback

If Google Books fails or returns no usable books, the API falls back entirely to ChromaDB:
- It searches stored book descriptions semantically with `sentence-transformers/paraphrase-MiniLM-L3-v2`
- It removes duplicate ISBNs
- It applies the selected category with keyword matching
- All results are tagged with `source: "offline"`

---

## 🤖 AI Models Used

### 1. Emotion Analysis Model
| Property | Detail |
|----------|--------|
| **Model Name** | `j-hartmann/emotion-english-distilroberta-base` |
| **Source** | HuggingFace Hub |
| **Architecture** | DistilRoBERTa (distilled from RoBERTa-base) |
| **Task** | Multi-label Text Classification |
| **Output** | 7 emotion scores per sentence: `joy`, `sadness`, `anger`, `fear`, `surprise`, `disgust`, `neutral` |
| **How It's Used** | Each sentence of a book's description is scored. We take the **max** score across all sentences per emotion to get the book's emotional "peak" |
| **Runs On** | Apple MPS (Mac GPU), CUDA (Nvidia GPU), or CPU |

### 2. Semantic Embedding Model
| Property | Detail |
|----------|--------|
| **Model Name** | `sentence-transformers/paraphrase-MiniLM-L3-v2` |
| **Source** | HuggingFace / Sentence Transformers |
| **Architecture** | MiniLM (3 layers, ultra-lightweight) |
| **Task** | Sentence Embedding / Semantic Similarity |
| **Output** | 384-dimensional dense vector per text |
| **How It's Used** | Book descriptions are embedded and stored in ChromaDB. At query time, the query is embedded and compared via cosine similarity to find semantically similar books |
| **Runs On** | CPU (intentional — avoids MPS conflicts on Mac) |

### Tone → Emotion Mapping
The UI exposes human-friendly tone labels that map to underlying emotion scores:

| Tone (UI) | Emotion Score Used |
|-----------|-------------------|
| Happy | `joy` |
| Sad / Melancholic / Dark / Emotional | `sadness` |
| Suspenseful / Intense | `fear` |
| Angry | `anger` |
| Surprising / Mysterious / Curious | `surprise` |
| Disturbing | `disgust` |
| Romantic / Inspiring / Hopeful / Nostalgic / Humorous | `joy` (proxy) |
| Relaxing / Thoughtful | `neutral` |

---

## 🛠️ Tech Stack

### 🎨 Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19 + Vite 7** | Blazing fast UI with HMR |
| **Vanilla CSS** | Custom design system with CSS variables |
| **Framer Motion** | Premium animations (staggered cards, modals, transitions) |
| **Axios** | HTTP client for API calls with AbortController cancellation |
| **Lucide React** | Icon set |

Key UI features:
- Sticky glassmorphism navbar with branding
- Animated mesh gradient background with glowing orbs
- Compact search bar with example query chips (search on Enter or button click only)
- **Pill-style filter buttons** for 32 genres and 19 emotional tones
- **⚡ Live / 🗄️ Offline source badges** on every book card
- **Client-side tone sorting** — instant reorder with `useMemo`, no API call
- **"How it Works"** section with feature cards (shown before first search)
- **Skeleton loading cards** with shimmer animation (replaces spinner)
- **Book detail modal** — click any card to see full description + animated emotion breakdown bars
- Dominant emotion badge per book (🌟 Joyful / 😨 Suspense / 💧 Sad / 🔥 Angry / ✨ Surprising / 🌑 Disturbing)
- Star rating badge on each card
- Result count indicator
- Staggered card entrance animations
- Race-condition-free request management (request ID tracking)
- Responsive auto-fill grid
- Production-safe `/api` routing for Docker/Nginx deployments
- CSS-only card and skeleton layout — no Tailwind dependency required
- Professional footer with tech credits
- Friendly error state with "Try Again" button

### ⚙️ Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | High-performance async Python API framework |
| **Uvicorn** | ASGI server with hot-reload |
| **LangChain** | AI pipeline orchestration |
| **langchain-chroma** | ChromaDB integration |
| **langchain-huggingface** | HuggingFace embeddings wrapper |
| **HuggingFace Transformers** | Running local AI models |
| **Sentence Transformers** | Lightweight semantic embedding |
| **ChromaDB** | Local persistent vector database (10K+ books, self-growing) |
| **Pandas / NumPy** | Data processing |
| **Google Books API** | Live book data source |
| **Python-dotenv** | Environment variable management |

Key backend features:
- **Hybrid results engine** — Live Google Books results + ChromaDB filler books, deduped by ISBN, targeting 30 books per search
- **Source tagging** — every book is tagged with `source: "live"` or `source: "offline"`
- **In-memory response cache** (10-minute TTL) — cache key is `(query, category)` only; tone excluded since sorting is client-side
- **Thread-safe cache** — protected by `threading.Lock` for concurrent request safety
- **Cache-on-demand** — live results automatically enrich ChromaDB in a background thread
- **ISBN deduplication** — prevents duplicate entries in the vector store
- **LRU eviction** — oldest books are automatically deleted when the DB exceeds 15K entries
- **Quality filter** — only books with meaningful descriptions and emotion scores are persisted
- **Warning suppression** — LibreSSL/urllib3 warnings silenced for clean output
- **Configurable CORS** — restricted to production domain via `ALLOWED_ORIGIN` env var

### 🐳 DevOps
| Technology | Purpose |
|-----------|---------|
| **Docker + Docker Compose** | Containerised deployment |
| **Nginx** | Frontend reverse proxy in Docker (`/api/*` → backend) |
| **Hugging Face Spaces** | Docker backend deployment copy in `hf-space/` |

---

## 📂 Project Structure

```
Book Recom./
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry, CORS, health check, warning suppression
│   │   ├── api.py            # /recommend — hybrid fetch + ChromaDB fill + caching + source tagging
│   │   └── schemas.py        # Pydantic response models (Book schema with source field)
│   ├── data/
│   │   ├── data_fetcher.py   # GoogleBooksFetcher — calls Google Books API
│   │   ├── data_processor.py # DataProcessor — emotion analysis, ChromaDB CRUD, dedup, LRU eviction
│   │   └── pipeline.py       # Batch ingestion pipeline (offline use)
│   ├── chroma_db/            # Persisted vector store (10K+ pre-embedded books, self-growing)
│   ├── requirements.txt      # Python dependencies (pinned versions)
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main app — state management, client-side tone sorting, request tracking
│   │   ├── components/
│   │   │   ├── Navbar.jsx    # Sticky glassmorphism navbar with branding
│   │   │   ├── Hero.jsx      # Search bar, heading, example query chips
│   │   │   ├── FilterBar.jsx # Genre + Tone pill filter buttons
│   │   │   ├── HowItWorks.jsx# Feature cards shown before first search
│   │   │   ├── ResultsGrid.jsx# Book grid with count, error states, empty states
│   │   │   ├── BookCard.jsx  # Book card with emotion, rating, and source badges
│   │   │   ├── BookModal.jsx # Full book detail modal with emotion breakdown bars
│   │   │   ├── SkeletonCard.jsx # Shimmer loading placeholder cards
│   │   │   └── Footer.jsx   # Professional footer with tech credits
│   │   ├── index.css         # Design system — glass-panel, pills, skeleton, modal, animations
│   │   └── main.jsx          # React entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf            # Docker proxy: /api/* → backend:7860
│   └── Dockerfile
│
├── hf-space/                 # Hugging Face Spaces backend deployment copy
│   ├── app/                  # Synced FastAPI source
│   ├── data/                 # Synced data/model pipeline source
│   ├── README.md             # Space metadata
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml        # Orchestrates frontend + backend containers
└── README.md
```

---

## 🔑 API Reference

### `GET /recommend`

Returns a ranked list of book recommendations (up to 30 books via hybrid filling).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ Yes | Natural language query describing the vibe/plot |
| `category` | string | ❌ No | Genre filter (e.g., `Fiction`, `Mystery`, `Sci-Fi`) |
| `tone` | string | ❌ No | Emotional tone (accepted for backward compatibility; sorting is now client-side) |
| `limit` | int | ❌ No | Requested result limit (default: 16; API targets 30 via hybrid filling) |

**Example:**
```
GET /recommend?query=a+lonely+astronaut+searching+for+meaning&category=Sci-Fi
```

**Response Schema (Book):**
```json
{
  "isbn13": "9780553380163",
  "title": "The Martian",
  "authors": "Andy Weir",
  "categories": "Fiction",
  "description": "...",
  "thumbnail": "https://...",
  "published_year": 2011,
  "average_rating": 4.4,
  "joy": 0.72,
  "sadness": 0.18,
  "anger": 0.05,
  "fear": 0.31,
  "surprise": 0.42,
  "disgust": 0.03,
  "neutral": 0.55,
  "source": "live"
}
```

The `source` field indicates where the book came from:
- `"live"` — freshly fetched from Google Books API with real-time emotion analysis
- `"offline"` — retrieved from the local ChromaDB vector store

### `GET /`
Health check — returns API status and a short running message.

### `GET /categories`
Returns the list of 32 available genre categories for filtering.

---

## 🚀 How to Run Locally

### Option 1: Simple Setup (Python + Node) — Recommended

**Step 1: Backend**
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn app.main:app --reload --port 8000
```

> ⏳ **First run:** The emotion model (~329 MB) will download from HuggingFace. This is one-time only — subsequent starts are instant.

**Step 2: Frontend**
```bash
# In a new terminal
cd frontend
npm ci
npm run dev
```

**Step 3: Enjoy 🎉**
Open **http://localhost:5173** in your browser.

---

### Option 2: Docker 🐳

Perfect for deployment or consistent environments.

```bash
# From the root directory
docker-compose up --build -d
```

The frontend container serves the React build on port `3000`. Nginx forwards `/api/*` requests to the backend container on its internal port `7860`, while the backend is also exposed locally at `http://localhost:8000`.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

### Troubleshooting

| Issue | Fix |
|-------|-----|
| Model download stuck at 0% | Check internet, try `pip install huggingface_hub` then `huggingface-cli download j-hartmann/emotion-english-distilroberta-base` |
| `LibreSSL` warning | Automatically suppressed in `main.py` — no action needed |
| CORS error in browser | Make sure backend is running on port 8000 |
| Empty results | Google Books API has rate limits without a key — add `GOOGLE_BOOKS_API_KEY` in `backend/.env` |
| Frontend dependencies behave strangely | Run `npm ci` inside `frontend/` to reinstall from `package-lock.json` |
| MPS errors on Mac | Upgrade to latest PyTorch nightly for Apple Silicon support |
| "No results" flash on search | Fixed — request ID tracking prevents stale state updates |

---

## ☁️ Deployment Guide

This project is designed to be deployed across two free hosting platforms: **Vercel** (for the fast frontend) and **Hugging Face Spaces** (for the AI-heavy backend).

### 1. Backend → Hugging Face Spaces (Docker)
Hugging Face Spaces provides the necessary computing power to run the PyTorch/Transformers models.
1. Create a new Space on [Hugging Face](https://huggingface.co/spaces).
2. Choose **Docker** as the SDK.
3. Use the synced `hf-space/` folder as the Space source and push it to Hugging Face:
   ```bash
   git clone https://huggingface.co/spaces/YourUsername/YourSpaceName my-space-backend
   cp -R hf-space/. my-space-backend/
   cd my-space-backend
   git add .
   git commit -m "Deploy backend"
   git push
   ```
   If you are already working directly inside the checked-out `hf-space/` directory, commit and push from there:
   ```bash
   cd hf-space
   git add .
   git commit -m "Deploy backend"
   git push
   ```
4. Go to your Space Settings → **Variables and secrets**, and add a New Secret named `GOOGLE_BOOKS_API_KEY` with your API key.

### 2. Frontend → Vercel
1. Go to [Vercel](https://vercel.com/new) and import your GitHub repository.
2. In the setup screen, click **Edit** next to **Root Directory** and type `frontend`.
3. The Framework Preset will automatically switch to **Vite**.
4. Open the **Environment Variables** dropdown and add:
   - Name: `VITE_API_URL`
   - Value: The direct root URL of your Hugging Face API (e.g., `https://yourusername-spacename.hf.space`).
5. Click **Deploy**.

For Docker/Nginx deployment, you can omit `VITE_API_URL`; the frontend defaults to `/api`, and Nginx proxies that path to the backend container.

---

## 🎯 Example Queries to Try

| Query | Category | Tone |
|-------|----------|------|
| *"A dystopian society where books are banned"* | Sci-Fi | Dark |
| *"A detective solving crimes in Victorian London"* | Mystery | Suspenseful |
| *"Heartwarming story about friendship and family"* | Fiction | Happy |
| *"A soldier's trauma and journey home from war"* | History | Sad |
| *"Self-improvement and building good habits"* | Self-Help | Inspiring |
| *"A lonely astronaut searching for meaning"* | Sci-Fi | Melancholic |
| *"Ancient mythology and the gods"* | Fiction | Mysterious |

---

## 👤 Author

**Sunny Kant Kumar**

Built with curiosity, caffeine, and a love for books. 📖✨
