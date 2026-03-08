"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PhotoSlideshow } from "@/components/screensaver/PhotoSlideshow";
import { AnalogClock } from "@/components/screensaver/AnalogClock";

const HEBREW_QUOTES = [
  "המשפחה היא המקום שבו החיים מתחילים, והאהבה לעולם לא נגמרת",
  "ביחד אנחנו יותר חזקים",
  "כל יום הוא הזדמנות חדשה להיות טובים יותר",
  "השמחה שבדברים הקטנים היא הגדולה ביותר",
  "אהבה היא השפה שכולם מבינים",
  "הבית הוא המקום שבו הלב נמצא",
  "חיוך הוא דבר יפה שאפשר לתת בחינם",
  "יום מושלם מתחיל עם משפחה",
];

export default function ScreensaverPage() {
  const router = useRouter();
  const [quote, setQuote] = useState("");
  const [hebrewDate, setHebrewDate] = useState("");

  useEffect(() => {
    setQuote(HEBREW_QUOTES[Math.floor(Math.random() * HEBREW_QUOTES.length)]);

    const now = new Date();
    const formatter = new Intl.DateTimeFormat("he-IL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    setHebrewDate(formatter.format(now));

    // Rotate quotes every 15 seconds
    const quoteInterval = setInterval(() => {
      setQuote(HEBREW_QUOTES[Math.floor(Math.random() * HEBREW_QUOTES.length)]);
    }, 15000);

    return () => clearInterval(quoteInterval);
  }, []);

  const handleWake = () => {
    router.push("/");
  };

  return (
    <div
      className="fixed inset-0 z-[100] cursor-pointer select-none"
      onClick={handleWake}
      onTouchStart={handleWake}
    >
      {/* Background slideshow */}
      <PhotoSlideshow interval={5000} />

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex flex-col items-center gap-8"
        >
          {/* Analog clock */}
          <AnalogClock />

          {/* Date */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-white/70 text-lg font-light"
          >
            {hebrewDate}
          </motion.p>

          {/* Quote */}
          <motion.p
            key={quote}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white/60 text-center text-lg max-w-md font-light leading-relaxed"
          >
            &ldquo;{quote}&rdquo;
          </motion.p>
        </motion.div>

        {/* Tap to wake hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          className="absolute bottom-8 text-white/30 text-sm"
        >
          לחצו להתעורר
        </motion.p>
      </div>
    </div>
  );
}
