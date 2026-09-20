import os
import requests
from fastapi import APIRouter, HTTPException
from starlette.concurrency import run_in_threadpool

from app.database import products_collection
from app.models.assistant import ChatRequest, ChatResponse

router = APIRouter(prefix="/assistant", tags=["assistant"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# gemini-3.1-flash-lite: current stable, free-tier-friendly Gemini model
# (the 2.5 line it replaces is being retired). Override via env if needed.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

MAX_CATALOG_ITEMS = 150  # keep the prompt small even if the catalog grows
MAX_HISTORY_TURNS = 8    # only the recent back-and-forth matters for context

# Used to build a real, clickable product page link for each catalog item.
# Falls back to the known production frontend if FRONTEND_URL isn't set.
STORE_BASE_URL = os.getenv("FRONTEND_URL", "https://vault-weaavver.vercel.app").rstrip("/")


async def _build_catalog_context() -> str:
    """A compact, LLM-readable snapshot of what's actually for sale, so the
    assistant can only ever recommend real products at their real prices —
    never hallucinated titles or prices."""
    lines = []
    cursor = products_collection.find(
        {}, {"title": 1, "price": 1, "type": 1, "platform": 1, "description": 1}
    ).limit(MAX_CATALOG_ITEMS)
    async for p in cursor:
        desc = (p.get("description") or "").strip().replace("\n", " ")
        if len(desc) > 140:
            desc = desc[:140].rsplit(" ", 1)[0] + "..."
        link = f"{STORE_BASE_URL}/products/{p['_id']}"
        lines.append(
            f"- {p.get('type', 'item')} | \"{p.get('title', 'Untitled')}\" "
            f"| ${p.get('price', 0):.2f} | {p.get('platform', 'N/A')} | {desc} | link: {link}"
        )
    return "\n".join(lines) if lines else "(the catalog is currently empty)"


def _system_prompt(catalog: str) -> str:
    return (
        "You are the shopping assistant for Vault, a digital game store. "
        "You help visitors find games to buy.\n\n"
        "Rules:\n"
        "- Only recommend or mention products that appear in the CATALOG below. Never "
        "invent titles, prices, or platforms that aren't listed there.\n"
        "- Catalog prices are current and authoritative — never guess or estimate a price.\n"
        "- Each catalog entry includes a real product page link. When a visitor asks for a "
        "link, wants to buy something, or would clearly benefit from one, share that exact "
        "link verbatim (don't shorten, alter, or invent one).\n"
        "- If nothing in the catalog matches what the visitor wants, say so honestly and "
        "either suggest the closest alternatives from the catalog or say there isn't a "
        "good match right now.\n"
        "- Keep answers short and conversational — a couple of sentences, or a short "
        "bulleted list of a few options. Don't dump the whole catalog.\n"
        "- If asked something unrelated to shopping, you can answer briefly, then gently "
        "steer the conversation back to helping them find something to buy.\n\n"
        f"CATALOG:\n{catalog}"
    )


def _call_gemini(system_prompt: str, contents: list) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Assistant is not configured (missing GEMINI_API_KEY).",
        )

    try:
        resp = requests.post(
            GEMINI_URL,
            params={"key": GEMINI_API_KEY},
            json={
                "system_instruction": {"parts": [{"text": system_prompt}]},
                "contents": contents,
                "generationConfig": {"temperature": 0.4, "maxOutputTokens": 512},
            },
            timeout=20,
        )
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="Couldn't reach the assistant service.")

    if resp.status_code == 429:
        raise HTTPException(
            status_code=429,
            detail="The assistant is a little busy right now — try again in a moment.",
        )
    if not resp.ok:
        raise HTTPException(status_code=502, detail="The assistant couldn't respond right now.")

    data = resp.json()
    try:
        parts = data["candidates"][0]["content"]["parts"]
        text = "".join(p.get("text", "") for p in parts).strip()
        return text or "Sorry, I didn't catch that — could you rephrase?"
    except (KeyError, IndexError):
        # Most likely blocked by safety filters, or an unusual/empty response.
        return "Sorry, I couldn't come up with an answer to that — could you try asking differently?"


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message can't be empty")

    catalog = await _build_catalog_context()
    system_prompt = _system_prompt(catalog)

    contents = [
        {
            "role": "user" if turn.role == "user" else "model",
            "parts": [{"text": turn.content}],
        }
        for turn in payload.history[-MAX_HISTORY_TURNS:]
    ]
    contents.append({"role": "user", "parts": [{"text": payload.message}]})

    reply = await run_in_threadpool(_call_gemini, system_prompt, contents)
    return ChatResponse(reply=reply)