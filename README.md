# The Lenny Growth Assistant

The Lenny Growth Assistant is a full-stack, AI-powered conversational web app that allows users to ask product management and growth questions. The assistant answers strictly from Lenny's Podcast transcripts using RAG (Retrieval-Augmented Generation).

## Features
- **RAG-based Chat**: Answers grounded strictly in Lenny's Podcast transcripts.
- **Ship30for30 Mode**: Reformats answers into a ~1,250-word essay with a strong hook, bullets, and a clear takeaway.
- **Artifact Viewer**: Renders generated Markdown documents or sandboxed HTML/CSS UI snippets directly in the app.
- **LLM Agnostic**: Seamlessly toggle between Gemini API (cloud) and Ollama (local).

## Prerequisites
- Docker & Docker Compose
- Node.js (for Next.js frontend)
- Python 3.10+ (if running backend locally outside Docker)
- Ollama installed locally (if testing the local LLM toggle)

## Setup Instructions

### 1. Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Fill in your `GEMINI_API_KEY`. The default provider is `gemini`.

### 2. Run Backend and Database
```bash
docker-compose up -d --build
```
This starts:
- PostgreSQL with `pgvector` on port `5432`.
- FastAPI backend on port `8000`.

### 3. Data Ingestion
To populate the database with podcast transcripts:
```bash
# If running backend natively:
source venv/Scripts/activate
pip install -r backend/requirements.txt
python -m backend.app.rag.ingest
```

### 4. Run Frontend
Navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`.

## Architecture Overview
See `architecture.md` and `design.md` for detailed information on the system design, agentic routing logic, and database schema.

