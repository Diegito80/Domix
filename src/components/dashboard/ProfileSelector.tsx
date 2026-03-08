"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import { formatHebrewDate, formatHebrewTime, getGreeting } from "@/lib/utils";

interface FamilyMember {
  id: string;
  name: string;
  nameHe: string;
  role: string;
  color: string;
}

export function ProfileSelector() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [now, setNow] = useState(new Date());
  const setActiveMember = useAppStore((s) => s.setActiveMember);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then(setMembers);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelect = (member: FamilyMember) => {
    const slug = member.name.toLowerCase();
    setActiveMember({
      id: member.id,
      name: member.name,
      nameHe: member.nameHe,
      role: member.role,
      color: member.color,
      slug,
    });
    router.push(`/dashboard/${slug}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 py-12">
      {/* Clock */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-6xl font-bold tabular-nums tracking-wider text-foreground mb-3">
          {formatHebrewTime(now)}
        </h2>
        <p className="text-lg text-text-secondary">{formatHebrewDate(now)}</p>
        <p className="text-xl font-medium text-foreground mt-2">{getGreeting()}</p>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-foreground mb-2"
      >
        המרכז המשפחתי
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-text-secondary mb-10"
      >
        מי נכנס?
      </motion.p>

      {/* Avatar Row */}
      <div className="flex items-end justify-center gap-6 flex-wrap">
        {members.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar
              name={member.name}
              nameHe={member.nameHe}
              color={member.color}
              size="xl"
              showName
              onClick={() => handleSelect(member)}
            />
          </motion.div>
        ))}
      </div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-sm text-text-secondary mt-16"
      >
        מחברים את הבית יחד
      </motion.p>
    </div>
  );
}
