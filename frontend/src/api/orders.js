const API_URL = 'http://localhost:8000';

export async function createOrder(items, token) {
  // Only send product IDs. The server looks up the real price and download link.
  const payload = {
    product_ids: items.map((item) => item.id),
  };

  const res = await fetch(`${API_URL}/orders/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to place order');
  }
  return res.json();
}

export async function getMyOrders(token) {
  const res = await fetch(`${API_URL}/orders/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}