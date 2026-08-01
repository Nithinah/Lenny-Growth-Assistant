from app.agents.llm import get_llm_provider
from app.rag.retriever import Retriever
from typing import AsyncGenerator

class QASkill:
    def __init__(self):
        self.llm = get_llm_provider()
        self.retriever = Retriever()
        
    async def process(self, query: str) -> AsyncGenerator[str, None]:
        context_chunks = self.retriever.retrieve(query)
        context_str = "\n\n".join(context_chunks)
        
        system_prompt = (
            "You are an expert product management assistant based strictly on Lenny's Podcast. "
            "Use ONLY the following context to answer the user's question. Answer to the best of your ability using only this context. "
            "If the context provides no relevant information at all, state that you cannot find the exact answer in the transcripts, but share any loosely related information you found.\n\n"
            f"Context:\n{context_str}"
        )
        
        async for chunk in self.llm.stream(query, system_prompt):
            yield chunk
