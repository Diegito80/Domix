"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  MessageCircle,
  ChefHat,
  Gift,
  Tv,
  Palette,
  Home,
  Settings,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "בית" },
  { href: "/calendar", icon: CalendarDays, label: "יומן" },
  { href: "/tasks", icon: CheckSquare, label: "משימות" },
  { href: "/chat", icon: MessageCircle, label: "הודעות" },
  { href: "/announcements", icon: GraduationCap, label: "ביה״ס" },
  { href: "/kitchen", icon: ChefHat, label: "מטבח" },
  { href: "/rewards", icon: Gift, label: "פרסים" },
  { href: "/entertainment", icon: Tv, label: "בידור" },
  { href: "/creative", icon: Palette, label: "יצירה" },
  { href: "/settings", icon: Settings, label: "הגדרות" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeMember = useAppStore((s) => s.activeMember);
  const memberColor = activeMember?.color || "#D4A574";

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-56 bg-card border-l border-border h-screen sticky top-0 py-4 shrink-0">
      <nav className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 min-h-[48px]",
                "active:scale-[0.97]",
                isActive
                  ? "text-white font-semibold shadow-sm"
                  : "text-text-secondary hover:bg-background hover:text-foreground"
              )}
              style={isActive ? { backgroundColor: memberColor } : undefined}
            >
              <Icon className="w-6 h-6 shrink-0" />
              <span className="hidden lg:inline text-sm">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
