"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

interface Reward {
  id: string;
  name: string;
  emoji: string;
  pointsCost: number;
  category: string;
}

const CATEGORIES = [
  { value: "small", label: "קטן 🍬" },
  { value: "medium", label: "בינוני 🎮" },
  { value: "large", label: "גדול 🎯" },
  { value: "epic", label: "אפי! 🌟" },
];

const EMOJI_OPTIONS = ["🎁", "🍦", "🍕", "🎮", "📱", "🎬", "🏖️", "⭐", "🎯", "🛒", "🎪", "🎢", "🍿", "🎠", "💎"];

export function RewardAdminPanel({
  rewards,
  onRefresh,
}: {
  rewards: Reward[];
  onRefresh: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", emoji: "🎁", pointsCost: 100, category: "medium" });
  const [editForm, setEditForm] = useState<Partial<Reward>>({});

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    await fetch("/api/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", emoji: "🎁", pointsCost: 100, category: "medium" });
    setAdding(false);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("למחוק את הפרס?")) return;
    await fetch(`/api/rewards/${id}`, { method: "DELETE" });
    onRefresh();
  };

  const handleEdit = async (id: string) => {
    await fetch(`/api/rewards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    onRefresh();
  };

  const startEdit = (reward: Reward) => {
    setEditingId(reward.id);
    setEditForm({ name: reward.name, emoji: reward.emoji, pointsCost: reward.pointsCost, category: reward.category });
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">ניהול פרסים</h3>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-warm text-white text-sm font-semibold hover:bg-accent-warm/80 transition-all"
        >
          <Plus className="w-4 h-4" />
          פרס חדש
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-background rounded-2xl p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="שם הפרס"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="flex-1 rounded-xl border-2 border-border focus:border-accent-warm p-2.5 bg-card outline-none text-sm"
                  autoFocus
                />
              </div>

              {/* Emoji picker */}
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setForm({ ...form, emoji: e })}
                    className={`text-xl p-1.5 rounded-lg transition-all ${form.emoji === e ? "bg-accent-warm/20 ring-2 ring-accent-warm" : "hover:bg-card"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-text-secondary">נקודות:</label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={form.pointsCost}
                    onChange={(e) => setForm({ ...form, pointsCost: Number(e.target.value) })}
                    className="w-20 text-center rounded-xl border-2 border-border p-2 bg-card outline-none text-sm font-bold text-warning"
                  />
                </div>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex-1 rounded-xl border-2 border-border p-2 bg-card text-sm outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!form.name.trim()}
                  className="flex-1 py-2 rounded-xl bg-accent-green text-white font-semibold text-sm disabled:opacity-30"
                >
                  הוסף
                </button>
                <button
                  onClick={() => setAdding(false)}
                  className="px-4 py-2 rounded-xl bg-background border border-border text-sm"
                >
                  ביטול
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward list */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {rewards.map((reward) => (
          <div key={reward.id} className="flex items-center gap-3 bg-background rounded-xl p-3">
            {editingId === reward.id ? (
              <>
                <input
                  type="text"
                  value={String(editForm.emoji ?? "")}
                  onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                  className="w-10 text-center rounded-lg border border-border p-1 bg-card text-sm"
                />
                <input
                  type="text"
                  value={String(editForm.name ?? "")}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="flex-1 rounded-lg border border-border p-1 bg-card text-sm"
                />
                <input
                  type="number"
                  value={Number(editForm.pointsCost ?? 0)}
                  onChange={(e) => setEditForm({ ...editForm, pointsCost: Number(e.target.value) })}
                  className="w-20 text-center rounded-lg border border-border p-1 bg-card text-sm font-bold text-warning"
                />
                <button onClick={() => handleEdit(reward.id)} className="p-1.5 rounded-lg bg-success text-white">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-background border border-border">
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <span className="text-2xl">{reward.emoji}</span>
                <span className="flex-1 font-medium text-sm">{reward.name}</span>
                <span className="text-warning font-bold text-sm">⭐ {reward.pointsCost.toLocaleString()}</span>
                <button onClick={() => startEdit(reward)} className="p-1.5 rounded-lg text-text-secondary hover:text-accent-warm hover:bg-accent-warm/10 transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(reward.id)} className="p-1.5 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
