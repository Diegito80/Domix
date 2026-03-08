export interface FamilyMemberData {
  name: string;
  nameHe: string;
  role: "parent" | "child";
  age: number;
  color: string;
  avatarUrl: string;
  slug: string;
}

export const FAMILY_MEMBERS: FamilyMemberData[] = [
  {
    name: "Roy",
    nameHe: "רועי",
    role: "parent",
    age: 40,
    color: "#4A6FA5",
    avatarUrl: "/avatars/roy.png",
    slug: "roy",
  },
  {
    name: "Liron",
    nameHe: "לירון",
    role: "parent",
    age: 38,
    color: "#7B9E6B",
    avatarUrl: "/avatars/liron.png",
    slug: "liron",
  },
  {
    name: "Tommy",
    nameHe: "טומי",
    role: "child",
    age: 12.5,
    color: "#E8943A",
    avatarUrl: "/avatars/tommy.png",
    slug: "tommy",
  },
  {
    name: "Mailee",
    nameHe: "מיילי",
    role: "child",
    age: 10.5,
    color: "#C46B9E",
    avatarUrl: "/avatars/mailee.png",
    slug: "mailee",
  },
  {
    name: "Lian",
    nameHe: "ליאן",
    role: "child",
    age: 7,
    color: "#F2C94C",
    avatarUrl: "/avatars/lian.png",
    slug: "lian",
  },
];

export const COLORS = {
  background: "#F7F5F0",
  backgroundSecondary: "#FFFFFF",
  cardBackground: "#FFFFFF",
  textPrimary: "#2D2D2D",
  textSecondary: "#6B7280",
  accentWarm: "#D4A574",
  accentGreen: "#7B9E6B",
  accentCoral: "#E8943A",
  border: "#E5E2DC",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
} as const;

export const REWARD_CATALOG = [
  { name: "גלידה", nameEn: "Ice cream", emoji: "🍦", pointsCost: 200, category: "small" },
  { name: "חטיף מיוחד", nameEn: "Special snack", emoji: "🍫", pointsCost: 150, category: "small" },
  { name: "לבחור את ארוחת הערב", nameEn: "Choose dinner", emoji: "🍕", pointsCost: 250, category: "small" },
  { name: "30 דקות מסך נוסף", nameEn: "30 min extra screen", emoji: "📺", pointsCost: 300, category: "medium" },
  { name: "שעה של משחק", nameEn: "One hour gaming", emoji: "🎮", pointsCost: 500, category: "medium" },
  { name: "לישון מאוחר ב-30 דקות", nameEn: "30 min late bedtime", emoji: "🌙", pointsCost: 400, category: "medium" },
  { name: "סרט משפחתי לבחירה", nameEn: "Family movie choice", emoji: "🎬", pointsCost: 750, category: "large" },
  { name: "יום כיף עם חבר", nameEn: "Fun day with friend", emoji: "🎉", pointsCost: 1000, category: "large" },
  { name: 'קניות בסכום של 50 ש"ח', nameEn: "50 NIS shopping", emoji: "🛍️", pointsCost: 2000, category: "large" },
  { name: "טלפון חדש", nameEn: "New phone", emoji: "📱", pointsCost: 10000, category: "epic" },
] as const;

export const TASK_CATEGORIES = {
  morning_routine: "שגרת בוקר",
  chores: "מטלות",
  homework: "שיעורי בית",
  general: "כללי",
} as const;

export const TIME_OF_DAY = {
  morning: "בוקר",
  afternoon: "צהריים",
  evening: "ערב",
} as const;
