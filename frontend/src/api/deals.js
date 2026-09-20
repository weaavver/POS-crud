const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Admin-only: the games hand-picked for the Special Offers section.
export async function getManualDeals(token) {
  const res = await fetch(`${API_URL}/deals/manual`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load sales');
  return res.json();
}

export async function setManualDeal(productId, percent, token) {
  const res = await fetch(`${API_URL}/deals/manual/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ percent }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err.detail === 'string' ? err.detail : 'Failed to put this game on sale'
    );
  }
  return res.json();
}

export async function removeManualDeal(productId, token) {
  const res = await fetch(`${API_URL}/deals/manual/${productId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to remove this game from sale');
}