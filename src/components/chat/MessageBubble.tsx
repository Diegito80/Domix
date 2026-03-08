"use client";

import { formatRelativeTime } from "@/lib/utils";
import { Pin } from "lucide-react";

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

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReact: (id: string, emoji: string) => void;
}

const QUICK_REACTIONS = ["❤️", "😂", "👍", "🎉", "😮", "💪"];

export function MessageBubble({ message, isOwn, onReact }: MessageBubbleProps) {
  const isParent = message.author.role === "parent";

  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
        style={{ backgroundColor: message.author.color }}
      >
        {message.author.name.charAt(0)}
      </div>

      {/* Bubble */}
      <div className="max-w-[75%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold" style={{ color: message.author.color }}>
            {message.author.nameHe}
          </span>
          <span className="text-[10px] text-text-secondary">
            {formatRelativeTime(new Date(message.createdAt))}
          </span>
          {message.pinned && <Pin className="w-3 h-3 text-accent-warm" />}
        </div>

        <div
          className={`rounded-2xl px-4 py-3 ${
            isOwn
              ? "bg-accent-warm/10 rounded-tl-sm"
              : isParent
                ? "bg-accent-green/10 border border-accent-green/20 rounded-tr-sm"
                : "bg-card border border-border rounded-tr-sm"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>

        {/* Reaction */}
        {message.emoji && (
          <div className="mt-1">
            <span className="text-lg">{message.emoji}</span>
          </div>
        )}

        {/* Quick reactions */}
        <div className="flex gap-1 mt-1 opacity-0 hover:opacity-100 transition-opacity">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(message.id, emoji)}
              className="text-sm hover:scale-125 transition-transform p-0.5"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
