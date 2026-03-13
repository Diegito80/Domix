"use client";

import { useCallback, useRef } from "react";
import { useAppStore } from "@/lib/store";

type SoundName = "task-complete" | "reward-redeem" | "message-sent" | "notification";

const SOUND_CONFIGS: Record<SoundName, { freqs: number[]; type: OscillatorType; duration: number }> = {
  "task-complete": { freqs: [523, 659, 784], type: "sine", duration: 0.15 },
  "reward-redeem": { freqs: [440, 554, 659, 880], type: "triangle", duration: 0.18 },
  "message-sent": { freqs: [600, 800], type: "sine", duration: 0.12 },
  notification: { freqs: [440, 550], type: "sine", duration: 0.15 },
};

const SOUND_THROTTLE_MS = 400;

export function useAudioFeedback() {
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const ctxRef = useRef<AudioContext | null>(null);
  const lastPlayedRef = useRef<Record<string, number>>({});

  const play = useCallback(
    (name: SoundName) => {
      if (!soundEnabled) return;

      const now = Date.now();
      const last = lastPlayedRef.current[name] ?? 0;
      if (now - last < SOUND_THROTTLE_MS) return;
      lastPlayedRef.current[name] = now;

      try {
        // Reuse a single AudioContext to avoid browser autoplay restrictions
        if (!ctxRef.current || ctxRef.current.state === "closed") {
          ctxRef.current = new AudioContext();
        }
        const ctx = ctxRef.current;

        // Resume if suspended (browsers suspend until user gesture)
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }

        const config = SOUND_CONFIGS[name];

        config.freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.frequency.value = freq;
          osc.type = config.type;

          const startTime = ctx.currentTime + i * config.duration;
          gainNode.gain.setValueAtTime(0.25, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + config.duration + 0.15);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + config.duration + 0.2);
        });
      } catch {
        // Audio not available in this environment
      }
    },
    [soundEnabled]
  );

  return { play };
}
