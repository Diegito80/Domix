"use client";

import { motion } from "framer-motion";

interface MediaTile {
  id: string;
  name: string;
  emoji: string;
  color: string;
  url?: string;
  route?: string;
  ageMin?: number;
}

const MEDIA_TILES: MediaTile[] = [
  { id: "netflix", name: "נטפליקס", emoji: "📺", color: "#E50914", url: "https://netflix.com" },
  { id: "youtube", name: "יוטיוב", emoji: "▶️", color: "#FF0000", url: "https://youtube.com" },
  { id: "spotify", name: "ספוטיפיי", emoji: "🎵", color: "#1DB954", url: "https://open.spotify.com" },
  { id: "youtube-kids", name: "יוטיוב קידס", emoji: "🧸", color: "#FF4081", url: "https://youtubekids.com", ageMin: 0 },
  { id: "drawing", name: "ציור", emoji: "🎨", color: "#9C27B0", route: "/creative" },
  { id: "games", name: "משחקים", emoji: "🎮", color: "#4CAF50", url: "https://poki.com" },
  { id: "reading", name: "קריאה", emoji: "📖", color: "#795548", url: "https://www.sifria.co.il" },
  { id: "music", name: "מוזיקה", emoji: "🎶", color: "#FF9800", url: "https://music.youtube.com" },
];

// Lian-safe tiles (age 7)
const LIAN_TILES = ["youtube-kids", "drawing", "games", "reading"];

interface MediaLauncherProps {
  memberAge?: number;
  memberName?: string;
  onNavigate: (route: string) => void;
}

export function MediaLauncher({ memberAge, memberName, onNavigate }: MediaLauncherProps) {
  const isYoung = memberAge !== undefined && memberAge <= 8;
  const tiles = isYoung ? MEDIA_TILES.filter((t) => LIAN_TILES.includes(t.id)) : MEDIA_TILES;

  const handleClick = (tile: MediaTile) => {
    if (tile.route) {
      onNavigate(tile.route);
    } else if (tile.url) {
      window.open(tile.url, "_blank");
    }
  };

  return (
    <div>
      {isYoung && memberName && (
        <p className="text-center text-text-secondary mb-6">
          תוכן מותאם עבור {memberName} 💛
        </p>
      )}
      <div className={`grid gap-4 ${isYoung ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
        {tiles.map((tile, i) => (
          <motion.button
            key={tile.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(tile)}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 transition-shadow hover:shadow-lg"
            style={{
              borderColor: tile.color + "40",
              backgroundColor: tile.color + "08",
            }}
          >
            <span className={`${isYoung ? "text-6xl" : "text-4xl"}`}>{tile.emoji}</span>
            <span className={`font-bold ${isYoung ? "text-lg" : "text-sm"}`}>{tile.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
