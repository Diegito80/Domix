"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface Drawing {
  id: string;
  title?: string | null;
  dataUrl: string;
  createdAt: string;
  member: {
    id: string;
    name: string;
    nameHe: string;
    color: string;
  };
}

interface GalleryProps {
  drawings: Drawing[];
  onDelete: (id: string) => void;
  isOwner: (memberId: string) => boolean;
}

export function Gallery({ drawings, onDelete, isOwner }: GalleryProps) {
  if (drawings.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-5xl block mb-3">🎨</span>
        <p className="text-text-secondary">עדיין אין ציורים — בואו ניצור!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {drawings.map((drawing, i) => (
        <motion.div
          key={drawing.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          className="bg-card rounded-2xl border border-border overflow-hidden group"
        >
          <div className="aspect-square bg-white relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={drawing.dataUrl}
              alt={drawing.title || "ציור"}
              className="w-full h-full object-contain"
            />
            {isOwner(drawing.member.id) && (
              <button
                onClick={() => onDelete(drawing.id)}
                className="absolute top-2 left-2 p-2 rounded-xl bg-white/80 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="p-3">
            {drawing.title && (
              <p className="font-semibold text-sm truncate mb-1">{drawing.title}</p>
            )}
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                style={{ backgroundColor: drawing.member.color }}
              >
                {drawing.member.name.charAt(0)}
              </div>
              <span className="text-xs text-text-secondary">
                {drawing.member.nameHe} • {formatRelativeTime(new Date(drawing.createdAt))}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
