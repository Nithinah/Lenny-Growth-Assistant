from app.agents.llm import get_llm_provider
from app.agents.skills.qa import QASkill
from app.agents.skills.ship30 import Ship30Skill
from app.agents.skills.artifact import ArtifactSkill
import logging
import re
from typing import AsyncGenerator

logger = logging.getLogger(__name__)

class Orchestrator:
    def __init__(self):
        self.llm = get_llm_provider()
        
    def route_by_keywords(self, query: str) -> str:
        """Fast keyword-based routing that doesn't require an LLM call.
        This avoids the multi-minute blocking generate() call on CPU-based Ollama."""
        q = query.lower().strip()
        
        # Check for ship30 patterns
        ship30_patterns = [
            r'\bship\s*30\b', r'\bship30\b', r'\bship\s*for\s*30\b',
            r'\batomic\s*essay\b', r'\bpunchy\s*essay\b',
            r'\bwrite\s+(me\s+)?an?\s+essay\b',
        ]
        for pat in ship30_patterns:
            if re.search(pat, q):
                return 'ship30'
        
        # Check for artifact patterns
        artifact_patterns = [
            r'\bgenerate\s+(an?\s+)?(html|css|code|markdown|document|snippet)\b',
            r'\bcreate\s+(an?\s+)?(html|css|code|markdown|document|snippet)\b',
            r'\bbuild\s+(an?\s+)?(html|css|code|app|dashboard|website|page|ui)\b',
            r'\b(html|css)\s+code\b',
            r'\bartifact\b',
        ]
        for pat in artifact_patterns:
            if re.search(pat, q):
                return 'artifact'
        
        return 'qa'
            
    async def process(self, query: str) -> AsyncGenerator[str, None]:
        skill_name = self.route_by_keywords(query)
        logger.info(f"Routed query to skill: {skill_name}")
        
        if skill_name == 'ship30':
            skill = Ship30Skill()
        elif skill_name == 'artifact':
            skill = ArtifactSkill()
        else:
            skill = QASkill()
            
        async for chunk in skill.process(query):
            yield chunk
