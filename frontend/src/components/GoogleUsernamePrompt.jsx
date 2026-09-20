import { useState } from 'react';

const inputClass =
  'w-full bg-[#1b2838] border border-[#2a3f5a] rounded px-3 py-2 text-white focus:outline-none focus:border-[#66c0f4]';

// Shown when a brand-new Google sign-in needs a username before the account
// can be created. `pendingGoogle` carries the suggested name/email so the
// person isn't starting from a blank field.
export default function GoogleUsernamePrompt({ pendingGoogle, loading, onSubmit, onCancel }) {
  const [username, setUsername] = useState(pendingGoogle.suggestedName);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(username);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6 border-t border-[#2a3f5a] pt-6">
      <p className="text-sm text-[#c7d5e0]">
        Almost done, {pendingGoogle.name.split(' ')[0]} — pick a username for {pendingGoogle.email}.
      </p>
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
          autoFocus
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#66c0f4] text-[#171a21] font-semibold rounded py-2 hover:bg-[#7fd0ff] transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Continue'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 rounded border border-[#2a3f5a] text-[#c7d5e0] hover:bg-[#1b2838] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}