"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Pin, Smile, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { useAudioFeedback } from "@/lib/hooks/useAudioFeedback";

interface Message {
  id: string;
  content: string;
  emoji?: string | null;
  pinned: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    nameHe: string;
    color: string;
    role: string;
  };
}

const EMOJI_PICKER = ["😊", "😂", "❤️", "🎉", "👍", "🔥", "💪", "🙏", "😮", "🥳", "🍕", "⭐"];

export default function ChatPage() {
  const activeMember = useAppStore((s) => s.activeMember);
  const { play } = useAudioFeedback();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(() => {
    fetch("/api/messages?take=100")
      .then((r) => r.json())
      .then((data: Message[]) => {
        setMessages((prev) => {
          if (prev.length === data.length && prev[0]?.id === data[0]?.id) return prev;
          return data;
        });
      });
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const prevMessagesLenRef = useRef(0);
  useEffect(() => {
    if (messages.length !== prevMessagesLenRef.current) {
      prevMessagesLenRef.current = messages.length;
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeMember || sending) return;

    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim(), authorId: activeMember.id }),
      });
      setInput("");
      setShowEmoji(false);
      fetchMessages();
      play("message-sent");
    } finally {
      setSending(false);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    await fetch(`/api/messages/${messageId}/react`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
    fetchMessages();
  };

  const handleDelete = async (messageId: string) => {
    await fetch(`/api/messages/${messageId}`, { method: "DELETE" });
    fetchMessages();
  };

  const handleClearAll = async () => {
    if (!confirm("למחוק את כל ההודעות?")) return;
    await fetch("/api/messages", { method: "DELETE" });
    fetchMessages();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Pinned messages
  const pinnedMessages = messages.filter((m) => m.pinned);
  // All messages reversed (oldest first for display)
  const displayMessages = [...messages].reverse();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-180px)]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">לוח הודעות משפחתי</h1>
          {activeMember?.role === "parent" && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-error hover:bg-error/10 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              נקה צ&apos;אט
            </button>
          )}
        </div>

        {/* Pinned messages */}
        {pinnedMessages.length > 0 && (
          <div className="mb-4 space-y-2">
            {pinnedMessages.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 bg-accent-warm/10 border border-accent-warm/20 rounded-xl px-4 py-2"
              >
                <Pin className="w-4 h-4 text-accent-warm shrink-0" />
                <span className="text-sm font-medium">{m.content}</span>
                <span className="text-xs text-text-secondary mr-auto">— {m.author.nameHe}</span>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          <AnimatePresence initial={false}>
            {displayMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageBubble
                  message={msg}
                  isOwn={msg.author.id === activeMember?.id}
                  canDelete={
                    msg.author.id === activeMember?.id ||
                    activeMember?.role === "parent"
                  }
                  onReact={handleReact}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border pt-3 relative">
          {/* Emoji picker */}
          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full mb-2 bg-card border border-border rounded-2xl p-3 shadow-lg"
              >
                <div className="flex flex-wrap gap-2">
                  {EMOJI_PICKER.map((e) => (
                    <button
                      key={e}
                      onClick={() => {
                        setInput((prev) => prev + e);
                        setShowEmoji(false);
                      }}
                      className="text-2xl hover:scale-125 transition-transform p-1"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-3 rounded-xl hover:bg-background transition-all shrink-0"
            >
              <Smile className="w-5 h-5 text-text-secondary" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="כתוב הודעה למשפחה..."
              className="flex-1 rounded-xl border-2 border-border focus:border-accent-warm p-3 bg-background outline-none text-sm"
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="p-3 rounded-xl transition-all shrink-0 disabled:opacity-30"
              style={{ backgroundColor: activeMember?.color || "#D4A574" }}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
