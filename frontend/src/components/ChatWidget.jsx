import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { sendChatMessage } from '../api/assistant';

const GREETING = {
  role: 'assistant',
  content: "Hi! I'm the Vault shopping assistant. Looking for a game?",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setError('');
    setInput('');
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setSending(true);

    try {
      // Don't send the initial greeting as if the assistant said it mid-conversation.
      const history = nextMessages.slice(1, -1);
      const { reply } = await sendChatMessage(text, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[340px] sm:w-[380px] h-[480px] max-h-[75vh] bg-[#16202d] border border-[#2a3f5a] rounded-lg shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1b2838] border-b border-[#2a3f5a]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white font-semibold text-sm">Vault Shopping Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-[#8f98a0] hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#66c0f4] text-[#171a21]'
                      : 'bg-[#1b2838] text-[#c7d5e0] border border-[#2a3f5a]'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-[#1b2838] border border-[#2a3f5a] rounded-lg px-3 py-2 text-sm text-[#8f98a0]">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce [animation-delay:-0.3s]">.</span>
                    <span className="animate-bounce [animation-delay:-0.15s]">.</span>
                    <span className="animate-bounce">.</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="px-4 pb-2 text-xs text-red-300">{error}</div>
          )}

          {/* Input */}
          <div className="border-t border-[#2a3f5a] p-3 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What are you looking for?"
              rows={1}
              className="flex-1 resize-none bg-[#1b2838] border border-[#2a3f5a] rounded px-3 py-2 text-sm text-white placeholder:text-[#8f98a0] focus:outline-none focus:border-[#66c0f4]"
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="bg-[#66c0f4] text-[#171a21] rounded p-2 hover:bg-[#7fd0ff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-[#8f98a0] text-center pb-2">
            AI can make mistakes. Check important details.
          </p>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-[#66c0f4] text-[#171a21] flex items-center justify-center shadow-lg hover:bg-[#7fd0ff] transition-colors"
        aria-label={open ? 'Close shopping assistant' : 'Open shopping assistant'}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
