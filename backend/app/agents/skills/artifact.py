from app.agents.llm import get_llm_provider
from typing import AsyncGenerator

class ArtifactSkill:
    def __init__(self):
        self.llm = get_llm_provider()
        
    async def process(self, query: str) -> AsyncGenerator[str, None]:
        system_prompt = (
            "You are an expert developer and writer. The user wants to generate a document or an HTML/CSS UI snippet. "
            "Your entire response MUST be wrapped in an <artifact> tag. "
            "If generating HTML/CSS, include <artifact type=\"html\">...<html>...</html>...</artifact>. "
            "If generating Markdown, include <artifact type=\"markdown\">...# Content...</artifact>. "
            "Do not include any conversational text outside of the <artifact> tag. Generate high-quality, fully self-contained code or documents."
        )
        
        async for chunk in self.llm.stream(query, system_prompt):
            yield chunk
