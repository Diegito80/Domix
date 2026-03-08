"use client";

import { VoiceMicButton } from "@/components/voice/VoiceMicButton";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <VoiceMicButton />
    </>
  );
}
