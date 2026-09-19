const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// FastAPI returns `detail` as a string for our own errors, but as an array of
// objects for validation errors (422). Turn either one into a readable message.
function errorMessage(err, fallback) {
  if (Array.isArray(err.detail)) return err.detail[0]?.msg || fallback;
  return err.detail || fallback;
}

export async function loginRequest(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(errorMessage(err, 'Login failed'));
  }
  return res.json();
}

export async function registerRequest(name, email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(errorMessage(err, 'Registration failed'));
  }
  return res.json();
}