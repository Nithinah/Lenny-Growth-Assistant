# Product Requirements Document (PRD)

## Project Objective
Build "The Lenny Growth Assistant" — a full-stack, AI-powered conversational web app designed to answer product management and growth questions. Answers must be strictly grounded in Lenny's Podcast transcripts. The assistant should also provide specialized output formats, including "Ship30for30" style essays, and generate viewable markdown or HTML/CSS artifacts on demand.

## Problem Statement
Users need actionable, reliable insights from Lenny's Podcast, but finding specific answers across numerous podcast transcripts is difficult. Furthermore, users often need these insights reformatted into skimmable, engaging content (like Ship30for30 essays) or concrete artifacts (documents and UI snippets) without leaving the chat interface. General-purpose AI tools often hallucinate or provide generic advice when asked specific podcast-related questions.

## Target User
The target user is a product manager or growth professional (and specifically, the evaluator testing this submission locally). They expect a fast, reliable, and aesthetically pleasing interface with a clear separation of chat and generated artifacts.

## Features & Requirements
1. **RAG-based Chat**: The core functionality is Q&A grounded *strictly* in the provided podcast transcripts. If the transcripts don't cover a topic, the assistant must explicitly state that instead of hallucinating general knowledge.
2. **Ship30for30 Formatting**: Ability to reformulate answers into a ~1,250-word essay with a strong hook, heavy use of bullets and bold text, and a clear one-line takeaway at the end.
3. **Artifact Generation**: Generate Markdown documents or HTML/CSS snippets and render them in a side-by-side Artifact Viewer, not directly in the chat bubble.
4. **Session Management**: Support for multiple isolated chat sessions ("New Chat" functionality), persisted across reloads.
5. **Provider Agnostic LLM Setup**: The system must seamlessly switch between a cloud LLM (Gemini) and a local LLM (Ollama) via an environment variable, without code changes.

## Success Criteria (Mapped to Evaluation Rubric)

1. **Agentic Architecture & Skills**
   - **Criteria**: The orchestrator correctly routes user messages to the appropriate skill (Q&A, Ship30for30, or Artifact Generation).
   - **Validation**: Test various queries explicitly asking for an essay, an HTML snippet, or a basic question, and verify the routing log in the backend.

2. **System Design**
   - **Criteria**: Clear technical writing (this PRD, architecture.md, design.md). Sound database structure with Alembic migrations. Well-structured FastAPI backend handling sessions and LLM configuration toggle.
   - **Validation**: Evaluator can easily start the backend and frontend. The DB schema supports all required data (conversations, messages, chunks).

3. **Code Quality & Robustness**
   - **Criteria**: Clean separation of concerns. The system gracefully handles errors like missing API keys, Ollama timeouts, and database connection failures without throwing raw stack traces to the user.
   - **Validation**: Turn off Ollama or provide an invalid Gemini API key and verify that the UI surfaces a user-friendly error message.

4. **Product Sense, UI, UX**
   - **Criteria**: Smooth chat experience with streaming (WebSocket/SSE). Artifact viewer successfully renders Markdown and sandboxed HTML/CSS. Overall UI polish.
   - **Validation**: The chat feels responsive. HTML artifacts do not inject malicious scripts into the main DOM.

5. **Prompt Engineering & Output Quality**
   - **Criteria**: Ship30for30 style accurately follows the provided structure. Transcript grounding is strictly maintained (no hallucinated external facts).
   - **Validation**: Ask for a Ship30for30 essay and verify the hook, bullets, and one-line takeaway. Ask a question not covered in the transcripts and verify the model declines to answer from general knowledge.
