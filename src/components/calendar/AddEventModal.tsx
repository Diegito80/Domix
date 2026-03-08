"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FamilyMember {
  id: string;
  name: string;
  nameHe: string;
  color: string;
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Record<string, unknown>) => void;
  defaultDate?: string;
}

const EVENT_TYPES = [
  { value: "general", label: "כללי", emoji: "📌" },
  { value: "school", label: "בית ספר", emoji: "📚" },
  { value: "activity", label: "פעילות", emoji: "🎉" },
  { value: "zoom", label: "זום", emoji: "📹" },
  { value: "family", label: "משפחתי", emoji: "👨‍👩‍👧‍👦" },
];

export function AddEventModal({ isOpen, onClose, onSubmit, defaultDate }: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [eventType, setEventType] = useState("general");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [zoomLink, setZoomLink] = useState("");

  useEffect(() => {
    fetch("/api/members")
      .then((r) => r.json())
      .then(setMembers);
  }, []);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      startTime: new Date(`${date}T${startTime}`).toISOString(),
      endTime: new Date(`${date}T${endTime}`).toISOString(),
      eventType,
      memberIds,
      zoomLink: zoomLink || undefined,
    });
    setTitle("");
    setZoomLink("");
    onClose();
  };

  const toggleMember = (id: string) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
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
              <h2 className="text-xl font-bold">אירוע חדש</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-background">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="שם האירוע"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border-2 border-border focus:border-accent-warm p-3 bg-background outline-none"
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">תאריך</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border-2 border-border p-3 bg-background outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">התחלה</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl border-2 border-border p-3 bg-background outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">סיום</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-xl border-2 border-border p-3 bg-background outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Event type */}
              <div>
                <label className="text-sm text-text-secondary mb-2 block">סוג אירוע</label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map(({ value, label, emoji }) => (
                    <button
                      key={value}
                      onClick={() => setEventType(value)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        eventType === value
                          ? "bg-accent-warm text-white"
                          : "bg-background text-text-secondary hover:bg-border/50"
                      }`}
                    >
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zoom link */}
              {eventType === "zoom" && (
                <input
                  type="url"
                  placeholder="קישור לזום"
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  className="w-full rounded-xl border-2 border-border p-3 bg-background outline-none"
                  dir="ltr"
                />
              )}

              {/* Members */}
              <div>
                <label className="text-sm text-text-secondary mb-2 block">משתתפים</label>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => toggleMember(m.id)}
                      className="px-3 py-2 rounded-xl text-sm font-medium transition-all border-2"
                      style={{
                        borderColor: memberIds.includes(m.id) ? m.color : "transparent",
                        backgroundColor: memberIds.includes(m.id) ? m.color + "20" : "var(--color-background)",
                      }}
                    >
                      {m.nameHe}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={!title.trim()}>
                הוסף אירוע
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
