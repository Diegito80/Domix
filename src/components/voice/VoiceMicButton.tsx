"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";
import { useAudioFeedback } from "@/lib/hooks/useAudioFeedback";
import { parseVoiceCommand, getCommandFeedback } from "@/lib/voice-commands";
import { VoiceDictationOverlay } from "./VoiceDictationOverlay";
import { VoiceFeedbackToast } from "./VoiceFeedbackToast";
import { FAMILY_MEMBERS } from "@/lib/constants";

export function VoiceMicButton() {
  const router = useRouter();
  const pathname = usePathname();
  const activeMember = useAppStore((s) => s.activeMember);
  const voiceEnabled = useAppStore((s) => s.voiceEnabled);
  const setIsListening = useAppStore((s) => s.setIsListening);
  const setActiveMember = useAppStore((s) => s.setActiveMember);
  const { play } = useAudioFeedback();

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    isSupported,
  } = useSpeechRecognition();

  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "warning" | "error" } | null>(null);
  const [contextHint, setContextHint] = useState<string | undefined>();

  const isLian = activeMember?.slug === "lian";
  const buttonSize = isLian ? 80 : 60;
  const memberColor = activeMember?.color || "#D4A574";

  // Hide on screensaver
  const isScreensaver = pathname === "/screensaver";

  // Sync listening state to Zustand (pauses idle timer)
  useEffect(() => {
    setIsListening(isListening);
  }, [isListening, setIsListening]);

  // Show feedback toast then auto-dismiss
  const showFeedback = useCallback((text: string, type: "success" | "warning" | "error") => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  // Execute parsed command
  const executeCommand = useCallback(
    async (command: ReturnType<typeof parseVoiceCommand>) => {
      setProcessing(true);
      const fb = getCommandFeedback(command.action, command.param);

      try {
        switch (command.action) {
          case "NAVIGATE":
            if (command.target) router.push(command.target);
            break;

          case "CREATE_TASK": {
            if (!command.param || !activeMember) break;
            // Determine assignee: target (from "לטומי") or self
            let assignedToId = activeMember.id;
            if (command.target) {
              // Look up member ID by slug
              const res = await fetch("/api/members");
              const members = await res.json();
              const target = members.find(
                (m: { name: string }) => m.name.toLowerCase() === command.target
              );
              if (target) assignedToId = target.id;
            }
            await fetch("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: command.param,
                createdById: activeMember.id,
                assignedToId,
                pointsValue: 10,
                category: "general",
              }),
            });
            play("notification");
            break;
          }

          case "COMPLETE_TASK": {
            if (!activeMember) break;
            // Fetch user's incomplete tasks and fuzzy match
            const tasksRes = await fetch(`/api/tasks?memberId=${activeMember.id}`);
            const tasks = await tasksRes.json();
            const incomplete = tasks.filter((t: { completed: boolean }) => !t.completed);
            if (incomplete.length > 0) {
              // Find best match or just complete the first one
              let match = incomplete[0];
              if (command.param) {
                const found = incomplete.find((t: { title: string }) =>
                  t.title.includes(command.param!)
                );
                if (found) match = found;
              }
              await fetch(`/api/tasks/${match.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: true }),
              });
              play("task-complete");
            }
            break;
          }

          case "SEND_MESSAGE": {
            if (!command.param || !activeMember) break;
            await fetch("/api/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content: command.param, authorId: activeMember.id }),
            });
            play("message-sent");
            break;
          }

          case "SHOW_TODAY_EVENTS":
            router.push("/calendar");
            break;

          case "SHOW_TOMORROW_EVENTS":
            router.push("/calendar");
            break;

          case "CREATE_EVENT": {
            if (!command.param) break;
            const now = new Date();
            const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0);
            const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0);
            await fetch("/api/calendar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: command.param,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                memberIds: activeMember ? [activeMember.id] : [],
              }),
            });
            play("notification");
            router.push("/calendar");
            break;
          }

          case "SEARCH_RECIPE":
            router.push(`/kitchen${command.param ? `?search=${encodeURIComponent(command.param)}` : ""}`);
            break;

          case "START_COOKING_MODE":
            router.push("/kitchen");
            break;

          case "SHOW_POINTS": {
            if (!activeMember) break;
            const memberRes = await fetch("/api/members");
            const allMembers = await memberRes.json();
            const me = allMembers.find((m: { id: string }) => m.id === activeMember.id);
            if (me) {
              showFeedback(`יש לך ${me.points.toLocaleString()} נקודות ⭐`, "success");
              setProcessing(false);
              return; // Skip default feedback
            }
            break;
          }

          case "SWITCH_PROFILE": {
            if (!command.target) break;
            const fm = FAMILY_MEMBERS.find((m) => m.slug === command.target);
            if (fm) {
              // Fetch the actual member from DB to get the ID
              const membersRes = await fetch("/api/members");
              const dbMembers = await membersRes.json();
              const dbMember = dbMembers.find(
                (m: { name: string }) => m.name.toLowerCase() === fm.name.toLowerCase()
              );
              if (dbMember) {
                setActiveMember({
                  id: dbMember.id,
                  name: dbMember.name,
                  nameHe: dbMember.nameHe,
                  role: dbMember.role,
                  color: dbMember.color,
                  slug: fm.slug,
                });
                router.push(`/dashboard/${fm.slug}`);
              }
            }
            break;
          }

          case "UNRECOGNIZED":
          default:
            break;
        }
      } catch {
        showFeedback("שגיאה בביצוע הפקודה", "error");
        setProcessing(false);
        return;
      }

      showFeedback(fb.text, fb.type);
      setProcessing(false);
    },
    [activeMember, router, play, showFeedback, setActiveMember]
  );

  // Avoid executing the same transcript twice (e.g. speech API firing multiple results)
  const lastExecutedRef = useRef<{ transcript: string; at: number }>({ transcript: "", at: 0 });
  const SAME_TRANSCRIPT_COOLDOWN_MS = 5000;

  // Process transcript when it changes (listening stopped with a result)
  useEffect(() => {
    if (!isListening && transcript && !processing) {
      const trimmed = transcript.trim();
      if (!trimmed) return;

      const { transcript: last, at } = lastExecutedRef.current;
      if (last === trimmed && Date.now() - at < SAME_TRANSCRIPT_COOLDOWN_MS) return;
      lastExecutedRef.current = { transcript: trimmed, at: Date.now() };

      let command = parseVoiceCommand(transcript, isLian);

      // Context-aware: on chat page, treat unrecognized speech as a message
      if (command.action === "UNRECOGNIZED" && pathname === "/chat" && activeMember) {
        command = { action: "SEND_MESSAGE", param: transcript, raw: transcript };
      }

      setContextHint(undefined);
      executeCommand(command);
    }
  }, [isListening, transcript, processing, isLian, pathname, activeMember, executeCommand]);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setContextHint(undefined);
      startListening();
    }
  };

  // Don't render if voice not enabled, not supported, or on screensaver
  if (!voiceEnabled || !isSupported || isScreensaver) return null;

  return (
    <>
      {/* Floating mic button */}
      <motion.button
        onClick={handleToggle}
        className="fixed z-50 rounded-full shadow-lg flex items-center justify-center text-white"
        style={{
          width: buttonSize,
          height: buttonSize,
          bottom: 100,
          left: 24,
          backgroundColor: isListening ? "#EF4444" : memberColor,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={
          isLian
            ? { scale: [1, 1.05, 1], transition: { duration: 2, repeat: Infinity } }
            : isListening
              ? { boxShadow: ["0 0 0 0 rgba(239,68,68,0.4)", "0 0 0 16px rgba(239,68,68,0)", "0 0 0 0 rgba(239,68,68,0.4)"] }
              : {}
        }
        transition={isListening ? { duration: 1.5, repeat: Infinity } : undefined}
      >
        <AnimatePresence mode="wait">
          {processing ? (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Loader2 className="w-6 h-6 animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key="mic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Mic className={isLian ? "w-8 h-8" : "w-6 h-6"} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dictation overlay */}
      <VoiceDictationOverlay
        isOpen={isListening}
        transcript={transcript}
        interimTranscript={interimTranscript}
        contextHint={contextHint}
        onCancel={stopListening}
      />

      {/* Feedback toast */}
      <VoiceFeedbackToast
        message={feedback?.text || null}
        type={feedback?.type || "success"}
      />
    </>
  );
}
