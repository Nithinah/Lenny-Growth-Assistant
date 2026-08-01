import os
import shutil
import git
from pathlib import Path
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models import Chunk
from sentence_transformers import SentenceTransformer
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

REPO_URL = "https://github.com/ChatPRD/lennys-podcast-transcripts"
CLONE_DIR = Path("/tmp/lennys-podcast-transcripts")
if os.name == 'nt':
    CLONE_DIR = Path(os.environ.get("TEMP", "C:/Temp")) / "lennys-podcast-transcripts"

CHUNK_SIZE = 1000  # Characters
OVERLAP = 200

def clone_repo():
    if CLONE_DIR.exists():
        logger.info(f"Repo already exists at {CLONE_DIR}. Pulling latest...")
        repo = git.Repo(CLONE_DIR)
        repo.remotes.origin.pull()
    else:
        logger.info(f"Cloning repo to {CLONE_DIR}...")
        git.Repo.clone_from(REPO_URL, CLONE_DIR)

def chunk_text(text: str) -> list[str]:
    # Simple chunking by paragraph, then fixed window if paragraph is too long
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        if len(current_chunk) + len(para) < CHUNK_SIZE:
            current_chunk += "\n\n" + para
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = para
            
            # If a single paragraph is longer than CHUNK_SIZE, split it
            while len(current_chunk) > CHUNK_SIZE:
                chunks.append(current_chunk[:CHUNK_SIZE])
                current_chunk = current_chunk[CHUNK_SIZE - OVERLAP:]
                
    if current_chunk:
        chunks.append(current_chunk.strip())
        
    return chunks

def ingest_transcripts():
    clone_repo()
    
    # Initialize SentenceTransformer
    logger.info("Loading embedding model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    db: Session = SessionLocal()
    
    try:
        # Get existing chunk content to avoid duplicates
        existing_chunks = {c[0] for c in db.query(Chunk.content).all()}
        
        for md_file in CLONE_DIR.glob("**/*.md"):
            if md_file.name == "README.md":
                continue
                
            logger.info(f"Processing {md_file.name}...")
            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read()
                
            chunks = chunk_text(content)
            
            for i, text in enumerate(chunks):
                if text in existing_chunks:
                    continue
                    
                embedding = model.encode(text).tolist()
                
                db_chunk = Chunk(
                    content=text,
                    embedding=embedding,
                    metadata_={
                        "source": md_file.name,
                        "chunk_index": i
                    }
                )
                db.add(db_chunk)
                existing_chunks.add(text)
                
            db.commit()
            logger.info(f"Ingested {len(chunks)} chunks for {md_file.name}.")
            
    except Exception as e:
        db.rollback()
        logger.error(f"Error during ingestion: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    ingest_transcripts()
