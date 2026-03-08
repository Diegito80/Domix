"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Volume2, VolumeX, Mic, MicOff, Monitor, Clock } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";

export default function SettingsPage() {
  const {
    soundEnabled,
    setSoundEnabled,
    voiceEnabled,
    setVoiceEnabled,
    idleTimeout,
    setIdleTimeout,
  } = useAppStore();

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  const saveSetting = async (key: string, value: string) => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaving(false);
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    saveSetting("soundEffectsEnabled", String(newValue));
  };

  const toggleVoice = () => {
    const newValue = !voiceEnabled;
    setVoiceEnabled(newValue);
    saveSetting("voiceEnabled", String(newValue));
  };

  const changeIdleTimeout = (minutes: number) => {
    setIdleTimeout(minutes);
    saveSetting("idleTimeoutMinutes", String(minutes));
  };

  const IDLE_OPTIONS = [
    { value: 2, label: "2 דקות" },
    { value: 5, label: "5 דקות" },
    { value: 10, label: "10 דקות" },
    { value: 15, label: "15 דקות" },
    { value: 30, label: "30 דקות" },
    { value: 0, label: "כבוי" },
  ];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-7 h-7 text-accent-warm" />
          <h1 className="text-2xl font-bold">הגדרות</h1>
          {saving && (
            <span className="text-xs text-text-secondary mr-auto animate-pulse">שומר...</span>
          )}
        </div>

        <div className="space-y-4">
          {/* Sound Effects */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-accent-warm" />
                ) : (
                  <VolumeX className="w-5 h-5 text-text-secondary" />
                )}
                <div>
                  <h3 className="font-bold">אפקטים קוליים</h3>
                  <p className="text-sm text-text-secondary">צלילים בהשלמת משימות ופרסים</p>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`w-14 h-8 rounded-full transition-colors relative ${
                  soundEnabled ? "bg-accent-warm" : "bg-border"
                }`}
              >
                <motion.div
                  className="w-6 h-6 rounded-full bg-white shadow-sm absolute top-1"
                  animate={{ right: soundEnabled ? 4 : undefined, left: soundEnabled ? undefined : 4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </motion.div>

          {/* Voice Control */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl border border-border p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {voiceEnabled ? (
                  <Mic className="w-5 h-5 text-accent-warm" />
                ) : (
                  <MicOff className="w-5 h-5 text-text-secondary" />
                )}
                <div>
                  <h3 className="font-bold">שליטה קולית</h3>
                  <p className="text-sm text-text-secondary">פקודות קוליות בעברית</p>
                </div>
              </div>
              <button
                onClick={toggleVoice}
                className={`w-14 h-8 rounded-full transition-colors relative ${
                  voiceEnabled ? "bg-accent-warm" : "bg-border"
                }`}
              >
                <motion.div
                  className="w-6 h-6 rounded-full bg-white shadow-sm absolute top-1"
                  animate={{ right: voiceEnabled ? 4 : undefined, left: voiceEnabled ? undefined : 4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </motion.div>

          {/* Idle Timeout / Screensaver */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-5 h-5 text-accent-warm" />
              <div>
                <h3 className="font-bold">שומר מסך</h3>
                <p className="text-sm text-text-secondary">הפעלה אוטומטית אחרי חוסר פעילות</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {IDLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => changeIdleTimeout(opt.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    idleTimeout === opt.value
                      ? "bg-accent-warm text-white"
                      : "bg-background border border-border hover:bg-card"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-2xl border border-border p-5"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-text-secondary" />
              <div>
                <h3 className="font-bold">המרכז המשפחתי המאוחד</h3>
                <p className="text-sm text-text-secondary">גרסה 1.0 • משפחת דקלה</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
