import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// Reads the expiry time (in ms) out of a JWT without needing a library.
// Returns null if the token can't be decoded.
function getTokenExpiry(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const expiry = getTokenExpiry(token);
  return expiry === null || expiry <= Date.now();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('vault_token');
    const storedUser = localStorage.getItem('vault_user');
    if (storedToken && storedUser && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } else {
      // Missing or expired token: forget the saved login so the user isn't
      // treated as signed in while the server would reject every request.
      localStorage.removeItem('vault_token');
      localStorage.removeItem('vault_user');
    }
    setLoading(false);
  }, []);

  const login = (accessToken, userData) => {
    localStorage.setItem('vault_token', accessToken);
    localStorage.setItem('vault_user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('vault_token');
    localStorage.removeItem('vault_user');
    setToken(null);
    setUser(null);
  }, []);

  // If the token runs out while the tab is open, log out automatically.
  // Protected pages then redirect to /login on their own.
  useEffect(() => {
    if (!token) return;
    const expiry = getTokenExpiry(token);
    if (!expiry) return;
    const timer = setTimeout(logout, Math.max(expiry - Date.now(), 0));
    return () => clearTimeout(timer);
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}