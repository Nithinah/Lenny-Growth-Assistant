from .base import LLMProvider
from google import genai
from google.genai import types
from app.config import settings
from typing import AsyncGenerator

class GeminiProvider(LLMProvider):
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = settings.GEMINI_CHAT_MODEL

    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
        ) if system_prompt else None
        
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config,
        )
        return response.text

    async def stream(self, prompt: str, system_prompt: str = "") -> AsyncGenerator[str, None]:
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
        ) if system_prompt else None
        
        response_stream = self.client.aio.models.generate_content_stream(
            model=self.model,
            contents=prompt,
            config=config,
        )
        async for chunk in response_stream:
            yield chunk.text
