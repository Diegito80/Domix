"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  nameHe: string;
  color: string;
  size?: "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  active?: boolean;
  onClick?: () => void;
}

const sizeStyles = {
  sm: "w-10 h-10 text-lg",
  md: "w-16 h-16 text-2xl",
  lg: "w-24 h-24 text-4xl",
  xl: "w-[120px] h-[120px] text-5xl",
};

const borderSizes = {
  sm: "border-2",
  md: "border-[3px]",
  lg: "border-4",
  xl: "border-4",
};

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function Avatar({
  name,
  nameHe,
  color,
  size = "md",
  showName = false,
  active = false,
  onClick,
}: AvatarProps) {
  return (
    <div className="flex flex-col items-center gap-2" onClick={onClick}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold text-white transition-all duration-300",
          sizeStyles[size],
          borderSizes[size],
          active && "ring-4 ring-offset-2 ring-offset-background scale-110",
          onClick && "cursor-pointer active:scale-95"
        )}
        style={{
          backgroundColor: color,
          borderColor: color,
          ...(active ? { ringColor: color } : {}),
        }}
      >
        {getInitial(name)}
      </div>
      {showName && (
        <span className={cn(
          "font-semibold text-foreground",
          size === "xl" ? "text-lg" : "text-sm"
        )}>
          {nameHe}
        </span>
      )}
    </div>
  );
}
