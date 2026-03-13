"use client";

import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Moon } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  description: string;
  rainChance: number;
  isNight: boolean;
}

// Open-Meteo WMO weather interpretation codes → condition
function interpretWeatherCode(code: number, isNight: boolean): { condition: string; description: string } {
  if (code === 0) return { condition: isNight ? "clear-night" : "clear", description: isNight ? "לילה בהיר" : "בהיר" };
  if (code <= 2) return { condition: "partly-cloudy", description: "מעונן חלקית" };
  if (code === 3) return { condition: "clouds", description: "מעונן" };
  if (code <= 49) return { condition: "fog", description: "ערפל" };
  if (code <= 57) return { condition: "rain", description: "גשם קל" };
  if (code <= 65) return { condition: "rain", description: "גשם" };
  if (code <= 77) return { condition: "snow", description: "שלג" };
  if (code <= 82) return { condition: "rain", description: "מטר" };
  if (code <= 99) return { condition: "thunderstorm", description: "סופת רעמים" };
  return { condition: "clouds", description: "מעונן" };
}

function WeatherIcon({ condition, className }: { condition: string; className?: string }) {
  const cls = className || "w-5 h-5";
  switch (condition) {
    case "clear": return <Sun className={`${cls} text-yellow-500`} />;
    case "clear-night": return <Moon className={`${cls} text-blue-200`} />;
    case "partly-cloudy": return <Cloud className={`${cls} text-gray-300`} />;
    case "clouds": return <Cloud className={`${cls} text-gray-400`} />;
    case "rain": return <CloudRain className={`${cls} text-blue-400`} />;
    case "snow": return <CloudSnow className={`${cls} text-blue-200`} />;
    case "thunderstorm": return <CloudLightning className={`${cls} text-yellow-600`} />;
    case "fog": return <Wind className={`${cls} text-gray-400`} />;
    default: return <Sun className={`${cls} text-yellow-500`} />;
  }
}

// Ramat HaSharon coordinates
const LAT = 32.15;
const LON = 34.84;

async function fetchWeather(): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,precipitation_probability,weather_code,is_day&timezone=Asia%2FJerusalem`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("weather fetch failed");
  const data = await res.json();
  const { temperature_2m, precipitation_probability, weather_code, is_day } = data.current;
  const isNight = is_day === 0;
  const { condition, description } = interpretWeatherCode(weather_code, isNight);
  return {
    temp: Math.round(temperature_2m),
    condition,
    description,
    rainChance: precipitation_probability ?? 0,
    isNight,
  };
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetchWeather()
      .then(setWeather)
      .catch(() => {
        // Fallback: seasonal simulation
        const month = new Date().getMonth();
        const isNight = new Date().getHours() >= 20 || new Date().getHours() < 6;
        if (month >= 5 && month <= 8) {
          setWeather({ temp: 31, condition: isNight ? "clear-night" : "clear", description: "בהיר", rainChance: 0, isNight });
        } else if (month >= 11 || month <= 1) {
          setWeather({ temp: 15, condition: "clouds", description: "מעונן", rainChance: 40, isNight });
        } else {
          setWeather({ temp: 22, condition: isNight ? "clear-night" : "clear", description: "נעים", rainChance: 10, isNight });
        }
      });

    // Refresh every 30 minutes
    const interval = setInterval(() => {
      fetchWeather().then(setWeather).catch(() => {});
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!weather) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <WeatherIcon condition={weather.condition} />
      <span className="font-semibold">{weather.temp}°</span>
      <span className="text-text-secondary hidden sm:inline">{weather.description}</span>
      {weather.rainChance > 20 && (
        <span className="text-blue-400 hidden sm:flex items-center gap-0.5">
          <Droplets className="w-3.5 h-3.5" />
          {weather.rainChance}%
        </span>
      )}
    </div>
  );
}
