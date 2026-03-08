"use client";

import { useEffect, useState } from "react";
import { formatHebrewDate, formatHebrewTime, getGreeting } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";

export function TopBar() {
  const [now, setNow] = useState(new Date());
  const activeMember = useAppStore((s) => s.activeMember);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Right side (RTL): date + greeting */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-xl hover:bg-background active:scale-95 transition-all"
            aria-label="חזרה לדף הבית"
          >
            <Home className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <p className="text-sm text-text-secondary">{getGreeting()}</p>
            <p className="text-sm font-medium">{formatHebrewDate(now)}</p>
          </div>
          <WeatherWidget />
        </div>

        {/* Center: clock */}
        <div className="text-3xl font-bold tabular-nums tracking-wider text-foreground">
          {formatHebrewTime(now)}
        </div>

        {/* Left side (RTL): active member */}
        <div className="flex items-center gap-3">
          {activeMember ? (
            <>
              <span className="text-sm font-medium hidden sm:inline">
                {activeMember.nameHe}
              </span>
              <Avatar
                name={activeMember.name}
                nameHe={activeMember.nameHe}
                color={activeMember.color}
                size="sm"
              />
            </>
          ) : (
            <span className="text-sm text-text-secondary">בחר פרופיל</span>
          )}
        </div>
      </div>
    </header>
  );
}
