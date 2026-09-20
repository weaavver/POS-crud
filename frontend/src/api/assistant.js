const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// `history` is [{ role: 'user' | 'assistant', content: string }, ...] —
// only the earlier turns, not the message being sent now.
export async function sendChatMessage(message, history = []) {
  const res = await fetch(`${API_URL}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'The assistant is unavailable right now.');
  }
  return res.json();
}
