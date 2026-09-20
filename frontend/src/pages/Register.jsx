import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { registerRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import GoogleButton from '../components/GoogleButton';
import GoogleUsernamePrompt from '../components/GoogleUsernamePrompt';

export default function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const goAfterAuth = () => navigate(from || '/', { replace: true });

  const {
    pendingGoogle,
    googleError,
    googleLoading,
    handleCredential,
    submitUsername,
    cancelPendingGoogle,
  } = useGoogleAuth(goAfterAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await registerRequest(name, username, email, password);
      // Backend returns a token, so the new customer is logged in right away
      login(data.access_token, data.user);
      goAfterAuth(data);
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
        <h1 className="text-2xl font-bold text-white mb-6">Create your Vault account</h1>

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
            <label className="block text-sm text-[#c7d5e0] mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-[#c7d5e0] mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              title="Letters, numbers, and underscores only"
              className={inputClass}
            />
          </div>
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
              minLength={6}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-[#c7d5e0] mb-1">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#66c0f4] text-[#171a21] font-semibold rounded py-2 hover:bg-[#7fd0ff] transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-[#2a3f5a]" />
          <span className="text-xs text-[#8f98a0]">OR</span>
          <div className="h-px flex-1 bg-[#2a3f5a]" />
        </div>

        <GoogleButton onCredential={handleCredential} />

        <p className="text-sm text-[#8f98a0] mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="text-[#66c0f4] hover:underline">
            Log in
          </Link>
        </p>
        </>
        )}
      </div>
    </div>
  );
}