# main.py
# This is the main server file - it defines all the API routes (URLs)

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, LogSession
from analyzer import analyze_logs
from dotenv import load_dotenv
import traceback
import json
import os

# Load environment variables from .env file
load_dotenv()

# Create the FastAPI application
app = FastAPI(title="AI Log Analyzer API")

# CORS allows your React frontend (port 5173) to talk to this backend (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────
# Route 1: POST /api/analyze
# Receives a log file, sends to Groq AI, saves result
# ─────────────────────────────────────────
@app.post("/api/analyze")
async def analyze(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Read the uploaded file
    content = await file.read()

    # Convert bytes to readable text
    text = content.decode("utf-8", errors="replace")

    # Check file is not empty
    if not text.strip():
        raise HTTPException(status_code=400, detail="File is empty")

    # Send to Groq AI for analysis
    try:
        analysis = analyze_logs(text)
    except Exception as e:
        print("=== FULL ERROR ===")
        print(traceback.format_exc())
        print("==================")
        raise HTTPException(status_code=500, detail=str(e))

    # Save result to database
    try:
        session = LogSession(
            filename=file.filename,
            raw_content=text,
            analysis=json.dumps(analysis)
        )
        db.add(session)
        db.commit()
        db.refresh(session)
    except Exception as e:
        print("Database error:", str(e))
        raise HTTPException(status_code=500, detail="Database save failed")

    return {"id": session.id, "analysis": analysis}


# ─────────────────────────────────────────
# Route 2: GET /api/history
# Returns list of past analyses
# ─────────────────────────────────────────
@app.get("/api/history")
def get_history(db: Session = Depends(get_db)):
    try:
        sessions = db.query(LogSession)\
            .order_by(LogSession.created_at.desc())\
            .limit(10)\
            .all()

        return [
            {
                "id": s.id,
                "filename": s.filename,
                "created_at": str(s.created_at)
            }
            for s in sessions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Route 3: GET /api/history/{session_id}
# Returns one specific past analysis
# ─────────────────────────────────────────
@app.get("/api/history/{session_id}")
def get_session(session_id: int, db: Session = Depends(get_db)):
    try:
        s = db.query(LogSession)\
            .filter(LogSession.id == session_id)\
            .first()

        if not s:
            raise HTTPException(status_code=404, detail="Session not found")

        return {
            "filename": s.filename,
            "analysis": json.loads(s.analysis),
            "raw": s.raw_content
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Route 4: POST /api/chat/{session_id}
# Ask a follow-up question about a log
# ─────────────────────────────────────────
@app.post("/api/chat/{session_id}")
async def chat_with_logs(
    session_id: int,
    question: dict,
    db: Session = Depends(get_db)
):
    try:
        # Get the original log session
        s = db.query(LogSession)\
            .filter(LogSession.id == session_id)\
            .first()

        if not s:
            raise HTTPException(status_code=404, detail="Session not found")

        # Use Groq to answer the question
        from groq import Groq
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert software engineer. Answer questions about application logs clearly and concisely."
                },
                {
                    "role": "user",
                    "content": f"""Here are some application logs:

{s.raw_content[:6000]}

Question: {question['text']}

Please answer clearly and concisely."""
                }
            ],
            temperature=0.1,
            max_tokens=1000
        )

        return {"answer": response.choices[0].message.content}

    except HTTPException:
        raise
    except Exception as e:
        print("Chat error:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Route 5: GET /
# Health check - confirms server is running
# ─────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "AI Log Analyzer is running", "ai": "Groq (LLaMA 3.3)"}