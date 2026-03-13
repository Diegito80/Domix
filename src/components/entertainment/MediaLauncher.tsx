"use client";

import { motion } from "framer-motion";

interface MediaTile {
  id: string;
  name: string;
  emoji: string;
  color: string;
  url?: string;
  route?: string;
  logoUrl?: string;
}

const MEDIA_TILES: MediaTile[] = [
  {
    id: "netflix",
    name: "נטפליקס",
    emoji: "📺",
    color: "#E50914",
    url: "https://netflix.com",
    logoUrl: "https://www.google.com/s2/favicons?sz=128&domain=netflix.com",
  },
  {
    id: "disney",
    name: "דיסני+",
    emoji: "✨",
    color: "#113CCF",
    url: "https://disneyplus.com",
    logoUrl: "https://www.google.com/s2/favicons?sz=128&domain=disneyplus.com",
  },
  {
    id: "youtube",
    name: "יוטיוב",
    emoji: "▶️",
    color: "#FF0000",
    url: "https://youtube.com",
    logoUrl: "https://www.google.com/s2/favicons?sz=128&domain=youtube.com",
  },
  {
    id: "spotify",
    name: "ספוטיפיי",
    emoji: "🎵",
    color: "#1DB954",
    url: "https://open.spotify.com",
    logoUrl: "https://www.google.com/s2/favicons?sz=128&domain=spotify.com",
  },
  { id: "drawing", name: "ציור", emoji: "🎨", color: "#9C27B0", route: "/creative" },
  { id: "games", name: "משחקים", emoji: "🎮", color: "#4CAF50", url: "https://poki.com" },
];

// Lian-safe tiles (age 7)
const LIAN_TILES = ["disney", "drawing", "games", "netflix"];

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
            {tile.logoUrl ? (
              <img
                src={tile.logoUrl}
                alt={tile.name}
                className={`${isYoung ? "w-16 h-16" : "w-10 h-10"} object-contain rounded-lg`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <span className={`${isYoung ? "text-6xl" : "text-4xl"} ${tile.logoUrl ? "hidden" : ""}`}>{tile.emoji}</span>
            <span className={`font-bold ${isYoung ? "text-lg" : "text-sm"}`}>{tile.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
