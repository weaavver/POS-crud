from pydantic import BaseModel
from typing import List, Literal, Optional


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []


class ReportFile(BaseModel):
    filename: str
    content_base64: str


class ChatResponse(BaseModel):
    reply: str
    report: Optional[ReportFile] = None