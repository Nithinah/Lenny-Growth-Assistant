from sentence_transformers import SentenceTransformer
from app.db.session import SessionLocal
from app.db.models import Chunk
import logging

logger = logging.getLogger(__name__)

class Retriever:
    def __init__(self):
        self._model = None
        
    @property
    def model(self):
        if self._model is None:
            self._model = SentenceTransformer('all-MiniLM-L6-v2')
        return self._model
        
    def retrieve(self, query: str, top_k: int = 5) -> list[str]:
        query_embedding = self.model.encode(query).tolist()
        
        db = SessionLocal()
        try:
            results = db.query(Chunk).order_by(
                Chunk.embedding.l2_distance(query_embedding)
            ).limit(top_k).all()
            
            formatted_chunks = []
            for r in results:
                source = r.metadata_.get("source", "Unknown")
                formatted_chunks.append(f"[Source: {source}]\n{r.content}")
                
            return formatted_chunks
        except Exception as e:
            logger.error(f"Retrieval failed: {e}")
            return []
        finally:
            db.close()
