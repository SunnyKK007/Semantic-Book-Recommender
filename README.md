# 📚 Semantic Book Recommender

> **"Don't search for keywords. Search for a vibe."**

An AI-powered book recommendation engine that understands **emotions**, **tone**, and **semantic meaning** — not just matching words. Built with a FastAPI backend, a ChromaDB vector database, live Google Books integration, and a beautiful React + Framer Motion frontend.

---

## 🌐 Live Demo

- **Frontend (Live App):** [Semantic Book Recommender on Vercel](https://semantic-book-recommender.vercel.app)
- **Backend API:** [Hosted on Hugging Face Spaces](https://sunny9523-semantic-book-recomender.hf.space)

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
| Static database lookup | **Live fetch** from Google Books API + local vector DB |
| Alphabetical or popularity sort | Sort by **emotional resonance** to your query |
| Cold, robotic results | Results that feel **personally curated** |

---

## 🧠 How It Works — The Full Pipeline

```
User Types a Query
       │
       ▼
 ┌─────────────────────────────────────┐
 │     STEP 1: Query Augmentation      │
 │  Category filter → appended as      │
 │  Google subject: prefix             │
 └──────────────┬──────────────────────┘
                │
                ▼
 ┌─────────────────────────────────────┐
 │  STEP 2: Live Fetch (Google Books)  │
 │  Fetches up to 30 fresh books       │
 │  Filters: English only, has ISBN13, │
 │  description ≥ 20 words             │
 └──────────────┬──────────────────────┘
                │
                ▼
 ┌─────────────────────────────────────┐
 │  STEP 3: Real-Time Emotion Analysis │
 │  Model: distilroberta-base          │
 │  Splits description into sentences  │
 │  Scores each on 7 emotions          │
 │  Takes max score per emotion        │
 └──────────────┬──────────────────────┘
                │
                ▼
 ┌─────────────────────────────────────┐
 │  STEP 4: Vector Search (ChromaDB)   │
 │  Fallback if live results < limit   │
 │  Semantic similarity on descriptions│
 │  Model: paraphrase-MiniLM-L3-v2     │
 │  Filters by category keyword        │
 └──────────────┬──────────────────────┘
                │
                ▼
 ┌─────────────────────────────────────┐
 │  STEP 5: Tone-Based Ranking         │
 │  Sort by the emotion matching the   │
 │  user's selected tone (e.g., Fear   │
 │  for "Suspenseful")                 │
 └──────────────┬──────────────────────┘
                │
                ▼
      📖 Ranked Book Results
```

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
| **React 18 + Vite** | Blazing fast UI with HMR |
| **TailwindCSS** | Utility-first styling |
| **Framer Motion** | Premium animations (card entrance, search transitions) |
| **Axios** | HTTP client for API calls |
| **Lucide React** | Icon set |

Key UI features:
- Animated mesh gradient background with glowing orbs
- Glassmorphism cards with hover lift and shimmer effects
- Dominant emotion tag per book (Joyful / Suspense / Sad / Angry)
- Responsive 4-column grid (1→2→4 cols on mobile→tablet→desktop)
- Enter key support + loading spinner with animated message

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
| **ChromaDB** | Local persistent vector database |
| **Pandas / NumPy** | Data processing |
| **Google Books API** | Live book data source |
| **Python-dotenv** | Environment variable management |

### 🐳 DevOps
| Technology | Purpose |
|-----------|---------|
| **Docker + Docker Compose** | Containerised deployment |
| **Nginx** | Frontend reverse proxy in Docker |

---

## 📂 Project Structure

```
Book Recom./
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry point, CORS setup
│   │   ├── api.py            # /recommend endpoint — full pipeline logic
│   │   └── schemas.py        # Pydantic response models (Book schema)
│   ├── data/
│   │   ├── data_fetcher.py   # GoogleBooksFetcher — calls Google Books API
│   │   ├── data_processor.py # DataProcessor — emotion analysis + ChromaDB updates
│   │   └── pipeline.py       # Batch ingestion pipeline (offline use)
│   ├── chroma_db/            # Persisted vector store (pre-embedded books)
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main app — search UI, filters, results grid
│   │   ├── components/
│   │   │   └── BookCard.jsx  # Book card with emotion tag + hover effects
│   │   ├── index.css         # Global styles, glass-panel, mesh-bg, animations
│   │   └── main.jsx          # React entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf            # Nginx config for Docker deployment
│   └── Dockerfile
│
├── docker-compose.yml        # Orchestrates frontend + backend containers
├── backend.log               # Runtime logs (for debugging)
└── README.md
```

---

## 🔑 API Reference

### `GET /recommend`

Returns a ranked list of book recommendations.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ Yes | Natural language query describing the vibe/plot |
| `category` | string | ❌ No | Genre filter (e.g., `Fiction`, `Mystery`, `Sci-Fi`) |
| `tone` | string | ❌ No | Emotional tone filter (e.g., `Suspenseful`, `Happy`) |
| `limit` | int | ❌ No | Max results (default: 16) |

**Example:**
```
GET /recommend?query=a+lonely+astronaut+searching+for+meaning&category=Sci-Fi&tone=Melancholic
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
  "neutral": 0.55
}
```

### `GET /`
Health check — returns `{"status": "ok"}`.

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
npm install
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
| `LibreSSL` warning | Harmless — can safely ignore |
| CORS error in browser | Make sure backend is running on port 8000 |
| Empty results | Google Books API has rate limits without a key — add `GOOGLE_BOOKS_API_KEY` in `backend/.env` |
| MPS errors on Mac | Upgrade to latest PyTorch nightly for Apple Silicon support |

---

## ☁️ Deployment Guide

This project is designed to be deployed across two free hosting platforms: **Vercel** (for the fast frontend) and **Hugging Face Spaces** (for the AI-heavy backend).

### 1. Backend → Hugging Face Spaces (Docker)
Hugging Face Spaces provides the necessary computing power to run the PyTorch/Transformers models.
1. Create a new Space on [Hugging Face](https://huggingface.co/spaces).
2. Choose **Docker** as the SDK.
3. Clone the space locally, copy the `backend/` directory contents into it, and push it back to Hugging Face:
   ```bash
   git clone https://huggingface.co/spaces/YourUsername/YourSpaceName hf-space
   cp -r backend/. hf-space/
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
   - Value: The direct API route to your Hugging Face space (e.g., `https://yourusername-spacename.hf.space`).
5. Click **Deploy**.

---

## 🎯 Example Queries to Try

| Query | Category | Tone |
|-------|----------|------|
| *"A dystopian society where books are banned"* | Sci-Fi | Dark |
| *"A detective solving crimes in Victorian London"* | Mystery | Suspenseful |
| *"Heartwarming story about friendship and family"* | Fiction | Happy |
| *"A soldier's trauma and journey home from war"* | History | Sad |
| *"Self-improvement and building good habits"* | Self-Help | Inspiring |

---

## 👤 Author

**Sunny Kant Kumar**

Built with curiosity, caffeine, and a love for books. 📖✨
