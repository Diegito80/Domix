"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface Member {
  id: string;
  name: string;
  nameHe: string;
  color: string;
  points: number;
  role: string;
}

export function Leaderboard({ members }: { members: Member[] }) {
  const [mode, setMode] = useState<"all" | "weekly">("weekly");
  const [weeklyPoints, setWeeklyPoints] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/members/weekly-points")
      .then((r) => r.json())
      .then(setWeeklyPoints)
      .catch(() => {});
  }, []);

  const kids = members
    .filter((m) => m.role === "child")
    .map((m) => ({
      ...m,
      displayPoints: mode === "weekly" ? (weeklyPoints[m.id] ?? 0) : m.points,
    }))
    .sort((a, b) => b.displayPoints - a.displayPoints);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-warning" />
        <h3 className="font-bold text-lg">טבלת הנקודות</h3>
      </div>

      {/* Toggle */}
      <div className="flex gap-1 mb-4 bg-background rounded-xl p-1">
        <button
          onClick={() => setMode("weekly")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === "weekly" ? "bg-card shadow-sm text-warning" : "text-text-secondary"
          }`}
        >
          השבוע
        </button>
        <button
          onClick={() => setMode("all")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === "all" ? "bg-card shadow-sm text-warning" : "text-text-secondary"
          }`}
        >
          סה&quot;כ
        </button>
      </div>

      <div className="space-y-3">
        {kids.map((kid, i) => (
          <motion.div
            key={kid.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3"
          >
            <span className="text-xl w-8 text-center">{medals[i] || `${i + 1}.`}</span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: kid.color }}
            >
              {kid.name.charAt(0)}
            </div>
            <span className="font-semibold flex-1">{kid.nameHe}</span>
            <span className="font-bold text-warning">⭐ {kid.displayPoints.toLocaleString()}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
