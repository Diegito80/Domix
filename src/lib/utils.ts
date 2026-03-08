import { format } from "date-fns";
import { he } from "date-fns/locale";

const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

export function getHebrewDayName(date: Date): string {
  return HEBREW_DAYS[date.getDay()];
}

export function getHebrewMonthName(date: Date): string {
  return HEBREW_MONTHS[date.getMonth()];
}

export function formatHebrewDate(date: Date): string {
  const day = date.getDate();
  const dayName = getHebrewDayName(date);
  const monthName = getHebrewMonthName(date);
  const year = date.getFullYear();
  return `יום ${dayName}, ${day} ב${monthName} ${year}`;
}

export function formatHebrewTime(date: Date): string {
  return format(date, "HH:mm", { locale: he });
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "עכשיו";
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  return format(date, "dd/MM/yyyy");
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "לילה טוב";
  if (hour < 12) return "בוקר טוב";
  if (hour < 17) return "צהריים טובים";
  if (hour < 21) return "ערב טוב";
  return "לילה טוב";
}

export function getMemberSlug(name: string): string {
  return name.toLowerCase();
}
