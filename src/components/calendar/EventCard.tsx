"use client";

import { format } from "date-fns";
import { MapPin, Video, Clock } from "lucide-react";
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
  eventType: string;
  zoomLink?: string | null;
}

const EVENT_TYPE_ICONS: Record<string, string> = {
  school: "📚",
  activity: "🎉",
  zoom: "📹",
  family: "👨‍👩‍👧‍👦",
  general: "📌",
};

export function EventCard({ event }: { event: CalendarEvent }) {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  return (
    <div
      className={cn(
        "rounded-xl p-3 border-r-4 bg-card shadow-sm",
        "transition-all active:scale-[0.98]"
      )}
      style={{ borderColor: event.color || "#D4A574" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span>{EVENT_TYPE_ICONS[event.eventType] || "📌"}</span>
            <h4 className="font-semibold text-sm truncate">{event.title}</h4>
          </div>

          <div className="flex items-center gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {event.isAllDay
                ? "כל היום"
                : `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`}
            </span>

            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.location}
              </span>
            )}
          </div>
        </div>

        {event.zoomLink && (
          <a
            href={event.zoomLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Video className="w-3 h-3" />
            Zoom
          </a>
        )}
      </div>
    </div>
  );
}
