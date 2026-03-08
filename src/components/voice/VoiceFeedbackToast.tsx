"use client";

import { motion, AnimatePresence } from "framer-motion";

interface VoiceFeedbackToastProps {
  message: string | null;
  type: "success" | "warning" | "error";
}

const TYPE_STYLES = {
  success: "bg-accent-green/10 border-accent-green/30 text-accent-green",
  warning: "bg-accent-warm/10 border-accent-warm/30 text-accent-warm",
  error: "bg-red-100 border-red-300 text-red-600",
};

export function VoiceFeedbackToast({ message, type }: VoiceFeedbackToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl border font-semibold text-sm shadow-lg ${TYPE_STYLES[type]}`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
