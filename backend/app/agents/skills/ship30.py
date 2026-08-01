from app.agents.llm import get_llm_provider
from app.rag.retriever import Retriever
from typing import AsyncGenerator

class Ship30Skill:
    def __init__(self):
        self.llm = get_llm_provider()
        self.retriever = Retriever()
        
    async def process(self, query: str) -> AsyncGenerator[str, None]:
        context_chunks = self.retriever.retrieve(query)
        context_str = "\n\n".join(context_chunks)
        
        system_prompt = (
            "You are an expert content writer trained in the Ship 30 for 30 style. "
            "Using ONLY the provided context from Lenny's Podcast, answer the user's query by writing a ~1,250-word essay. "
            "You MUST follow these formatting rules exactly:\n"
            "1. Start with a strong, punchy hook.\n"
            "2. Make heavy use of bullets and bold text for skimmability.\n"
            "3. End with a clear, one-line takeaway.\n"
            "Synthesize an essay based on the provided context. If the context doesn't perfectly match, use your best judgment to write an essay that loosely relates to the context and the user's prompt.\n\n"
            f"Context:\n{context_str}"
        )
        
        async for chunk in self.llm.stream(query, system_prompt):
            yield chunk
