---
title: Semantic Book Recommender API
emoji: 📚
colorFrom: purple
colorTo: blue
sdk: docker
pinned: false
app_port: 7860
---

# Semantic Book Recommender — Backend API

FastAPI backend powering the Semantic Book Recommender.

**Endpoints:**
- `GET /` — Health check
- `GET /recommend?query=...&category=...&tone=...` — Get book recommendations

Built with FastAPI, HuggingFace Transformers, LangChain, and ChromaDB.
