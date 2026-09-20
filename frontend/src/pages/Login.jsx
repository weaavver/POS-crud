import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Where the visitor was trying to go before being sent here (set by ProtectedRoute / Add to Cart)
  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginRequest(email, password);
      login(data.access_token, data.user);
      if (from) {
        navigate(from, { replace: true });
      } else if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-[#1b2838] border border-[#2a3f5a] rounded px-3 py-2 text-white focus:outline-none focus:border-[#66c0f4]';

  return (
    <div className="flex items-center justify-center bg-[#1b2838] px-4 py-16">
      <div className="w-full max-w-sm bg-[#16202d] border border-[#2a3f5a] rounded-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Log in to Vault</h1>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#c7d5e0] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-[#c7d5e0] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#66c0f4] text-[#171a21] font-semibold rounded py-2 hover:bg-[#7fd0ff] transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-sm text-[#8f98a0] mt-6 text-center">
          New here?{' '}
          <Link to="/register" state={location.state} className="text-[#66c0f4] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}