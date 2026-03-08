"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import {
  CalendarDays,
  CheckSquare,
  MessageCircle,
  ChefHat,
  Gift,
  Tv,
  Palette,
  Gamepad2,
  BookOpen,
  Music,
  Puzzle,
  Star,
} from "lucide-react";

interface FamilyMember {
  id: string;
  name: string;
  nameHe: string;
  role: string;
  age: number;
  color: string;
  points: number;
}

function ParentWidgets() {
  const router = useRouter();

  const widgets = [
    { icon: CalendarDays, label: "יומן משפחתי", href: "/calendar", color: "#4A6FA5" },
    { icon: CheckSquare, label: "משימות היום", href: "/tasks", color: "#7B9E6B" },
    { icon: MessageCircle, label: "הודעות", href: "/chat", color: "#E8943A" },
    { icon: ChefHat, label: "מטבח", href: "/kitchen", color: "#C46B9E" },
    { icon: Gift, label: "פרסים", href: "/rewards", color: "#D4A574" },
    { icon: Tv, label: "בידור", href: "/entertainment", color: "#6B7280" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {widgets.map(({ icon: Icon, label, href, color }, i) => (
        <motion.div
          key={href}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.05 }}
        >
          <Card hover onClick={() => router.push(href)} className="flex flex-col items-center gap-3 py-6">
            <Icon className="w-10 h-10" style={{ color }} />
            <span className="font-semibold text-sm">{label}</span>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function KidWidgets() {
  const router = useRouter();

  const widgets = [
    { icon: CheckSquare, label: "המשימות שלי", href: "/tasks", color: "#7B9E6B" },
    { icon: CalendarDays, label: "מערכת שעות", href: "/calendar", color: "#4A6FA5" },
    { icon: Gift, label: "חנות פרסים", href: "/rewards", color: "#E8943A" },
    { icon: MessageCircle, label: "הודעות", href: "/chat", color: "#C46B9E" },
    { icon: Palette, label: "ציור", href: "/creative", color: "#F2C94C" },
    { icon: Tv, label: "בידור", href: "/entertainment", color: "#6B7280" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {widgets.map(({ icon: Icon, label, href, color }, i) => (
        <motion.div
          key={href}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.05 }}
        >
          <Card hover onClick={() => router.push(href)} className="flex flex-col items-center gap-3 py-6">
            <Icon className="w-12 h-12" style={{ color }} />
            <span className="font-bold">{label}</span>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function LianWidgets() {
  const router = useRouter();

  const widgets = [
    { label: "משחקים", emoji: "🦁", href: "/entertainment", color: "#E8943A" },
    { label: "אותיות", emoji: "🔤", href: "/entertainment", color: "#4A6FA5" },
    { label: "מוזיקה", emoji: "🎵", href: "/entertainment", color: "#C46B9E" },
    { label: "ציור", emoji: "🎨", href: "/creative", color: "#F2C94C" },
    { label: "חידות", emoji: "🧩", href: "/entertainment", color: "#7B9E6B" },
    { label: "סיפורים", emoji: "📚", href: "/entertainment", color: "#D4A574" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
      {widgets.map(({ label, emoji, href, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + i * 0.08, type: "spring" }}
        >
          <Card
            hover
            onClick={() => router.push(href)}
            className="flex flex-col items-center gap-3 py-8"
          >
            <span className="text-5xl">{emoji}</span>
            <span className="font-bold text-lg">{label}</span>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const params = useParams();
  const memberSlug = params.member as string;
  const router = useRouter();
  const activeMember = useAppStore((s) => s.activeMember);
  const setActiveMember = useAppStore((s) => s.setActiveMember);
  const [member, setMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then((members: FamilyMember[]) => {
        const found = members.find(
          (m) => m.name.toLowerCase() === memberSlug.toLowerCase()
        );
        if (found) {
          setMember(found);
          if (!activeMember || activeMember.id !== found.id) {
            setActiveMember({
              id: found.id,
              name: found.name,
              nameHe: found.nameHe,
              role: found.role,
              color: found.color,
              slug: found.name.toLowerCase(),
            });
          }
        } else {
          router.push("/");
        }
      });
  }, [memberSlug]);

  if (!member) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-text-secondary">טוען...</div>
        </div>
      </AppShell>
    );
  }

  const isLian = member.name.toLowerCase() === "lian";
  const isChild = member.role === "child";

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold mb-1">
            שלום, {member.nameHe}! 👋
          </h1>
          {isChild && (
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-5 h-5 text-warning" fill="currentColor" />
              <span className="font-semibold text-lg">
                {member.points} נקודות
              </span>
            </div>
          )}
        </motion.div>

        {/* Widgets */}
        {isLian ? (
          <LianWidgets />
        ) : isChild ? (
          <KidWidgets />
        ) : (
          <ParentWidgets />
        )}
      </div>
    </AppShell>
  );
}
