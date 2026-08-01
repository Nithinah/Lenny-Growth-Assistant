# Design Document

## UI/UX Structure

The application will feature a modern, dark-themed (or clean light-themed) interface designed for productivity and readability. 

### Layout
The interface is structured as a split-pane layout to maximize utility:

1. **Sidebar (Left, 20% width, collapsible)**
   - Houses the "New Chat" button prominently.
   - Lists previous chat sessions grouped by date (Today, Previous 7 Days, etc.).
   - Contains a settings toggle to visually indicate which LLM is currently active (read-only state fetched from backend).

2. **Chat Pane (Center, 40-80% width)**
   - The primary interaction zone.
   - Features a clean message history. User messages align right, Assistant messages align left.
   - Includes an input bar fixed to the bottom.
   - When an artifact is generated, instead of dumping massive code blocks in the chat, the assistant will output a small, interactive "View Artifact" card in the chat bubble.

3. **Artifact Viewer (Right, 40% width, conditional)**
   - Hidden by default. Opens smoothly when an artifact is generated or when the user clicks "View Artifact".
   - Provides a dedicated, wide space to read long Markdown documents (like the Ship30for30 essay) or interact with generated HTML/CSS UI snippets.
   - The HTML/CSS snippets will be rendered inside an `<iframe sandbox="allow-scripts">` to ensure security and prevent the generated code from polluting or breaking the main React application's DOM.

## Reasoning for Split-Pane Layout
Rendering raw HTML/CSS inside a chat interface is risky and often leads to broken layouts if the LLM generates unclosed tags or conflicting CSS classes. The Artifact Viewer solves this by sandboxing the output. Furthermore, long-form content like a 1,250-word essay is hard to read in a narrow chat bubble; a dedicated pane provides a significantly better reading experience.

## Ambiguities and Decisions Made

1. **Ingestion Script Automation**
   - *Ambiguity:* The spec mentions writing an ingestion script but doesn't specify if it should assume the repo is already cloned.
   - *Decision:* The script will automatically clone `https://github.com/ChatPRD/lennys-podcast-transcripts` to a temporary directory, parse it, and then clean up. This provides a better "one-click" setup experience for the evaluator.

2. **Embeddings Model when using Local LLM**
   - *Ambiguity:* The spec allows using Gemini embeddings or a local model.
   - *Decision:* We will use `sentence-transformers/all-MiniLM-L6-v2` locally when `LLM_PROVIDER=ollama` and `gemini-embedding-001` when `LLM_PROVIDER=gemini`. However, to avoid maintaining two separate vector spaces (which would complicate DB schema and retrieval), the ingestion script will standardise on `all-MiniLM-L6-v2` for both, or we will maintain a separate `embedding_gemini` and `embedding_local` column. 
   - *Refined Decision:* To keep it simple and free, we will use a local sentence transformer (`all-MiniLM-L6-v2`) for *all* embeddings, regardless of the active text-generation LLM. This avoids burning Gemini API quota during ingestion and ensures the RAG retrieval logic remains consistent.

3. **Ship30for30 Formatting Constraints**
   - *Ambiguity:* How strictly should the Ship30for30 format be enforced?
   - *Decision:* The system will use a specialized system prompt for the Ship30for30 skill that explicitly forces the structural rules (Hook, 3-4 bolded bullet points, clear one-line takeaway). We will not rely on a generic "write an essay" prompt.
