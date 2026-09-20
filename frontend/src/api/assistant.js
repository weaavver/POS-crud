const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// `history` is [{ role: 'user' | 'assistant', content: string }, ...] —
// only the earlier turns, not the message being sent now.
// `token` is optional: pass it when the visitor is logged in so the backend
// can tell whether they're an admin (needed for the sales-report tool).
export async function sendChatMessage(message, history = [], token) {
  const res = await fetch(`${API_URL}/assistant/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'The assistant is unavailable right now.');
  }
  return res.json();
}