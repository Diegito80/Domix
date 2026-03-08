"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TASK_CATEGORIES } from "@/lib/constants";

interface FamilyMember {
  id: string;
  name: string;
  nameHe: string;
  color: string;
  role: string;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Record<string, unknown>) => void;
  createdById: string;
}

const EMOJI_OPTIONS = ["🪥", "🛏️", "📝", "🐕", "📖", "🧸", "🧹", "🍽️", "👕", "🎨", "🎵", "💪"];

export function AddTaskModal({ isOpen, onClose, onSubmit, createdById }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("📝");
  const [pointsValue, setPointsValue] = useState(10);
  const [category, setCategory] = useState("general");
  const [assignedToId, setAssignedToId] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState("daily");
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    fetch("/api/members")
      .then((r) => r.json())
      .then((all: FamilyMember[]) => {
        const kids = all.filter((m) => m.role === "child");
        setMembers(kids);
        if (kids.length > 0 && !assignedToId) setAssignedToId(kids[0].id);
      });
  }, []);

  const handleSubmit = () => {
    if (!title.trim() || !assignedToId) return;
    onSubmit({
      title: title.trim(),
      emoji,
      pointsValue,
      category,
      assignedToId,
      createdById,
      isRecurring,
      recurrence: isRecurring ? recurrence : null,
    });
    setTitle("");
    setEmoji("📝");
    setPointsValue(10);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl shadow-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">משימה חדשה</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-background">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <input
                type="text"
                placeholder="שם המשימה"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border-2 border-border focus:border-accent-warm p-3 bg-background outline-none"
                autoFocus
              />

              {/* Emoji */}
              <div>
                <label className="text-sm text-text-secondary mb-2 block">אמוג'י</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`text-2xl p-2 rounded-xl transition-all ${
                        emoji === e ? "bg-accent-warm/20 scale-110" : "hover:bg-background"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Points */}
              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  נקודות: {pointsValue}
                </label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={pointsValue}
                  onChange={(e) => setPointsValue(Number(e.target.value))}
                  className="w-full accent-warning"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm text-text-secondary mb-2 block">קטגוריה</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(TASK_CATEGORIES).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        category === key
                          ? "bg-accent-green text-white"
                          : "bg-background text-text-secondary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign to */}
              <div>
                <label className="text-sm text-text-secondary mb-2 block">שייך ל</label>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setAssignedToId(m.id)}
                      className="px-3 py-2 rounded-xl text-sm font-medium transition-all border-2"
                      style={{
                        borderColor: assignedToId === m.id ? m.color : "transparent",
                        backgroundColor: assignedToId === m.id ? m.color + "20" : "var(--color-background)",
                      }}
                    >
                      {m.nameHe}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recurring */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`w-12 h-7 rounded-full transition-all ${
                    isRecurring ? "bg-accent-green" : "bg-border"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition-all mx-1 ${
                      isRecurring ? "translate-x-5" : "translate-x-0"
                    }`}
                    style={{ direction: "ltr" }}
                  />
                </button>
                <span className="text-sm">משימה חוזרת</span>
                {isRecurring && (
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value)}
                    className="rounded-xl border border-border px-2 py-1 text-sm bg-background"
                  >
                    <option value="daily">יומי</option>
                    <option value="weekdays">ימי חול</option>
                    <option value="weekly">שבועי</option>
                  </select>
                )}
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={!title.trim()}>
                הוסף משימה
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
