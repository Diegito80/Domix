"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Palette, Image } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { DrawingCanvas } from "@/components/creative/DrawingCanvas";
import { Gallery } from "@/components/creative/Gallery";

interface Drawing {
  id: string;
  title?: string | null;
  dataUrl: string;
  createdAt: string;
  member: {
    id: string;
    name: string;
    nameHe: string;
    color: string;
  };
}

export default function CreativePage() {
  const activeMember = useAppStore((s) => s.activeMember);
  const [tab, setTab] = useState<"draw" | "gallery">("draw");
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const fetchDrawings = useCallback(async () => {
    const res = await fetch("/api/drawings");
    const data = await res.json();
    setDrawings(data);
  }, []);

  useEffect(() => {
    fetchDrawings();
  }, [fetchDrawings]);

  const handleSave = async (dataUrl: string) => {
    if (!activeMember) return;

    const title = `ציור של ${activeMember.nameHe}`;

    await fetch("/api/drawings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dataUrl, memberId: activeMember.id }),
    });

    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
    fetchDrawings();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/drawings/${id}`, { method: "DELETE" });
    fetchDrawings();
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-180px)]">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-7 h-7 text-accent-warm" />
          <h1 className="text-2xl font-bold">יצירה</h1>

          <div className="mr-auto flex gap-1.5 bg-card rounded-xl border border-border p-1">
            <button
              onClick={() => setTab("draw")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "draw" ? "bg-accent-warm text-white" : "hover:bg-background"
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>ציור</span>
            </button>
            <button
              onClick={() => setTab("gallery")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "gallery" ? "bg-accent-warm text-white" : "hover:bg-background"
              }`}
            >
              <Image className="w-4 h-4" />
              <span>גלריה ({drawings.length})</span>
            </button>
          </div>
        </div>

        {/* Saved toast */}
        {showSaved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-accent-green/10 border border-accent-green/30 rounded-xl px-4 py-2 mb-3 text-center text-sm font-semibold text-accent-green"
          >
            הציור נשמר בהצלחה! 🎨
          </motion.div>
        )}

        {tab === "draw" ? (
          <div className="flex-1 rounded-2xl border border-border overflow-hidden">
            <DrawingCanvas onSave={handleSave} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <Gallery
              drawings={drawings}
              onDelete={handleDelete}
              isOwner={(memberId) => memberId === activeMember?.id}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
