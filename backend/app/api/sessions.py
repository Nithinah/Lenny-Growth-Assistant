from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session as DBSession
from app.db.session import get_db
from app.db.models import Session, Message, RoleEnum
from app.agents.orchestrator import Orchestrator
from pydantic import BaseModel
import uuid
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
orchestrator = Orchestrator()

class ChatRequest(BaseModel):
    message: str

@router.get("/")
def get_sessions(db: DBSession = Depends(get_db)):
    sessions = db.query(Session).order_by(Session.updated_at.desc()).all()
    return [{"id": str(s.id), "title": s.title, "updated_at": s.updated_at} for s in sessions]

@router.post("/")
def create_session(db: DBSession = Depends(get_db)):
    new_session = Session(title="New Chat")
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return {"id": str(new_session.id), "title": new_session.title}

@router.get("/{session_id}")
def get_session(session_id: uuid.UUID, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    messages = [
        {
            "id": str(m.id),
            "role": m.role.value,
            "content": m.content,
            "artifact_data": m.artifact_data
        }
        for m in session.messages
    ]
    return {"id": str(session.id), "title": session.title, "messages": messages}

@router.delete("/{session_id}")
def delete_session(session_id: uuid.UUID, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"ok": True}

@router.post("/{session_id}/chat")
async def chat(session_id: uuid.UUID, req: ChatRequest, db: DBSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Auto-title on first message
    if session.title == "New Chat":
        session.title = req.message[:30] + "..." if len(req.message) > 30 else req.message
    
    # Save user message
    user_msg = Message(session_id=session.id, role=RoleEnum.user, content=req.message)
    db.add(user_msg)
    db.commit()
    
    # We will generate a new message for the assistant
    assistant_msg = Message(session_id=session.id, role=RoleEnum.assistant, content="")
    db.add(assistant_msg)
    db.commit()
    
    assistant_msg_id = str(assistant_msg.id)

    async def event_generator():
        full_content = ""
        try:
            async for chunk in orchestrator.process(req.message):
                full_content += chunk
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                
            # Create a new session to save because the request `db` is already closed
            from app.db.session import SessionLocal
            with SessionLocal() as gen_db:
                # Re-fetch the message to attach it to this session
                msg = gen_db.query(Message).filter(Message.id == assistant_msg_id).first()
                if msg:
                    msg.content = full_content
                    # Robust parsing for artifact
                    if "<artifact" in full_content:
                        start = full_content.find("<artifact")
                        end = full_content.find(">", start)
                        
                        if end != -1:
                            tag = full_content[start:end+1]
                            content_start = end + 1
                            
                            if "</artifact>" in full_content:
                                content_end = full_content.rfind("</artifact>")
                            else:
                                content_end = len(full_content)
                                
                            artifact_content = full_content[content_start:content_end].strip()
                            
                            type_attr = "markdown"
                            if 'type="html"' in tag or "type='html'" in tag:
                                type_attr = "html"
                                
                            msg.artifact_data = {"type": type_attr, "content": artifact_content}
                            
                            # Clean up the chat bubble so it doesn't show raw XML
                            msg.content = full_content[:start].strip()
                            if not msg.content:
                                msg.content = "I have generated the requested artifact. Click the button below to view it."
                                
                    gen_db.commit()
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            logger.error(f"Chat streaming error: {e}", exc_info=True)
            error_message = f"Sorry, an error occurred: {str(e)}"
            from app.db.session import SessionLocal
            with SessionLocal() as gen_db:
                msg = gen_db.query(Message).filter(Message.id == assistant_msg_id).first()
                if msg:
                    msg.content = error_message
                    gen_db.commit()
            yield f"data: {json.dumps({'chunk': error_message})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
