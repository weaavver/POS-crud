import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import GoogleButton from '../components/GoogleButton';
import GoogleUsernamePrompt from '../components/GoogleUsernamePrompt';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Where the visitor was trying to go before being sent here (set by ProtectedRoute / Add to Cart)
  const from = location.state?.from?.pathname;

  const goAfterLogin = (data) => {
    if (from) {
      navigate(from, { replace: true });
    } else if (data.user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const {
    pendingGoogle,
    googleError,
    googleLoading,
    handleCredential,
    submitUsername,
    cancelPendingGoogle,
  } = useGoogleAuth(goAfterLogin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginRequest(username, password);
      login(data.access_token, data.user);
      goAfterLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-[#1b2838] border border-[#2a3f5a] rounded-sm px-3 py-2 text-white focus:outline-none';

  return (
    <div className="flex items-center justify-center bg-[#1b2838] px-4 py-16">
      <div className="w-full max-w-sm bg-[#16202d] border border-[#2a3f5a] rounded-sm p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Log in to Vault</h1>

        {(error || googleError) && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded px-3 py-2 mb-4">
            {error || googleError}
          </div>
        )}

        {pendingGoogle ? (
          <GoogleUsernamePrompt
            pendingGoogle={pendingGoogle}
            loading={googleLoading}
            onSubmit={submitUsername}
            onCancel={cancelPendingGoogle}
          />
        ) : (
          <>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#c7d5e0] mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            className="w-full bg-[#66c0f4] text-[#171a21] font-semibold rounded-sm py-2 hover:bg-[#3d7ea6] transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-[#2a3f5a]" />
          <span className="text-xs text-[#8f98a0]">OR</span>
          <div className="h-px flex-1 bg-[#2a3f5a]" />
        </div>

        <GoogleButton onCredential={handleCredential} />

        <p className="text-sm text-[#8f98a0] mt-6 text-center">
          New here?{' '}
          <Link to="/register" state={location.state} className="text-[#66c0f4] hover:underline">
            Create an account
          </Link>
        </p>
        </>
        )}
      </div>
    </div>
  );
}