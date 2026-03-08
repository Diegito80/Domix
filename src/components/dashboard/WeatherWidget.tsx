"use client";

import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  description: string;
}

const CONDITION_ICONS: Record<string, React.ReactNode> = {
  clear: <Sun className="w-5 h-5 text-yellow-500" />,
  clouds: <Cloud className="w-5 h-5 text-gray-400" />,
  rain: <CloudRain className="w-5 h-5 text-blue-400" />,
  snow: <CloudSnow className="w-5 h-5 text-blue-200" />,
  thunderstorm: <CloudLightning className="w-5 h-5 text-yellow-600" />,
  wind: <Wind className="w-5 h-5 text-gray-500" />,
};

// Simulated weather for Ramat HaSharon based on season
function getSimulatedWeather(): WeatherData {
  const month = new Date().getMonth();
  // Summer (Jun-Sep)
  if (month >= 5 && month <= 8) {
    return { temp: 28 + Math.floor(Math.random() * 6), condition: "clear", description: "בהיר" };
  }
  // Winter (Dec-Feb)
  if (month >= 11 || month <= 1) {
    const conditions = [
      { temp: 14, condition: "rain", description: "גשום" },
      { temp: 16, condition: "clouds", description: "מעונן" },
      { temp: 15, condition: "clouds", description: "מעונן חלקית" },
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }
  // Spring/Fall
  const conditions = [
    { temp: 22, condition: "clear", description: "בהיר" },
    { temp: 20, condition: "clouds", description: "מעונן חלקית" },
    { temp: 24, condition: "clear", description: "נעים" },
  ];
  return conditions[Math.floor(Math.random() * conditions.length)];
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    setWeather(getSimulatedWeather());
    // Refresh every 30 minutes
    const interval = setInterval(() => {
      setWeather(getSimulatedWeather());
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!weather) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      {CONDITION_ICONS[weather.condition] || <Sun className="w-5 h-5" />}
      <span className="font-semibold">{weather.temp}°</span>
      <span className="text-text-secondary hidden sm:inline">{weather.description}</span>
    </div>
  );
}
