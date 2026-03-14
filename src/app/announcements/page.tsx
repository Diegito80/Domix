"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, Trash2, Plus, X, AlertCircle, Info, BookOpen, RefreshCw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { useAudioFeedback } from "@/lib/hooks/useAudioFeedback";

interface Announcement {
  id: string;
  title: string;
  content: string;
  subject: string;
  priority: string;
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

const SUBJECTS = [
  { value: "general", label: "כללי" },
  { value: "math", label: "מתמטיקה" },
  { value: "language", label: "שפה" },
  { value: "science", label: "מדעים" },
  { value: "sports", label: "ספורט" },
  { value: "art", label: "אמנות" },
];

const PRIORITIES = [
  { value: "info", label: "מידע", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "normal", label: "רגיל", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "urgent", label: "דחוף", color: "bg-red-100 text-red-700 border-red-200" },
];

function priorityStyle(priority: string) {
  return PRIORITIES.find((p) => p.value === priority)?.color ?? PRIORITIES[1].color;
}

function priorityLabel(priority: string) {
  return PRIORITIES.find((p) => p.value === priority)?.label ?? priority;
}

function subjectLabel(subject: string) {
  return SUBJECTS.find((s) => s.value === subject)?.label ?? subject;
}

function PriorityIcon({ priority }: { priority: string }) {
  if (priority === "urgent") return <AlertCircle className="w-4 h-4 text-red-600" />;
  if (priority === "info") return <Info className="w-4 h-4 text-blue-600" />;
  return <BookOpen className="w-4 h-4 text-green-600" />;
}

export default function AnnouncementsPage() {
  const activeMember = useAppStore((s) => s.activeMember);
  const { play } = useAudioFeedback();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const isParent = activeMember?.role === "parent";

  const fetchAnnouncements = useCallback(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((data: Announcement[]) => setAnnouncements(data));
  }, []);

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !activeMember || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, subject, priority, authorId: activeMember.id }),
      });
      setTitle("");
      setContent("");
      setSubject("general");
      setPriority("normal");
      setShowForm(false);
      fetchAnnouncements();
      play("message-sent");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (id: string, pinned: boolean) => {
    await fetch(`/api/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !pinned }),
    });
    fetchAnnouncements();
  };

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/scrape-school", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(data.synced > 0 ? `סונכרנו ${data.synced} הודעות` : "אין הודעות חדשות");
        fetchAnnouncements();
      } else {
        setSyncMessage(`שגיאה: ${data.error}`);
      }
    } catch {
      setSyncMessage("שגיאת רשת");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    fetchAnnouncements();
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">הודעות בית ספר</h1>
            <p className="text-text-secondary text-sm mt-0.5">הודעות ועדכונים מבית הספר</p>
          </div>
          {isParent && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border text-text-secondary font-medium transition-all active:scale-95 hover:bg-background disabled:opacity-50"
                title="סנכרן הודעות מבית הספר"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium transition-all active:scale-95"
                style={{ backgroundColor: activeMember?.color || "#D4A574" }}
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? "ביטול" : "הודעה חדשה"}
              </button>
            </div>
          )}
        </div>

        {/* Sync status message */}
        {syncMessage && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-text-secondary text-center">
            {syncMessage}
          </div>
        )}

        {/* New announcement form */}
        <AnimatePresence>
          {showForm && isParent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <h2 className="font-semibold text-base">הודעה חדשה</h2>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="כותרת ההודעה"
                  className="w-full rounded-xl border-2 border-border focus:border-accent-warm p-3 bg-background outline-none text-sm"
                />

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="תוכן ההודעה..."
                  rows={3}
                  className="w-full rounded-xl border-2 border-border focus:border-accent-warm p-3 bg-background outline-none text-sm resize-none"
                />

                <div className="flex gap-3 flex-wrap">
                  {/* Subject */}
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs text-text-secondary mb-1.5">מקצוע</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl border-2 border-border p-2.5 bg-background text-sm outline-none focus:border-accent-warm"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs text-text-secondary mb-1.5">עדיפות</label>
                    <div className="flex gap-2">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setPriority(p.value)}
                          className={`flex-1 py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                            priority === p.value ? p.color : "border-border text-text-secondary hover:bg-background"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!title.trim() || !content.trim() || submitting}
                  className="w-full py-3 rounded-xl text-white font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
                  style={{ backgroundColor: activeMember?.color || "#D4A574" }}
                >
                  פרסם הודעה
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Announcements list */}
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <BookOpen className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-base font-medium">אין הודעות עדיין</p>
            {isParent && <p className="text-sm mt-1">לחץ &quot;הודעה חדשה&quot; כדי להוסיף</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {announcements.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-card border rounded-2xl p-4 ${
                    a.pinned ? "border-accent-warm/40 shadow-sm" : "border-border"
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <PriorityIcon priority={a.priority} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {a.pinned && (
                          <Pin className="w-3.5 h-3.5 text-accent-warm shrink-0" />
                        )}
                        <h3 className="font-semibold text-base leading-tight">{a.title}</h3>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${priorityStyle(a.priority)}`}
                        >
                          {priorityLabel(a.priority)}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-background border border-border text-text-secondary">
                          {subjectLabel(a.subject)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">{a.content}</p>
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full shrink-0"
                        style={{ backgroundColor: a.author.color }}
                      />
                      <span className="text-xs text-text-secondary">{a.author.nameHe}</span>
                      <span className="text-xs text-text-secondary opacity-60">
                        {new Date(a.createdAt).toLocaleDateString("he-IL", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    {isParent && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(a.id, a.pinned)}
                          className={`p-2 rounded-xl transition-all ${
                            a.pinned
                              ? "text-accent-warm bg-accent-warm/10"
                              : "text-text-secondary hover:text-accent-warm hover:bg-accent-warm/10"
                          }`}
                          title={a.pinned ? "בטל נעיצה" : "נעץ הודעה"}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-2 rounded-xl text-text-secondary hover:text-error hover:bg-error/10 transition-all"
                          title="מחק הודעה"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppShell>
  );
}
