"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantStyles = {
  primary: "bg-accent-warm text-white hover:bg-accent-warm/90 active:bg-accent-warm/80",
  secondary: "bg-card text-foreground border border-border hover:bg-background active:bg-border/50",
  ghost: "bg-transparent text-foreground hover:bg-border/30 active:bg-border/50",
  danger: "bg-error text-white hover:bg-error/90 active:bg-error/80",
};

const sizeStyles = {
  sm: "px-3 py-2 text-sm min-h-[36px]",
  md: "px-5 py-3 text-base min-h-[48px]",
  lg: "px-7 py-4 text-lg min-h-[56px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] inline-flex items-center justify-center gap-2",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
