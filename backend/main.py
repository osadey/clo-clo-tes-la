import os
from pathlib import Path

from anthropic import Anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

load_dotenv(override=True)

MODEL = os.getenv("CLOCLO_MODEL", "claude-sonnet-4-6")
MAX_TOKENS = 512

SYSTEM_PROMPT = (
    "Tu es Clo-clo, l'assistant vocal embarqué dans une Tesla. "
    "L'utilisateur te parle pendant qu'il conduit, donc tes réponses doivent être : "
    "courtes (2-3 phrases maximum sauf demande contraire), en français, "
    "dans un style oral naturel — pas de markdown, pas de listes à puces, pas de code. "
    "Si une question demande une réponse longue, propose un résumé et demande "
    "à l'utilisateur s'il veut plus de détails."
)

client = Anthropic()

app = FastAPI(title="clo-clo-tes-la")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


class ChatResponse(BaseModel):
    reply: str


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    try:
        resp = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            messages=[m.model_dump() for m in req.messages],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Anthropic API error: {e}")

    reply = "".join(block.text for block in resp.content if block.type == "text")
    return ChatResponse(reply=reply.strip())


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok", "model": MODEL}


frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
