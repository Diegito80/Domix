"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

interface PointsBadgeProps {
  points: number;
  added?: number | null;
}

export function PointsBadge({ points, added }: PointsBadgeProps) {
  return (
    <div className="relative inline-flex items-center gap-2 bg-warning/10 px-4 py-2 rounded-2xl">
      <Star className="w-5 h-5 text-warning" fill="currentColor" />
      <motion.span
        key={points}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="font-bold text-lg text-warning"
      >
        {points}
      </motion.span>
      <span className="text-sm text-text-secondary">נקודות</span>

      <AnimatePresence>
        {added && added > 0 && (
          <motion.span
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-success font-bold text-sm"
          >
            +{added}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
