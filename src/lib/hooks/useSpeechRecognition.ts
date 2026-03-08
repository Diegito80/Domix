"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface SpeechRecognitionResult {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  isSupported: boolean;
}

export function useSpeechRecognition(): SpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setInterimTranscript("");
  }, [clearSilenceTimer]);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError("Speech recognition not supported");
      return;
    }

    // Clean up previous instance
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setTranscript("");
    setInterimTranscript("");
    setError(null);

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "he-IL";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = "";
      let interim = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setTranscript(final.trim());
        setInterimTranscript("");
      } else {
        setInterimTranscript(interim);
      }

      // Reset silence timer on any result
      clearSilenceTimer();
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, 3000);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Ignore "no-speech" and "aborted" — these are normal
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
      clearSilenceTimer();
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);

      // Auto-stop after 3 seconds of silence
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, 3000);
    } catch {
      setError("Failed to start recognition");
    }
  }, [clearSilenceTimer, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      clearSilenceTimer();
    };
  }, [clearSilenceTimer]);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    error,
    isSupported,
  };
}
