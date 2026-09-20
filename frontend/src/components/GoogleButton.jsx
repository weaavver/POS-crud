import { useEffect, useRef } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client?hl=en';

// The Google script only needs to be injected into the page once, even if
// both Login and Register mount a GoogleButton across navigations.
let scriptPromise = null;
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// Renders Google's own "Sign in with Google" button. `onCredential` is
// called with the raw ID token string once the user completes the popup.
export default function GoogleButton({ onCredential }) {
  const containerRef = useRef(null);

  // Keep the latest callback in a ref. The parent recreates it on every render
  // (e.g. each keystroke in the login form); if it were an effect dependency,
  // the Google button would be torn down and re-rendered every time.
  const onCredentialRef = useRef(onCredential);
  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set — Google sign-in is disabled.');
      return;
    }

    let cancelled = false;

    loadGoogleScript().then(() => {
      if (cancelled || !containerRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => onCredentialRef.current(response.credential),
      });

      // Clear before rendering in case of a fast remount (e.g. React StrictMode).
      containerRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
        // Without this, the button uses the browser/Google-account language
        // (e.g. Tagalog) and swaps to it a moment after first appearing.
        locale: 'en',
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;

  return <div ref={containerRef} className="flex justify-center" />;
}