import { create } from "zustand";

interface ActiveMember {
  id: string;
  name: string;
  nameHe: string;
  role: string;
  color: string;
  slug: string;
}

interface AppState {
  activeMember: ActiveMember | null;
  setActiveMember: (member: ActiveMember | null) => void;

  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;

  isListening: boolean;
  setIsListening: (listening: boolean) => void;

  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  idleTimeout: number; // minutes
  setIdleTimeout: (minutes: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeMember: null,
  setActiveMember: (member) => set({ activeMember: member }),

  voiceEnabled: true,
  setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),

  isListening: false,
  setIsListening: (listening) => set({ isListening: listening }),

  soundEnabled: true,
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

  idleTimeout: 5,
  setIdleTimeout: (minutes) => set({ idleTimeout: minutes }),
}));
