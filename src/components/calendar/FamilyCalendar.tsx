"use client";

import { useEffect, useState, useCallback } from "react";
import { addDays, startOfWeek, format, isSameDay } from "date-fns";
import { he } from "date-fns/locale";
import { ChevronRight, ChevronLeft, Plus } from "lucide-react";
import { EventCard } from "./EventCard";
import { AddEventModal } from "./AddEventModal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string | null;
  color?: string | null;
  memberIds: string;
  eventType: string;
  zoomLink?: string | null;
}

interface FamilyMember {
  id: string;
  name: string;
  nameHe: string;
  color: string;
}

const HEBREW_DAYS_SHORT = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

export function FamilyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [filterMemberId, setFilterMemberId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Week starts on Sunday
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchEvents = useCallback(() => {
    const start = weekDays[0].toISOString();
    const end = addDays(weekDays[6], 1).toISOString();
    const params = new URLSearchParams({ startDate: start, endDate: end });
    if (filterMemberId) params.set("memberId", filterMemberId);

    fetch(`/api/calendar?${params}`)
      .then((r) => r.json())
      .then(setEvents);
  }, [currentDate, filterMemberId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetch("/api/members").then((r) => r.json()).then(setMembers);
  }, []);

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.startTime), day));

  const handleAddEvent = async (data: Record<string, unknown>) => {
    await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchEvents();
  };

  const prevWeek = () => setCurrentDate((d) => addDays(d, -7));
  const nextWeek = () => setCurrentDate((d) => addDays(d, 7));
  const goToday = () => setCurrentDate(new Date());

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">יומן משפחתי</h1>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          אירוע חדש
        </Button>
      </div>

      {/* Member filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterMemberId(null)}
          className={cn(
            "px-3 py-2 rounded-xl text-sm font-medium transition-all shrink-0",
            !filterMemberId ? "bg-accent-warm text-white" : "bg-card text-text-secondary"
          )}
        >
          כולם
        </button>
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => setFilterMemberId(filterMemberId === m.id ? null : m.id)}
            className={cn(
              "px-3 py-2 rounded-xl text-sm font-medium transition-all shrink-0 border-2",
            )}
            style={{
              borderColor: filterMemberId === m.id ? m.color : "transparent",
              backgroundColor: filterMemberId === m.id ? m.color + "20" : "var(--color-card)",
              color: filterMemberId === m.id ? m.color : undefined,
            }}
          >
            {m.nameHe}
          </button>
        ))}
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={nextWeek} className="p-2 rounded-xl hover:bg-card active:scale-95">
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <span className="font-semibold">
            {format(weekDays[0], "d MMM", { locale: he })} — {format(weekDays[6], "d MMM yyyy", { locale: he })}
          </span>
          <button onClick={goToday} className="text-xs text-accent-warm font-medium">
            היום
          </button>
        </div>
        <button onClick={prevWeek} className="p-2 rounded-xl hover:bg-card active:scale-95">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Weekly grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {HEBREW_DAYS_SHORT.map((day, i) => (
          <div key={i} className="text-center text-sm font-semibold text-text-secondary py-2">
            {day}
          </div>
        ))}

        {/* Day cells */}
        {weekDays.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[120px] rounded-xl border p-2 transition-all",
                isToday ? "border-accent-warm bg-accent-warm/5" : "border-border bg-card",
                "cursor-pointer hover:shadow-sm"
              )}
              onClick={() => {
                setSelectedDate(format(day, "yyyy-MM-dd"));
                setShowAddModal(true);
              }}
            >
              <div className={cn(
                "text-sm font-bold mb-2 text-center",
                isToday ? "text-accent-warm" : "text-foreground"
              )}>
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium text-white"
                    style={{ backgroundColor: event.color || "#D4A574" }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-text-secondary text-center">
                    +{dayEvents.length - 3} עוד
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's events detail */}
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-3">
          אירועים להיום
        </h2>
        <div className="space-y-2">
          {getEventsForDay(new Date()).length === 0 ? (
            <p className="text-text-secondary text-sm py-4 text-center">אין אירועים להיום</p>
          ) : (
            getEventsForDay(new Date()).map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </div>
      </div>

      <AddEventModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedDate(null);
        }}
        onSubmit={handleAddEvent}
        defaultDate={selectedDate || undefined}
      />
    </div>
  );
}
