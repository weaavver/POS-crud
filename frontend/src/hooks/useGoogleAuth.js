import { useState, useCallback } from 'react';
import { googleAuthRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';

// Shared logic behind the Google button on both Login and Register.
// A brand-new Google account has no username yet, so the backend responds
// with `needs_username` instead of a token; this hook tracks that in-between
// state so the page can show a small inline "pick a username" form.
export function useGoogleAuth(onSuccess) {
  const { login } = useAuth();
  const [pendingGoogle, setPendingGoogle] = useState(null); // { credential, suggestedName, email, name }
  const [googleError, setGoogleError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const finishLogin = useCallback(
    (data) => {
      login(data.access_token, data.user);
      onSuccess?.(data);
    },
    [login, onSuccess]
  );

  const handleCredential = useCallback(
    async (credential) => {
      setGoogleError('');
      setGoogleLoading(true);
      try {
        const data = await googleAuthRequest(credential);
        if (data.needs_username) {
          setPendingGoogle({
            credential,
            suggestedName: data.suggested_name,
            email: data.email,
            name: data.name,
          });
        } else {
          finishLogin(data);
        }
      } catch (err) {
        setGoogleError(err.message);
      } finally {
        setGoogleLoading(false);
      }
    },
    [finishLogin]
  );

  const submitUsername = useCallback(
    async (username) => {
      if (!pendingGoogle) return;
      setGoogleError('');
      setGoogleLoading(true);
      try {
        const data = await googleAuthRequest(pendingGoogle.credential, username);
        setPendingGoogle(null);
        finishLogin(data);
      } catch (err) {
        setGoogleError(err.message);
      } finally {
        setGoogleLoading(false);
      }
    },
    [pendingGoogle, finishLogin]
  );

  const cancelPendingGoogle = useCallback(() => {
    setPendingGoogle(null);
    setGoogleError('');
  }, []);

  return {
    pendingGoogle,
    googleError,
    googleLoading,
    handleCredential,
    submitUsername,
    cancelPendingGoogle,
  };
}