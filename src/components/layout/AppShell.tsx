"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { useIdleTimer } from "@/lib/hooks/useIdleTimer";

interface AppShellProps {
  children: React.ReactNode;
}

// Check if tasks need to be reset (once per day at midnight)
async function checkAndResetTasks() {
  try {
    const res = await fetch("/api/tasks/reset");
    const { lastReset } = await res.json();
    const today = new Date().toISOString().split("T")[0];
    if (lastReset !== today) {
      await fetch("/api/tasks/reset", { method: "PATCH" });
    }
  } catch {
    // Silent fail — not critical
  }
}

// Play a notification chime using Web Audio API
function playNotificationChime() {
  try {
    const ctx = new AudioContext();
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch {}
}

// Auto-trigger screensaver at 8pm
function useNightScreensaver(onNight: () => void) {
  const firedRef = useRef(false);
  useEffect(() => {
    const check = () => {
      const h = new Date().getHours();
      if (h >= 20 && h < 22) {
        if (!firedRef.current) {
          firedRef.current = true;
          onNight();
        }
      } else {
        firedRef.current = false;
      }
    };
    check();
    const interval = setInterval(check, 60 * 1000);
    return () => clearInterval(interval);
  }, [onNight]);
}

// Check for upcoming calendar events (10 minutes before)
function useEventNotifications(onNotify: (title: string) => void) {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const check = async () => {
      try {
        const now = new Date();
        const soon = new Date(now.getTime() + 10 * 60 * 1000);
        const res = await fetch("/api/calendar");
        const events = await res.json();
        for (const event of events) {
          const start = new Date(event.startTime);
          if (start > now && start <= soon) {
            const key = event.id;
            if (!notifiedRef.current.has(key)) {
              notifiedRef.current.add(key);
              onNotify(event.title);
              playNotificationChime();
            }
          }
        }
      } catch {}
    };
    check();
    const interval = setInterval(check, 60 * 1000);
    return () => clearInterval(interval);
  }, [onNotify]);
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [eventAlert, setEventAlert] = useState<string | null>(null);

  const handleIdle = useCallback(() => {
    router.push("/screensaver");
  }, [router]);

  const handleEventNotify = useCallback((title: string) => {
    setEventAlert(title);
    setTimeout(() => setEventAlert(null), 15000);
  }, []);

  useIdleTimer(handleIdle);
  useNightScreensaver(handleIdle);
  useEventNotifications(handleEventNotify);

  // Reset recurring tasks once per day
  useEffect(() => {
    checkAndResetTasks();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
          {children}
        </main>
      </div>
      <BottomNav />

      {/* Event notification alert */}
      <AnimatePresence>
        {eventAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-card border border-accent-warm/30 rounded-2xl shadow-xl px-6 py-4 flex items-center gap-3 max-w-sm w-full mx-4"
          >
            <div className="w-10 h-10 rounded-full bg-accent-warm/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-accent-warm" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">⏰ בעוד 10 דקות</p>
              <p className="text-sm text-text-secondary">{eventAlert}</p>
            </div>
            <button onClick={() => setEventAlert(null)} className="p-1 rounded-lg hover:bg-background">
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
