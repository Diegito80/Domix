"use client";

import { AppShell } from "@/components/layout/AppShell";
import { FamilyCalendar } from "@/components/calendar/FamilyCalendar";

export default function CalendarPage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <FamilyCalendar />
      </div>
    </AppShell>
  );
}
