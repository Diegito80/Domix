"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface VoiceDictationOverlayProps {
  isOpen: boolean;
  transcript: string;
  interimTranscript: string;
  contextHint?: string;
  onCancel: () => void;
}

function WaveformBars() {
  return (
    <div className="flex items-end gap-1 h-8 justify-center">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-red-400"
          animate={{
            height: [8, 16 + Math.random() * 16, 8],
          }}
          transition={{
            duration: 0.6 + Math.random() * 0.4,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.08,
          }}
        />
      ))}
    </div>
  );
}

export function VoiceDictationOverlay({
  isOpen,
  transcript,
  interimTranscript,
  contextHint,
  onCancel,
}: VoiceDictationOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[55] bg-card/95 backdrop-blur-md border-t border-border rounded-t-3xl shadow-2xl"
          style={{ minHeight: "30vh" }}
        >
          <div className="p-6 flex flex-col items-center gap-4">
            {/* Cancel button */}
            <div className="w-full flex justify-end">
              <button
                onClick={onCancel}
                className="p-2 rounded-xl hover:bg-background transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Waveform */}
            <WaveformBars />

            {/* Context hint */}
            {contextHint && (
              <p className="text-sm text-text-secondary">{contextHint}</p>
            )}

            {/* Live transcription */}
            <div className="text-center min-h-[60px] flex items-center justify-center">
              {transcript ? (
                <p className="text-2xl font-bold leading-relaxed">{transcript}</p>
              ) : interimTranscript ? (
                <p className="text-2xl font-bold leading-relaxed text-text-secondary/60">
                  {interimTranscript}
                </p>
              ) : (
                <p className="text-lg text-text-secondary animate-pulse">
                  מקשיב... דבר עכשיו
                </p>
              )}
            </div>

            {/* Listening indicator */}
            <div className="flex items-center gap-2">
              <motion.div
                className="w-3 h-3 rounded-full bg-red-500"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-xs text-text-secondary">מקליט</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
