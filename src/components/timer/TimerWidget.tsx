"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, X, Play, Pause, RotateCcw } from "lucide-react";
import { usePathname } from "next/navigation";

function playAlert() {
  try {
    const ctx = new AudioContext();
    [0, 0.3, 0.6].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    });
  } catch {}
}

const PRESETS = [
  { label: "1 ד׳", seconds: 60 },
  { label: "3 ד׳", seconds: 180 },
  { label: "5 ד׳", seconds: 300 },
  { label: "10 ד׳", seconds: 600 },
];

export function TimerWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(5);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertedRef = useRef(false);

  const tick = useCallback(() => {
    setRemaining((prev) => {
      if (prev <= 1) {
        setRunning(false);
        if (!alertedRef.current) {
          alertedRef.current = true;
          playAlert();
        }
        return 0;
      }
      return prev - 1;
    });
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  // Don't show on screensaver
  if (pathname === "/screensaver") return null;

  const startTimer = (seconds: number) => {
    setTotalSeconds(seconds);
    setRemaining(seconds);
    setRunning(true);
    alertedRef.current = false;
  };

  const handleStart = () => startTimer(inputMinutes * 60);

  const handleReset = () => {
    setRunning(false);
    setRemaining(totalSeconds);
    alertedRef.current = false;
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;
  const isActive = remaining > 0 || running;

  const circumference = 2 * Math.PI * 24;

  return (
    <>
      {/* Floating timer button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 rounded-full shadow-lg flex items-center justify-center text-white"
        style={{
          width: 44,
          height: 44,
          bottom: 160,
          left: 24,
          backgroundColor: isActive ? "#F59E0B" : "#6B7280",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={
          running && remaining <= 30
            ? { scale: [1, 1.12, 1], transition: { duration: 0.8, repeat: Infinity } }
            : {}
        }
      >
        <Timer className="w-5 h-5" />
        {running && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {remaining <= 60 ? remaining : Math.ceil(remaining / 60)}
          </span>
        )}
      </motion.button>

      {/* Timer panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed z-50 bg-card border border-border rounded-2xl shadow-xl p-5 w-64"
            style={{ bottom: 210, left: 16 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Timer className="w-4 h-4 text-warning" /> טיימר
              </h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-background">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            {/* Circular progress */}
            {isActive && (
              <div className="flex justify-center mb-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="var(--color-border)" strokeWidth="4" />
                    <circle
                      cx="28" cy="28" r="24" fill="none"
                      stroke="#F59E0B" strokeWidth="4"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - progress)}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold font-mono">{mm}:{ss}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Presets */}
            {!isActive && (
              <div className="grid grid-cols-4 gap-1 mb-3">
                {PRESETS.map((p) => (
                  <button
                    key={p.seconds}
                    onClick={() => { setInputMinutes(p.seconds / 60); startTimer(p.seconds); }}
                    className="text-xs py-1.5 rounded-lg bg-background hover:bg-warning/20 hover:text-warning transition-all font-medium"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Custom input */}
            {!isActive && (
              <div className="flex gap-2 items-center mb-3">
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={inputMinutes}
                  onChange={(e) => setInputMinutes(Math.max(1, Math.min(99, Number(e.target.value))))}
                  className="w-16 text-center rounded-xl border-2 border-border p-2 bg-background outline-none font-bold text-sm"
                />
                <span className="text-sm text-text-secondary flex-1">דקות</span>
                <button
                  onClick={handleStart}
                  className="p-2 rounded-xl bg-warning text-white hover:bg-warning/80 transition-all"
                >
                  <Play className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Controls */}
            {isActive && (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setRunning((v) => !v)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-warning text-white font-semibold text-sm hover:bg-warning/80 transition-all"
                >
                  {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {running ? "עצור" : "המשך"}
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 rounded-xl bg-background border border-border hover:bg-border/50 transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
            )}

            {remaining === 0 && totalSeconds > 0 && (
              <p className="text-center text-sm font-bold text-warning mt-3">⏰ הזמן נגמר!</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
