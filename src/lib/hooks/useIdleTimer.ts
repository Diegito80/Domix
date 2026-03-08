"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/lib/store";

export function useIdleTimer(onIdle: () => void) {
  const idleTimeout = useAppStore((s) => s.idleTimeout);
  const isListening = useAppStore((s) => s.isListening);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    // Don't start idle timer during voice sessions or if disabled (0)
    if (isListening || idleTimeout === 0) return;

    timerRef.current = setTimeout(() => {
      onIdle();
    }, idleTimeout * 60 * 1000);
  }, [idleTimeout, isListening, onIdle]);

  useEffect(() => {
    if (idleTimeout === 0) return; // Screensaver disabled

    const events = ["mousemove", "mousedown", "touchstart", "keydown", "scroll"];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer, idleTimeout]);

  return { resetTimer };
}
