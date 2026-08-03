import { useChat } from 'ai/react';
import { DefaultChatTransport } from 'ai';
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CHAT_API_URL } from '../services/api';
import {
  loadSessionChatMessages,
  saveSessionChatMessages,
} from '../utils/chatSession';
import './StreamingChat.css';

function getMessageText(message: {
  parts?: Array<{ type: string; text?: string }>;
  content?: string;
}): string {
  if (Array.isArray(message.parts) && message.parts.length > 0) {
    return message.parts
      .filter((part) => part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text as string)
      .join('');
  }
  return typeof message.content === 'string' ? message.content : '';
}

function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return String(user?.id || user?._id || 'anon');
  } catch {
    return 'anon';
  }
}

export default function StreamingChat() {
  const userId = useMemo(() => getCurrentUserId(), []);
  const initialMessages = useMemo(() => loadSessionChatMessages(userId), [userId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: CHAT_API_URL,
      }),
    [],
  );

  const { messages, setMessages, sendMessage, status, stop, error, clearError } = useChat({
    id: `taskforge-ai-${userId}`,
    transport,
    messages: initialMessages,
  });

  const [input, setInput] = useState('');
  const [pinnedToBottom, setPinnedToBottom] = useState(true);
  const [showJump, setShowJump] = useState(false);
  const [stoppedEarly, setStoppedEarly] = useState(false);
  const restoredRef = useRef(false);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef(true);

  const isBusy =
    !stoppedEarly && (status === 'submitted' || status === 'streaming');
  const isThinking = !stoppedEarly && status === 'submitted';
  const isStreaming = !stoppedEarly && status === 'streaming';

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const saved = loadSessionChatMessages(userId);
    if (saved.length > 0 && messages.length === 0) {
      setMessages(saved);
    }
  }, [userId, messages.length, setMessages]);

  useEffect(() => {
    saveSessionChatMessages(messages, userId);
  }, [messages, userId]);

  useEffect(() => {
    if (status === 'ready' || status === 'error') {
      setStoppedEarly(false);
    }
  }, [status]);

  const scrollToLatest = useCallback((behavior: ScrollBehavior = 'smooth') => {
    pinRef.current = true;
    setPinnedToBottom(true);
    setShowJump(false);
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom < 72;

    pinRef.current = nearBottom;
    setPinnedToBottom(nearBottom);
    setShowJump(!nearBottom);
  }, []);

  useEffect(() => {
    if (!pinRef.current) return;
    bottomRef.current?.scrollIntoView({
      behavior: isStreaming ? 'auto' : 'smooth',
      block: 'end',
    });
  }, [messages, status, isStreaming]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;

    clearError?.();
    setStoppedEarly(false);
    setInput('');
    pinRef.current = true;
    setPinnedToBottom(true);
    setShowJump(false);
    await sendMessage({ text });
  };

  const onStop = () => {
    stop();
    setStoppedEarly(true);
  };

  const onClearChat = () => {
    setMessages([]);
    saveSessionChatMessages([], userId);
    clearError?.();
  };

  return (
    <div className="streaming-chat main-content">
      <div className="streaming-chat-shell">
        <header className="streaming-chat-header">
          <div>
            <p className="streaming-chat-eyebrow">FE-06 · Streaming AI</p>
            <h1>TaskForge AI</h1>
            <p className="streaming-chat-subtitle">
              Plan tasks, break work down, and get structured suggestions with live token streaming.
            </p>
          </div>
          <div className="streaming-chat-header-actions">
            {messages.length > 0 && (
              <button type="button" className="streaming-chat-clear" onClick={onClearChat}>
                Clear chat
              </button>
            )}
            <div className={`streaming-chat-status streaming-chat-status--${stoppedEarly ? 'ready' : status}`}>
              <span className="streaming-chat-status-dot" />
              {(stoppedEarly || status === 'ready') && 'Ready'}
              {!stoppedEarly && status === 'submitted' && 'Thinking'}
              {!stoppedEarly && status === 'streaming' && 'Streaming'}
              {!stoppedEarly && status === 'error' && 'Error'}
            </div>
          </div>
        </header>

        <div className="streaming-chat-panel">
          <div
            className="streaming-chat-messages"
            ref={scrollerRef}
            onScroll={handleScroll}
          >
            {messages.length === 0 && (
              <div className="streaming-chat-empty">
                <h3>Ask TaskForge AI</h3>
                <p>
                  Try: “Break down a product launch into High-priority tasks for this week.”
                </p>
              </div>
            )}

            {messages.map((message) => {
              const text = getMessageText(message);
              const isUser = message.role === 'user';

              return (
                <div
                  key={message.id}
                  className={[
                    'streaming-chat-row',
                    isUser ? 'streaming-chat-row--user' : 'streaming-chat-row--assistant',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'streaming-chat-bubble',
                      isUser
                        ? 'streaming-chat-bubble--user'
                        : 'streaming-chat-bubble--assistant',
                    ].join(' ')}
                  >
                    <span className="streaming-chat-role">
                      {isUser ? 'You' : 'TaskForge AI'}
                    </span>
                    <div className="streaming-chat-text">
                      {text || (isStreaming && !isUser ? '' : '…')}
                      {!isUser && isStreaming && message.id === messages[messages.length - 1]?.id && (
                        <span className="streaming-chat-caret" aria-hidden />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="streaming-chat-row streaming-chat-row--assistant">
                <div className="streaming-chat-bubble streaming-chat-bubble--assistant streaming-chat-bubble--thinking">
                  <span className="streaming-chat-role">TaskForge AI</span>
                  <div className="streaming-chat-thinking" aria-live="polite">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {showJump && !pinnedToBottom && (
            <button
              type="button"
              className="streaming-chat-jump"
              onClick={() => scrollToLatest('smooth')}
            >
              Jump to latest
            </button>
          )}

          {error && (
            <div className="streaming-chat-error" role="alert">
              Something went wrong while streaming.
              {error.message ? ` (${error.message})` : ' Check your API key / backend and try again.'}
            </div>
          )}

          <form className="streaming-chat-composer" onSubmit={onSubmit}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Describe the work you want to plan…"
              rows={2}
              disabled={isBusy}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void onSubmit(event);
                }
              }}
            />
            <div className="streaming-chat-actions">
              {isBusy ? (
                <button
                  type="button"
                  className="streaming-chat-stop"
                  onClick={onStop}
                >
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  className="streaming-chat-send"
                  disabled={!input.trim()}
                >
                  Send
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
