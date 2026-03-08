"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Reward {
  id: string;
  name: string;
  emoji: string;
  pointsCost: number;
}

interface RedemptionModalProps {
  isOpen: boolean;
  reward: Reward | null;
  currentPoints: number;
  onConfirm: () => void;
  onClose: () => void;
}

export function RedemptionModal({ isOpen, reward, currentPoints, onConfirm, onClose }: RedemptionModalProps) {
  if (!reward) return null;

  const remaining = currentPoints - reward.pointsCost;

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
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-card rounded-2xl shadow-lg w-full max-w-sm p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 left-4 p-2 rounded-xl hover:bg-background">
              <X className="w-5 h-5" />
            </button>

            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl block mb-4"
            >
              {reward.emoji}
            </motion.span>

            <h2 className="text-xl font-bold mb-2">{reward.name}</h2>
            <p className="text-text-secondary mb-1">
              עלות: <span className="font-bold text-warning">⭐ {reward.pointsCost.toLocaleString()}</span>
            </p>
            <p className="text-sm text-text-secondary mb-6">
              יישאר לך: <span className="font-semibold">{remaining.toLocaleString()} נקודות</span>
            </p>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                ביטול
              </Button>
              <Button onClick={onConfirm} className="flex-1">
                לממש! 🎉
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
