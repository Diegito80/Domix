interface VoiceCommand {
  triggers: string[];
  action: string;
  target?: string;
  extractParam?: string;
}

interface CommandCategory {
  [key: string]: VoiceCommand[];
}

const VOICE_COMMANDS: CommandCategory = {
  navigation: [
    { triggers: ["לך ללוח שנה", "פתח לוח שנה", "תראה לוח שנה", "יומן"], action: "NAVIGATE", target: "/calendar" },
    { triggers: ["לך למשימות", "פתח משימות", "תראה משימות", "משימות"], action: "NAVIGATE", target: "/tasks" },
    { triggers: ["לך למטבח", "פתח מתכונים", "מטבח"], action: "NAVIGATE", target: "/kitchen" },
    { triggers: ["פתח צ'אט", "הודעות", "לוח הודעות"], action: "NAVIGATE", target: "/chat" },
    { triggers: ["פתח ציור", "בוא נצייר", "יצירה"], action: "NAVIGATE", target: "/creative" },
    { triggers: ["פתח חנות", "חנות פרסים", "פרסים"], action: "NAVIGATE", target: "/rewards" },
    { triggers: ["פתח בידור", "בידור", "נטפליקס"], action: "NAVIGATE", target: "/entertainment" },
    { triggers: ["הגדרות", "פתח הגדרות"], action: "NAVIGATE", target: "/settings" },
    { triggers: ["בית", "דף הבית", "חזור הביתה"], action: "NAVIGATE", target: "/" },
  ],
  taskCreation: [
    { triggers: ["תוסיף משימה", "משימה חדשה", "צור משימה", "תוסיפי משימה"], action: "CREATE_TASK", extractParam: "remainder_as_title" },
  ],
  taskCompletion: [
    { triggers: ["סיימתי", "עשיתי", "ביצעתי", "סימון"], action: "COMPLETE_TASK", extractParam: "fuzzy_match_task_title" },
  ],
  messaging: [
    { triggers: ["תשלח הודעה", "שלח הודעה", "הודעה למשפחה", "תכתוב הודעה"], action: "SEND_MESSAGE", extractParam: "remainder_as_content" },
  ],
  calendar: [
    { triggers: ["מה יש היום", "מה בלוח היום", "אירועים היום"], action: "SHOW_TODAY_EVENTS" },
    { triggers: ["מה יש מחר", "מה בלוח מחר"], action: "SHOW_TOMORROW_EVENTS" },
    { triggers: ["תוסיף אירוע", "אירוע חדש"], action: "CREATE_EVENT", extractParam: "remainder_as_title" },
  ],
  kitchen: [
    { triggers: ["מה מבשלים", "תציע מתכון", "מתכון ל"], action: "SEARCH_RECIPE", extractParam: "remainder_as_search" },
    { triggers: ["תתחיל לבשל", "מצב בישול", "בוא נבשל"], action: "START_COOKING_MODE" },
  ],
  rewards: [
    { triggers: ["כמה נקודות יש לי", "הנקודות שלי", "כמה נקודות"], action: "SHOW_POINTS" },
  ],
  profileSwitch: [
    { triggers: ["עבור לרועי", "עבור לאבא", "תפתח את רועי"], action: "SWITCH_PROFILE", target: "roy" },
    { triggers: ["עבור ללירון", "עבור לאמא", "תפתח את לירון"], action: "SWITCH_PROFILE", target: "liron" },
    { triggers: ["עבור לטומי", "תפתח את טומי"], action: "SWITCH_PROFILE", target: "tommy" },
    { triggers: ["עבור למיילי", "תפתח את מיילי"], action: "SWITCH_PROFILE", target: "mailee" },
    { triggers: ["עבור לליאן", "תפתח את ליאן"], action: "SWITCH_PROFILE", target: "lian" },
  ],
};

// Lian only gets navigation + task completion
const LIAN_CATEGORIES = ["navigation", "taskCompletion"];

export interface ParsedCommand {
  action: string;
  target?: string;
  param?: string;
  raw: string;
}

export function parseVoiceCommand(transcript: string, isLian: boolean = false): ParsedCommand {
  const normalized = transcript.trim();

  const categories = isLian
    ? LIAN_CATEGORIES
    : Object.keys(VOICE_COMMANDS);

  for (const category of categories) {
    const commands = VOICE_COMMANDS[category];
    if (!commands) continue;

    for (const cmd of commands) {
      for (const trigger of cmd.triggers) {
        if (normalized.includes(trigger)) {
          let param: string | undefined;

          if (cmd.extractParam) {
            // Extract everything after the trigger phrase
            const idx = normalized.indexOf(trigger);
            const remainder = normalized.slice(idx + trigger.length).trim();
            if (remainder) {
              param = remainder;
            }
          }

          // For task creation by parents: detect member names for assignment
          if (cmd.action === "CREATE_TASK" && param) {
            const memberNames: Record<string, string> = {
              "לטומי": "tommy",
              "למיילי": "mailee",
              "לליאן": "lian",
            };
            for (const [prefix, slug] of Object.entries(memberNames)) {
              if (param.startsWith(prefix)) {
                param = param.slice(prefix.length).trim();
                return { action: cmd.action, target: slug, param, raw: normalized };
              }
            }
          }

          return {
            action: cmd.action,
            target: cmd.target,
            param,
            raw: normalized,
          };
        }
      }
    }
  }

  return { action: "UNRECOGNIZED", raw: normalized };
}

// Hebrew feedback messages
export function getCommandFeedback(action: string, param?: string): { text: string; type: "success" | "warning" | "error" } {
  switch (action) {
    case "NAVIGATE":
      return { text: "מנווט... 📍", type: "success" };
    case "CREATE_TASK":
      return { text: param ? `משימה נוספה: ${param}` : "משימה נוספה ✅", type: "success" };
    case "COMPLETE_TASK":
      return { text: "משימה הושלמה! 🎉", type: "success" };
    case "SEND_MESSAGE":
      return { text: "הודעה נשלחה למשפחה 💬", type: "success" };
    case "SHOW_TODAY_EVENTS":
      return { text: "מציג אירועים של היום 📅", type: "success" };
    case "SHOW_TOMORROW_EVENTS":
      return { text: "מציג אירועים של מחר 📅", type: "success" };
    case "CREATE_EVENT":
      return { text: param ? `אירוע נוסף: ${param}` : "אירוע נוסף 📅", type: "success" };
    case "SEARCH_RECIPE":
      return { text: param ? `מחפש מתכון: ${param}` : "מחפש מתכון... 🍽️", type: "success" };
    case "START_COOKING_MODE":
      return { text: "מפעיל מצב בישול 👨‍🍳", type: "success" };
    case "SHOW_POINTS":
      return { text: "מציג נקודות... ⭐", type: "success" };
    case "SWITCH_PROFILE":
      return { text: "מחליף פרופיל... 👤", type: "success" };
    case "UNRECOGNIZED":
      return { text: "לא הבנתי, אפשר לנסות שוב ❓", type: "warning" };
    default:
      return { text: "פקודה לא מוכרת", type: "error" };
  }
}
