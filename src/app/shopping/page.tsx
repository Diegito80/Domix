"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Trash2, Check, Mic } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAppStore } from "@/lib/store";

interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  createdAt: string;
}

export default function ShoppingPage() {
  const activeMember = useAppStore((s) => s.activeMember);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  const isParent = activeMember?.role === "parent";

  const fetchItems = useCallback(() => {
    fetch("/api/shopping")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {});
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAdd = async () => {
    const name = input.trim();
    if (!name) return;
    await fetch("/api/shopping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setInput("");
    fetchItems();
  };

  const handleToggle = async (item: ShoppingItem) => {
    await fetch(`/api/shopping/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !item.completed }),
    });
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/shopping/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleClearCompleted = async () => {
    await fetch("/api/shopping", { method: "DELETE" });
    fetchItems();
  };

  const handleVoiceAdd = () => {
    const SR =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "he-IL";
    rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      setInput(e.results[0][0].transcript);
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.start();
    setIsListening(true);
  };

  const pending = items.filter((i) => !i.completed);
  const completed = items.filter((i) => i.completed);

  return (
    <AppShell>
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="w-7 h-7 text-accent-warm" />
          <h1 className="text-2xl font-bold">רשימת קניות</h1>
          {completed.length > 0 && isParent && (
            <button
              onClick={handleClearCompleted}
              className="mr-auto text-xs text-text-secondary hover:text-error flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-error/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              נקה שנרכשו
            </button>
          )}
        </div>

        {/* Add item */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="הוסף מוצר..."
            className="flex-1 rounded-xl border-2 border-border focus:border-accent-warm p-3 bg-background outline-none text-sm"
          />
          <button
            onClick={handleVoiceAdd}
            className={`p-3 rounded-xl shrink-0 transition-all ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-background border border-border hover:bg-accent-warm/10 text-text-secondary hover:text-accent-warm"
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="p-3 rounded-xl bg-accent-warm text-white disabled:opacity-30 transition-all shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Pending items */}
        {pending.length === 0 && completed.length === 0 && (
          <div className="text-center py-16">
            <ShoppingCart className="w-12 h-12 text-text-secondary/20 mx-auto mb-3" />
            <p className="text-text-secondary">הרשימה ריקה — הוסף מוצרים!</p>
          </div>
        )}

        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {pending.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4"
              >
                <button
                  onClick={() => handleToggle(item)}
                  className="w-8 h-8 rounded-xl border-2 border-border flex items-center justify-center hover:border-success transition-all shrink-0"
                >
                </button>
                <span className="flex-1 font-medium">{item.name}</span>
                {isParent && (
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl text-text-secondary hover:text-error hover:bg-error/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Completed items */}
        {completed.length > 0 && (
          <div className="mt-6">
            <p className="text-xs text-text-secondary mb-2 px-1">נרכשו ✓</p>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {completed.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 opacity-50"
                  >
                    <button
                      onClick={() => handleToggle(item)}
                      className="w-8 h-8 rounded-xl bg-success border-2 border-success flex items-center justify-center transition-all shrink-0"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </button>
                    <span className="flex-1 font-medium line-through text-text-secondary">{item.name}</span>
                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl text-text-secondary hover:text-error hover:bg-error/10 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
