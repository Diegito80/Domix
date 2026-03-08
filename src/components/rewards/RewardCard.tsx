"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Reward {
  id: string;
  name: string;
  nameEn?: string | null;
  emoji: string;
  pointsCost: number;
  category: string;
}

interface RewardCardProps {
  reward: Reward;
  currentPoints: number;
  onRedeem: (reward: Reward) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  small: "#7B9E6B",
  medium: "#4A6FA5",
  large: "#E8943A",
  epic: "#C46B9E",
};

const CATEGORY_LABELS: Record<string, string> = {
  small: "קטן",
  medium: "בינוני",
  large: "גדול",
  epic: "אפי!",
};

export function RewardCard({ reward, currentPoints, onRedeem }: RewardCardProps) {
  const canAfford = currentPoints >= reward.pointsCost;
  const categoryColor = CATEGORY_COLORS[reward.category] || "#D4A574";

  return (
    <motion.div
      whileHover={{ scale: canAfford ? 1.03 : 1 }}
      whileTap={{ scale: canAfford ? 0.97 : 1 }}
      className={cn(
        "bg-card rounded-2xl border-2 p-5 flex flex-col items-center gap-3 transition-all",
        canAfford ? "cursor-pointer shadow-sm hover:shadow-md" : "opacity-50"
      )}
      style={{ borderColor: canAfford ? categoryColor + "40" : "var(--color-border)" }}
      onClick={() => canAfford && onRedeem(reward)}
    >
      <span className="text-4xl">{reward.emoji}</span>
      <h3 className="font-bold text-center text-sm">{reward.name}</h3>

      <div className="flex items-center gap-1 font-bold" style={{ color: categoryColor }}>
        ⭐ {reward.pointsCost.toLocaleString()}
      </div>

      <span
        className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
        style={{ backgroundColor: categoryColor }}
      >
        {CATEGORY_LABELS[reward.category]}
      </span>
    </motion.div>
  );
}
