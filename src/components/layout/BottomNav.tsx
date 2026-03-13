"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  MessageCircle,
  ChefHat,
  Gift,
  Home,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "בית" },
  { href: "/calendar", icon: CalendarDays, label: "יומן" },
  { href: "/tasks", icon: CheckSquare, label: "משימות" },
  { href: "/chat", icon: MessageCircle, label: "הודעות" },
  { href: "/kitchen", icon: ChefHat, label: "מטבח" },
  { href: "/rewards", icon: Gift, label: "פרסים" },
  { href: "/shopping", icon: ShoppingCart, label: "קניות" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const activeMember = useAppStore((s) => s.activeMember);
  const memberColor = activeMember?.color || "#D4A574";

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/90 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-2">
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
                "flex flex-col items-center gap-1 px-2 py-2 rounded-xl min-w-[44px] min-h-[52px] transition-all",
                "active:scale-[0.92]",
                isActive ? "font-semibold" : "text-text-secondary"
              )}
            >
              <Icon
                className="w-5 h-5"
                style={isActive ? { color: memberColor } : undefined}
              />
              <span
                className="text-[9px]"
                style={isActive ? { color: memberColor } : undefined}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
