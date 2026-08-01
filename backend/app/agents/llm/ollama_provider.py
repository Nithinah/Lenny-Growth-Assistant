from .base import LLMProvider
from app.config import settings
import httpx
import json
import logging
from typing import AsyncGenerator

logger = logging.getLogger(__name__)

class OllamaProvider(LLMProvider):
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL

    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        # Use a long timeout: on CPU, even a short classification can take minutes.
        # httpx.Timeout: (connect, read, write, pool)
        timeout = httpx.Timeout(10.0, read=None)
        async with httpx.AsyncClient(timeout=timeout) as client:
            logger.info(f"Ollama generate: sending request to {self.base_url}/api/generate model={self.model}")
            response = await client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "system": system_prompt,
                    "stream": False
                },
            )
            response.raise_for_status()
            result = response.json().get("response", "")
            logger.info(f"Ollama generate: got response length={len(result)}")
            return result

    async def stream(self, prompt: str, system_prompt: str = "") -> AsyncGenerator[str, None]:
        # Use a long read timeout so slow CPU generation doesn't get killed.
        timeout = httpx.Timeout(10.0, read=None)
        async with httpx.AsyncClient(timeout=timeout) as client:
            logger.info(f"Ollama stream: sending request to {self.base_url}/api/generate model={self.model}")
            async with client.stream(
                "POST",
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "system": system_prompt,
                    "stream": True
                },
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            token = data.get("response", "")
                            if token:
                                yield token
                        except json.JSONDecodeError:
                            logger.warning(f"Ollama stream: failed to parse line: {line[:100]}")
