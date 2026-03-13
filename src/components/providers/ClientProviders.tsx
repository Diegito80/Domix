"use client";

import { VoiceMicButton } from "@/components/voice/VoiceMicButton";
import { TimerWidget } from "@/components/timer/TimerWidget";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <VoiceMicButton />
      <TimerWidget />
    </>
  );
}
