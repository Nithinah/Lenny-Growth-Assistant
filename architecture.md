# Architecture Document

## High-Level Architecture
The system follows a standard three-tier architecture:
1. **Frontend:** Next.js (App Router) with Tailwind CSS and shadcn/ui.
2. **Backend:** FastAPI (Python) running orchestrator agents, RAG retrieval, and exposing API endpoints.
3. **Database:** PostgreSQL with the `pgvector` extension, running locally via Docker Compose.

## Database Schema (ERD)

The PostgreSQL database will contain the following primary tables:

1. **`sessions`**
   - `id` (UUID, Primary Key)
   - `title` (String, nullable) - Auto-generated title based on the first query.
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

2. **`messages`**
   - `id` (UUID, Primary Key)
   - `session_id` (UUID, Foreign Key -> sessions.id)
   - `role` (Enum: 'user', 'assistant', 'system')
   - `content` (Text)
   - `artifact_data` (JSON, nullable) - Stores artifact content if the message generated one.
   - `created_at` (Timestamp)

3. **`chunks`**
   - `id` (UUID, Primary Key)
   - `content` (Text) - The text of the transcript chunk.
   - `embedding` (Vector) - `pgvector` embedding.
   - `metadata` (JSONB) - Stores episode title, guest, timestamp, etc.

## API Endpoints

### Sessions & Messages
- `POST /api/sessions` - Create a new chat session.
- `GET /api/sessions` - Retrieve all sessions (for sidebar).
- `GET /api/sessions/{session_id}` - Retrieve a specific session and its message history.
- `DELETE /api/sessions/{session_id}` - Delete a session.
- `POST /api/sessions/{session_id}/chat` - Send a message to a session. This endpoint will stream the response back using Server-Sent Events (SSE) or WebSockets.

### Artifacts
- `GET /api/artifacts/{message_id}` - Retrieve the artifact associated with a specific message.

### System
- `GET /api/health` - Health check endpoint (checks DB, Ollama, and Gemini status).

## Agentic Routing Logic

The backend uses a single Orchestrator to route user queries to the appropriate skill.

**Routing Mechanism: LLM-Classifier-Based Routing**
When a new message arrives, the Orchestrator first calls a fast, low-latency LLM prompt (e.g., `gemini-2.5-flash` or the local 8B model) to classify the user's intent into one of three categories:
1. `qa`: Standard question requiring information from the podcast.
2. `ship30`: Request to format an answer or topic as a Ship30for30 essay.
3. `artifact`: Request to generate a discrete document (Markdown) or UI element (HTML/CSS).

**Execution:**
- **Q&A Skill:** Embeds the user query, performs a vector search in Postgres (`pgvector`), retrieves top-K chunks, and prompts the LLM to answer *strictly* using the retrieved context.
- **Ship30for30 Skill:** Similar to Q&A (retrieves context), but uses a specialized prompt enforcing the Ship30for30 formatting constraints (hook, skimmable bullets, one-line takeaway).
- **Artifact Skill:** Instructs the LLM to output a tagged response (e.g., `<artifact type="html">...</artifact>`). The backend parses this out, saves it to the DB as `artifact_data`, and sends it to the frontend for rendering.

## LLM Toggle Implementation

The system features a provider-agnostic LLM interface (`LLMProvider`).

- `BaseProvider`: Abstract base class defining methods like `generate()` and `stream()`.
- `GeminiProvider`: Implements `BaseProvider` using the `google-genai` SDK.
- `OllamaProvider`: Implements `BaseProvider` using `httpx` to call the local Ollama REST API (`http://localhost:11434/api/generate`).

**Toggle Mechanism:**
In `backend/app/config.py`, the system reads the `LLM_PROVIDER` environment variable. 
A factory function `get_llm_provider()` inspects this variable and instantiates the appropriate class. 
The entire backend (Orchestrator and Skills) relies on the abstract `BaseProvider`, ensuring that switching from `gemini` to `ollama` requires no code changes—only a restart of the FastAPI server with a new environment variable.
