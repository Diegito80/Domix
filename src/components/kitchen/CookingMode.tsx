"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Timer, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Step {
  instruction: string;
  timer?: number; // seconds
}

interface CookingModeProps {
  recipeName: string;
  steps: Step[];
  onClose: () => void;
}

export function CookingMode({ recipeName, steps, onClose }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (timerRunning && timerSeconds !== null && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev !== null && prev <= 1) {
            setTimerRunning(false);
            // Play alarm sound
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              osc.frequency.value = 800;
              osc.connect(ctx.destination);
              osc.start();
              setTimeout(() => osc.stop(), 500);
            } catch {
              // Audio not available
            }
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    } else {
      clearTimerInterval();
    }
    return clearTimerInterval;
  }, [timerRunning, timerSeconds, clearTimerInterval]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    if (step.timer) {
      setTimerSeconds(step.timer);
      setTimerRunning(true);
    }
  };

  const goNext = () => {
    if (!isLast) {
      setCurrentStep((p) => p + 1);
      setTimerSeconds(null);
      setTimerRunning(false);
      clearTimerInterval();
    }
  };

  const goPrev = () => {
    if (!isFirst) {
      setCurrentStep((p) => p - 1);
      setTimerSeconds(null);
      setTimerRunning(false);
      clearTimerInterval();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={onClose} className="p-3 rounded-xl hover:bg-card transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-bold text-lg">{recipeName}</h2>
        <span className="text-sm text-text-secondary font-medium">
          {currentStep + 1} / {steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-border">
        <motion.div
          className="h-full bg-accent-warm rounded-full"
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg"
          >
            <span className="text-6xl font-bold text-accent-warm/30 block mb-4">
              {currentStep + 1}
            </span>
            <p className="text-2xl font-medium leading-relaxed mb-8">{step.instruction}</p>

            {/* Timer */}
            {step.timer && (
              <div className="bg-card rounded-2xl border border-border p-6 inline-flex flex-col items-center gap-4">
                {timerSeconds === null ? (
                  <Button onClick={startTimer} className="flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    <span>הפעל טיימר ({Math.floor(step.timer / 60)} דק׳)</span>
                  </Button>
                ) : (
                  <>
                    <span
                      className={`text-5xl font-mono font-bold ${
                        timerSeconds === 0 ? "text-red-500 animate-pulse" : "text-accent-warm"
                      }`}
                    >
                      {formatTime(timerSeconds)}
                    </span>
                    {timerSeconds === 0 ? (
                      <span className="text-lg font-bold text-red-500">הזמן נגמר!</span>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setTimerRunning(!timerRunning)}
                          className="p-3 rounded-xl bg-accent-warm/10 text-accent-warm hover:bg-accent-warm/20 transition-colors"
                        >
                          {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => {
                            setTimerSeconds(step.timer!);
                            setTimerRunning(false);
                          }}
                          className="p-3 rounded-xl bg-card border border-border hover:bg-background transition-colors"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-6 border-t border-border">
        <Button
          variant="secondary"
          onClick={goPrev}
          disabled={isFirst}
          className="flex items-center gap-2 min-w-[120px]"
        >
          <ChevronRight className="w-5 h-5" />
          <span>הקודם</span>
        </Button>

        {isLast ? (
          <Button onClick={onClose} className="flex items-center gap-2 min-w-[120px]">
            <span>סיים! 🎉</span>
          </Button>
        ) : (
          <Button onClick={goNext} className="flex items-center gap-2 min-w-[120px]">
            <span>הבא</span>
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
