FROM python:3.11-slim

WORKDIR /app

# Install build essentials
RUN apt-get update && apt-get install -y build-essential git && rm -rf /var/lib/apt/lists/*

# Set HuggingFace cache directory
ENV HF_HOME=/app/.cache/huggingface
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface
ENV SENTENCE_TRANSFORMERS_HOME=/app/.cache/sentence_transformers

# Copy and install dependencies first (for Docker layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Pre-download AI models at build time (files only, without loading into RAM)
RUN python -c "\
from huggingface_hub import snapshot_download; \
print('Downloading emotion model...'); \
snapshot_download('j-hartmann/emotion-english-distilroberta-base'); \
print('Done!')"

RUN python -c "\
from huggingface_hub import snapshot_download; \
print('Downloading embedding model...'); \
snapshot_download('sentence-transformers/paraphrase-MiniLM-L3-v2'); \
print('Done!')"

# Copy the backend code
COPY . .

# HuggingFace Spaces requires port 7860
EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
