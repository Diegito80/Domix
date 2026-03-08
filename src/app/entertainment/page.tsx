"use client";

import { useRouter } from "next/navigation";
import { Tv } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { MediaLauncher } from "@/components/entertainment/MediaLauncher";

// Member ages for content filtering
const MEMBER_AGES: Record<string, number> = {
  tommy: 12.5,
  mailee: 10.5,
  lian: 7,
};

export default function EntertainmentPage() {
  const router = useRouter();
  const activeMember = useAppStore((s) => s.activeMember);

  const memberAge = activeMember?.slug ? MEMBER_AGES[activeMember.slug] : undefined;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Tv className="w-7 h-7 text-accent-warm" />
          <h1 className="text-2xl font-bold">מרכז בידור</h1>
        </div>

        <MediaLauncher
          memberAge={memberAge}
          memberName={activeMember?.nameHe}
          onNavigate={(route) => router.push(route)}
        />
      </div>
    </AppShell>
  );
}
