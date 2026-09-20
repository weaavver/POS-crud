import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minus, Send, FileDown } from 'lucide-react';
import { sendChatMessage } from '../api/assistant';
import { useAuth } from '../context/AuthContext';

const GREETING = {
  role: 'assistant',
  content: "Hi! I'm the Vault shopping assistant. Looking for a game?",
};

const URL_SPLIT_PATTERN = /(https?:\/\/[^\s]+)/g;
const URL_TEST_PATTERN = /^https?:\/\//;

// The assistant replies in plain text, but product links need to actually be
// clickable rather than inert strings the user has to copy by hand.
function renderWithLinks(text) {
  const parts = text.split(URL_SPLIT_PATTERN);
  return parts.map((part, i) =>
    URL_TEST_PATTERN.test(part) ? (
      
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline hover:text-blue-300 break-all"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function downloadReport(report) {
  const byteChars = atob(report.content_base64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);

  const blob = new Blob([bytes], { type: DOCX_MIME });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = report.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ChatWidget() {
  const { user, token } = useAuth();
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
      // Don't send the initial greeting as if the assistant said it mid-conversation,
      // and never resend a previous report's base64 data — only role/content matter.
      const history = nextMessages.slice(1, -1).map(({ role, content }) => ({ role, content }));
      const { reply, report } = await sendChatMessage(text, history, token);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, report }]);
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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 font-chat">
      {/* Always mounted (just hidden when closed) so it can animate in AND out. */}
      <div
        aria-hidden={!open}
        className={
          'w-[340px] sm:w-[380px] h-[480px] max-h-[75vh] bg-[#16202d] border border-[#2a3f5a] rounded-sm shadow-2xl flex flex-col overflow-hidden ' +
          'origin-bottom-right transition-[opacity,translate,scale,visibility] duration-200 ease-out motion-reduce:transition-none ' +
          (open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95 invisible')
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1b2838] border-b border-[#2a3f5a]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white font-semibold text-sm">Vault Shopping Assistant</span>
            {user?.role === 'admin' && (
              <span className="text-[10px] uppercase tracking-wide bg-[#2a3f5a] text-[#66c0f4] px-1.5 py-0.5 rounded-sm">
                Admin
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-[#8f98a0] hover:text-white transition-colors cursor-pointer"
            aria-label="Minimize chat"
          >
            <Minus size={18} />
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
                className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'max-w-[85%] rounded-sm px-3 py-2 bg-[#66c0f4] text-[#171a21]'
                    : 'w-full py-1 text-white'
                }`}
              >
                {renderWithLinks(m.content)}
                {m.report && (
                  <button
                    onClick={() => downloadReport(m.report)}
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-400 underline hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    <FileDown size={14} />
                    Download {m.report.filename}
                  </button>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="py-1 text-sm text-[#8f98a0]">
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
            className="flex-1 resize-none bg-[#1b2838] border border-[#2a3f5a] rounded-sm px-3 py-2 text-sm text-white placeholder:text-[#8f98a0] focus:outline-none focus:border-[#2a3f5a]"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="bg-[#66c0f4] text-[#171a21] rounded-sm p-2 hover:bg-[#7fd0ff] enabled:cursor-pointer enabled:active:scale-90 transition-[background-color,opacity,scale] duration-200 motion-reduce:transition-none disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-[#8f98a0] text-center pb-2">
          AI can make mistakes. Check important details.
        </p>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-14 h-14 rounded-sm bg-[#66c0f4] text-[#171a21] shadow-lg cursor-pointer hover:bg-[#7fd0ff] hover:scale-105 active:scale-95 transition-[background-color,scale] duration-200 motion-reduce:transition-none"
        aria-label={open ? 'Close shopping assistant' : 'Open shopping assistant'}
      >
        {/* Both icons stay mounted and crossfade + spin into each other. */}
        <MessageCircle
          size={24}
          className={
            'absolute inset-0 m-auto transition-all duration-200 motion-reduce:transition-none ' +
            (open ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100')
          }
        />
        <X
          size={24}
          className={
            'absolute inset-0 m-auto transition-all duration-200 motion-reduce:transition-none ' +
            (open ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50')
          }
        />
      </button>
    </div>
  );
}