from abc import ABC, abstractmethod
from typing import AsyncGenerator

class LLMProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        pass

    @abstractmethod
    async def stream(self, prompt: str, system_prompt: str = "") -> AsyncGenerator[str, None]:
        pass
