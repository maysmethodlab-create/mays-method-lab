'use client';

import { useEffect, useRef, useState } from 'react';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type RagChatbotProps = {
  /** API endpoint that accepts { messages: ChatMessage[] } and returns { message: string }. */
  endpoint: string;
  /** Display label for the source (e.g. "TAMU Registrar Academic Calendar"). */
  sourceLabel: string;
  /** Source URL shown under each bot reply. */
  sourceHref: string;
  /** Suggested first questions. The first one pre-fills the input on mount. */
  placeholderQuestions: string[];
  /** Eyebrow text shown above the chat panel (Oswald maroon). */
  botName: string;
};

/**
 * RagChatbot. Reusable shared component for institutional-document chatbots
 * (Academic Calendar today, Mays Faculty Guidelines next). Sharp 0px corners,
 * Mays dotted-frame outline on the panel, Oswald maroon eyebrow, Work Sans
 * body, no drop shadows. User on the right, bot on the left. Each bot
 * message ends with a "Source: <label>" link footer.
 *
 * Talks to the endpoint over POST with { messages } and renders the JSON
 * { message } reply. On HTTP error it surfaces a one-line apology instead
 * of crashing.
 */
export default function RagChatbot({
  endpoint,
  sourceLabel,
  sourceHref,
  placeholderQuestions,
  botName,
}: RagChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(placeholderQuestions[0] || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      if (!r.ok) {
        const body = await r.text().catch(() => '');
        throw new Error(body || `HTTP ${r.status}`);
      }
      const data = (await r.json()) as { message?: string };
      const reply = (data.message || '').trim();
      setMessages([
        ...next,
        { role: 'assistant', content: reply || 'I did not get a response back. Please try again.' },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setMessages([
        ...next,
        {
          role: 'assistant',
          content:
            'I ran into an error reaching the server. Please try again in a moment.',
        },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="bg-white border-2 border-maroon p-6 md:p-8 relative">
      <div className="absolute inset-0 pointer-events-none dotted-frame" aria-hidden="true" />

      <div className="eyebrow-lg mb-4 font-headline text-maroon">{botName}</div>

      <div
        ref={scrollRef}
        className="border border-line bg-white p-4 md:p-5 h-[420px] overflow-y-auto flex flex-col gap-4"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="text-ink-secondary text-[16px]">
            <p className="mb-3">
              Ask a question about the academic calendar. Try one of these to start:
            </p>
            <ul className="flex flex-col gap-2">
              {placeholderQuestions.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                    className="text-left w-full border border-line bg-white px-3 py-2 hover:border-maroon hover:bg-maroon/5 focus:outline-none focus:border-maroon transition-colors text-[16px] text-ink-primary"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          messages.map((m, i) => (
            <MessageBubble key={i} message={m} sourceLabel={sourceLabel} sourceHref={sourceHref} />
          ))
        )}
        {busy ? (
          <div className="self-start max-w-[88%]">
            <div className="text-[16px] uppercase tracking-[0.18em] text-maroon-muted font-semibold mb-1">
              {botName}
            </div>
            <div className="border border-line px-3 py-2 text-[16px] text-ink-secondary">
              Thinking…
            </div>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Ask about a date, a deadline, a break, or a finals window."
          className="w-full border-2 border-line focus:border-maroon focus:outline-none px-3 py-2 text-[16px] font-body resize-none bg-white text-ink-primary"
          disabled={busy}
        />
        <div className="flex items-center justify-between gap-3">
          <div className="text-[16px] text-ink-secondary">
            Press Enter to send. Shift+Enter for a new line.
          </div>
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="bg-maroon text-white px-5 py-2 font-semibold uppercase tracking-[0.05em] text-[16px] hover:bg-maroon-deep disabled:bg-ink-subtle disabled:cursor-not-allowed transition-colors"
          >
            {busy ? 'Sending' : 'Send'}
          </button>
        </div>
        {error ? (
          <div className="text-[16px] text-status-error">Error: {error}</div>
        ) : null}
      </form>
    </div>
  );
}

function MessageBubble({
  message,
  sourceLabel,
  sourceHref,
}: {
  message: ChatMessage;
  sourceLabel: string;
  sourceHref: string;
}) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] ${isUser ? 'text-right' : 'text-left'}`}>
        {!isUser ? (
          <div className="text-[16px] uppercase tracking-[0.18em] text-maroon-muted font-semibold mb-1">
            Mays Method Lab · Academic Calendar
          </div>
        ) : null}
        <div
          className={`inline-block whitespace-pre-wrap text-[16px] leading-relaxed px-3 py-2 ${
            isUser
              ? 'bg-white border-2 border-maroon text-ink-primary text-left'
              : 'bg-white border border-line text-ink-primary text-left'
          }`}
        >
          {message.content}
        </div>
        {!isUser ? (
          <div className="text-[16px] text-ink-secondary mt-1">
            Source:{' '}
            <a
              href={sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="prose-link"
            >
              {sourceLabel}
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
