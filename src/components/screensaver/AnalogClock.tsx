"use client";

import { useState, useEffect } from "react";

export function AnalogClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return (
    <div className="relative w-48 h-48">
      {/* Clock face */}
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
        {/* Background */}
        <circle cx="100" cy="100" r="95" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />

        {/* Hour marks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 100 + 78 * Math.sin(angle);
          const y1 = 100 - 78 * Math.cos(angle);
          const x2 = 100 + 88 * Math.sin(angle);
          const y2 = 100 - 88 * Math.cos(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.7)"
              strokeWidth={i % 3 === 0 ? 3 : 1.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Hour hand */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="45"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${hourDeg} 100 100)`}
        />

        {/* Minute hand */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="28"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${minuteDeg} 100 100)`}
        />

        {/* Second hand */}
        <line
          x1="100"
          y1="110"
          x2="100"
          y2="25"
          stroke="#D4A574"
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${secondDeg} 100 100)`}
        />

        {/* Center dot */}
        <circle cx="100" cy="100" r="4" fill="#D4A574" />
      </svg>

      {/* Digital time below */}
      <div className="text-center mt-3">
        <span className="text-white/80 text-lg font-light tracking-widest font-mono">
          {time.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
