"use client";

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
  const kids = members
    .filter((m) => m.role === "child")
    .sort((a, b) => b.points - a.points);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-warning" />
        <h3 className="font-bold text-lg">טבלת הנקודות</h3>
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
            <span className="font-bold text-warning">⭐ {kid.points.toLocaleString()}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
