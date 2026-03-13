"use client";

import { useState, useEffect, useRef } from "react";

// ─── Inline SVG icons ────────────────────────────────────────────────────────

function Icon({
  d,
  size = 24,
  color = "currentColor",
}: {
  d: string;
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  check:
    "M20 6L9 17l-5-5",
  tasks:
    "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  calendar:
    "M8 2v4M16 2v4M3 10h18M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z",
  star:
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  chat:
    "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  kitchen:
    "M3 3h18v18H3zM3 9h18M9 9v12",
  paint:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z",
  tv:
    "M33 3h-5v18a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H3zM8 21v2M16 21v2",
  home:
    "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z",
  users:
    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  shield:
    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  phone:
    "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  zap:
    "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  heart:
    "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  gift:
    "M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  menu:
    "M3 12h18M3 6h18M3 18h18",
  close:
    "M18 6L6 18M6 6l12 12",
  arrow:
    "M5 12h14M12 5l7 7-7 7",
  sparkle:
    "M12 3v1M12 20v1M4.22 4.22l.7.7M19.07 19.07l.71.71M1 12h2M21 12h2M4.22 19.78l.7-.7M19.07 4.93l.71-.71",
};

// ─── Colour tokens ────────────────────────────────────────────────────────────

const C = {
  bg: "#F7F5F0",
  bgAlt: "#EFECE6",
  card: "#FFFFFF",
  border: "#E5E2DC",
  text: "#2D2D2D",
  muted: "#6B7280",
  warm: "#D4A574",
  green: "#7B9E6B",
  coral: "#E8943A",
  blue: "#4A6FA5",
  purple: "#C46B9E",
  yellow: "#F2C94C",
  members: {
    Roy: "#4A6FA5",
    Liron: "#7B9E6B",
    Tommy: "#E8943A",
    Mailee: "#C46B9E",
    Lian: "#F2C94C",
  },
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function Tag({
  label,
  color = C.coral,
}: {
  label: string;
  color?: string;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        background: color + "22",
        color,
        border: `1px solid ${color}44`,
        borderRadius: 999,
        padding: "3px 12px",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  color,
  badge,
}: {
  icon: string;
  title: string;
  desc: string;
  color: string;
  badge?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card,
        border: `1.5px solid ${hovered ? color : C.border}`,
        borderRadius: 20,
        padding: "28px 24px",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        boxShadow: hovered
          ? `0 8px 32px ${color}22`
          : "0 2px 8px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {badge && (
        <div style={{ position: "absolute", top: 16, right: 16 }}>
          <Tag label={badge} color={color} />
        </div>
      )}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Icon d={ICONS[icon as keyof typeof ICONS] ?? ICONS.zap} size={24} color={color} />
      </div>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: C.text,
          margin: "0 0 8px",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, margin: 0 }}>
        {desc}
      </p>
    </div>
  );
}

function Avatar({
  name,
  color,
  size = 52,
  initials,
}: {
  name: string;
  color: string;
  size?: number;
  initials?: string;
}) {
  return (
    <div
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}dd 0%, ${color} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.36,
        border: `3px solid ${color}55`,
        boxShadow: `0 4px 12px ${color}44`,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initials ?? name[0]}
    </div>
  );
}

function StepCard({
  num,
  title,
  desc,
  color,
}: {
  num: string;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 800,
          fontSize: 20,
          boxShadow: `0 4px 16px ${color}55`,
        }}
      >
        {num}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0 }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, margin: 0 }}>
        {desc}
      </p>
    </div>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        let start = 0;
        const step = Math.ceil(to / 60);
        const timer = setInterval(() => {
          start += step;
          if (start >= to) {
            setVal(to);
            clearInterval(timer);
          } else {
            setVal(start);
          }
        }, 16);
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Hero mock UI ─────────────────────────────────────────────────────────────

function HeroMockup() {
  const tasks = [
    { label: "Morning routine", done: true, member: "Tommy", color: C.members.Tommy, pts: 20 },
    { label: "Homework", done: true, member: "Mailee", color: C.members.Mailee, pts: 30 },
    { label: "Tidy room", done: false, member: "Lian", color: C.members.Lian, pts: 15 },
    { label: "Walk the dog", done: false, member: "Tommy", color: C.members.Tommy, pts: 25 },
  ];

  return (
    <div
      style={{
        background: C.card,
        borderRadius: 24,
        boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
        overflow: "hidden",
        width: "100%",
        maxWidth: 420,
        border: `1.5px solid ${C.border}`,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: C.bg,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
          Family Tasks
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {Object.entries(C.members).map(([name, color]) => (
            <Avatar key={name} name={name} color={color} size={28} />
          ))}
        </div>
      </div>

      {/* Task list */}
      <div style={{ padding: "12px 20px 20px" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: C.muted,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Today — 2 / 4 complete
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 12,
                background: t.done ? t.color + "0D" : C.bgAlt,
                border: `1px solid ${t.done ? t.color + "33" : C.border}`,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: t.done ? t.color : "transparent",
                  border: `2px solid ${t.done ? t.color : C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {t.done && (
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <span
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: t.done ? C.muted : C.text,
                  textDecoration: t.done ? "line-through" : "none",
                  fontWeight: 500,
                }}
              >
                {t.label}
              </span>
              <Avatar name={t.member} color={t.color} size={24} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.color,
                  background: t.color + "18",
                  borderRadius: 6,
                  padding: "2px 6px",
                }}
              >
                +{t.pts}
              </span>
            </div>
          ))}
        </div>

        {/* Points bar */}
        <div
          style={{
            marginTop: 16,
            padding: "12px 14px",
            borderRadius: 12,
            background: C.bgAlt,
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
              fontSize: 12,
              fontWeight: 600,
              color: C.muted,
            }}
          >
            <span>Family Points This Week</span>
            <span style={{ color: C.coral }}>385 pts</span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background: C.border,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "62%",
                borderRadius: 4,
                background: `linear-gradient(90deg, ${C.green}, ${C.coral})`,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 10,
            }}
          >
            {Object.entries(C.members).map(([name, color]) => (
              <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <Avatar name={name} color={color} size={22} />
                <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>
                  {Math.floor(Math.random() * 80 + 40)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reward mock ──────────────────────────────────────────────────────────────

function RewardMockup() {
  const rewards = [
    { emoji: "🍦", name: "Ice Cream", pts: 200, cat: "Small" },
    { emoji: "🎮", name: "1hr Gaming", pts: 500, cat: "Medium" },
    { emoji: "🎬", name: "Movie Night", pts: 750, cat: "Large" },
    { emoji: "🛍️", name: "50₪ Shopping", pts: 2000, cat: "Epic" },
  ];

  return (
    <div
      style={{
        background: C.card,
        borderRadius: 20,
        border: `1.5px solid ${C.border}`,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: `1px solid ${C.border}`,
          fontWeight: 800,
          fontSize: 15,
          color: C.text,
          background: C.bg,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Icon d={ICONS.gift} size={18} color={C.coral} />
        Reward Catalog
      </div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {rewards.map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 10px",
              borderRadius: 10,
              background: C.bgAlt,
              border: `1px solid ${C.border}`,
            }}
          >
            <span style={{ fontSize: 22 }}>{r.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.name}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{r.cat}</div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: C.coral,
                background: C.coral + "18",
                borderRadius: 8,
                padding: "3px 8px",
              }}
            >
              {r.pts} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chat mock ────────────────────────────────────────────────────────────────

function ChatMockup() {
  const msgs = [
    { from: "Roy", color: C.members.Roy, text: "Who wants pizza tonight? 🍕", time: "18:30", self: false },
    { from: "Tommy", color: C.members.Tommy, text: "MEEE!! 🙌", time: "18:31", self: true },
    { from: "Mailee", color: C.members.Mailee, text: "Yes please! Can we also get chocolate?", time: "18:32", self: false },
    { from: "Liron", color: C.members.Liron, text: "Ordering in 30 mins 🎉", time: "18:35", self: false },
  ];

  return (
    <div
      style={{
        background: C.card,
        borderRadius: 20,
        border: `1.5px solid ${C.border}`,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: `1px solid ${C.border}`,
          fontWeight: 800,
          fontSize: 15,
          color: C.text,
          background: C.bg,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Icon d={ICONS.chat} size={18} color={C.blue} />
        Family Chat
      </div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              flexDirection: m.self ? "row-reverse" : "row",
            }}
          >
            {!m.self && <Avatar name={m.from} color={m.color} size={26} />}
            <div
              style={{
                maxWidth: "70%",
                padding: "8px 11px",
                borderRadius: m.self ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background: m.self ? m.color + "22" : C.bgAlt,
                border: `1px solid ${m.self ? m.color + "44" : C.border}`,
              }}
            >
              {!m.self && (
                <div style={{ fontSize: 10, fontWeight: 700, color: m.color, marginBottom: 2 }}>
                  {m.from}
                </div>
              )}
              <div style={{ fontSize: 13, color: C.text }}>{m.text}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textAlign: m.self ? "left" : "right" }}>
                {m.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav({ onCta }: { onCta: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how" },
    { label: "Screens", href: "#screens" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "background 0.3s, box-shadow 0.3s",
        background: scrolled ? "rgba(247,245,240,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.06)" : "none",
      }}
    >
      {/* Logo */}
      <a
        href="#"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${C.coral}, ${C.warm})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 12px ${C.coral}44`,
          }}
        >
          <Icon d={ICONS.home} size={18} color="#fff" />
        </div>
        <span style={{ fontWeight: 900, fontSize: 20, color: C.text, letterSpacing: "-0.02em" }}>
          Domix
        </span>
      </a>

      {/* Desktop links */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
        className="desktop-nav"
      >
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: C.muted,
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
          >
            {l.label}
          </a>
        ))}
        <button
          onClick={onCta}
          style={{
            marginLeft: 8,
            padding: "8px 20px",
            borderRadius: 10,
            background: C.coral,
            color: "#fff",
            border: "none",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: `0 4px 14px ${C.coral}44`,
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = `0 6px 20px ${C.coral}55`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = `0 4px 14px ${C.coral}44`;
          }}
        >
          Get Started →
        </button>
      </div>

      {/* Mobile menu toggle */}
      <button
        onClick={() => setMenuOpen((v) => !v)}
        style={{
          display: "none",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: C.text,
          padding: 4,
        }}
        className="mobile-menu-btn"
      >
        <Icon d={menuOpen ? ICONS.close : ICONS.menu} size={24} />
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: 64,
            left: 0,
            right: 0,
            background: C.card,
            borderBottom: `1px solid ${C.border}`,
            padding: "12px 24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "10px 0",
                borderBottom: `1px solid ${C.border}`,
                fontSize: 15,
                fontWeight: 500,
                color: C.text,
                textDecoration: "none",
              }}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => { setMenuOpen(false); onCta(); }}
            style={{
              marginTop: 8,
              padding: "12px",
              borderRadius: 10,
              background: C.coral,
              color: "#fff",
              border: "none",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Get Started →
          </button>
        </div>
      )}
    </nav>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WebsitePage() {
  const ctaRef = useRef<HTMLDivElement>(null);

  const scrollToCta = () => {
    ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const features = [
    {
      icon: "tasks",
      title: "Smart Task Management",
      desc: "Assign chores, homework, and routines to each family member with custom point values. Track daily progress at a glance.",
      color: C.blue,
    },
    {
      icon: "calendar",
      title: "Family Calendar",
      desc: "Keep everyone aligned with shared events, school schedules, and activities. Works with Google Calendar.",
      color: C.green,
      badge: "Sync",
    },
    {
      icon: "star",
      title: "Rewards & Points",
      desc: "Kids earn points for completing tasks and redeem them for real rewards — from ice cream to gaming time.",
      color: C.coral,
    },
    {
      icon: "chat",
      title: "Family Chat",
      desc: "A private group chat for the whole family. Send messages, pin announcements, and react with emojis.",
      color: C.purple,
    },
    {
      icon: "kitchen",
      title: "Recipe Hub",
      desc: "Browse family recipes by category, save favourites, and follow guided step-by-step cooking mode.",
      color: C.warm,
    },
    {
      icon: "paint",
      title: "Creative Studio",
      desc: "A kid-friendly drawing canvas where children can create artwork and save it to their personal gallery.",
      color: C.members.Lian,
      badge: "Kids",
    },
  ];

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .hero-grid { flex-direction: column !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .screens-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .hero-mockup { display: none !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        a { color: inherit; }
      `}</style>

      <Nav onCta={scrollToCta} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "100px 24px 80px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div
          className="hero-grid"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 64,
          }}
        >
          {/* Left text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Tag label="Family Hub" color={C.coral} />

            <h1
              style={{
                fontSize: "clamp(38px, 6vw, 68px)",
                fontWeight: 900,
                lineHeight: 1.1,
                color: C.text,
                margin: "20px 0 24px",
                letterSpacing: "-0.03em",
              }}
            >
              Your whole family,{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${C.coral}, ${C.warm})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                connected.
              </span>
            </h1>

            <p
              style={{
                fontSize: 18,
                color: C.muted,
                lineHeight: 1.7,
                maxWidth: 480,
                margin: "0 0 36px",
              }}
            >
              Domix is the unified home hub for modern families — manage tasks,
              track rewards, share recipes, coordinate calendars, and stay
              connected, all in one beautiful app.
            </p>

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={scrollToCta}
                style={{
                  padding: "14px 32px",
                  borderRadius: 14,
                  background: C.coral,
                  color: "#fff",
                  border: "none",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: `0 6px 20px ${C.coral}44`,
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 10px 28px ${C.coral}55`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 6px 20px ${C.coral}44`;
                }}
              >
                Get Started Free →
              </button>
              <a
                href="#features"
                style={{
                  padding: "14px 28px",
                  borderRadius: 14,
                  background: "transparent",
                  color: C.text,
                  border: `1.5px solid ${C.border}`,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.text)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
              >
                See Features
              </a>
            </div>

            {/* Social proof avatars */}
            <div
              style={{
                marginTop: 40,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ display: "flex" }}>
                {Object.entries(C.members).map(([name, color], i) => (
                  <div
                    key={name}
                    style={{ marginLeft: i === 0 ? 0 : -10 }}
                  >
                    <Avatar
                      name={name}
                      color={color}
                      size={36}
                    />
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                  Built for real families
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  Tasks · Rewards · Chat · Recipes
                </div>
              </div>
            </div>
          </div>

          {/* Right mockup */}
          <div
            className="hero-mockup"
            style={{
              flexShrink: 0,
              width: 420,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section
        style={{
          background: C.card,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "48px 24px",
        }}
      >
        <div
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 24,
            maxWidth: 900,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          {[
            { val: 6, suffix: "+", label: "Feature Modules", color: C.blue },
            { val: 18, suffix: "+", label: "API Endpoints", color: C.green },
            { val: 10, suffix: "", label: "Reward Types", color: C.coral },
            { val: 5, suffix: "", label: "Family Members", color: C.purple },
          ].map((s, i) => (
            <div key={i}>
              <div
                style={{
                  fontSize: "clamp(32px, 4vw, 48px)",
                  fontWeight: 900,
                  color: s.color,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                <CountUp to={s.val} suffix={s.suffix} />
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: C.muted,
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section
        id="features"
        style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <Tag label="Everything you need" color={C.green} />
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              color: C.text,
              margin: "16px 0 12px",
              letterSpacing: "-0.02em",
            }}
          >
            One hub. Every family need.
          </h2>
          <p style={{ fontSize: 16, color: C.muted, maxWidth: 480, margin: "0 auto" }}>
            From morning routines to family movie night — Domix keeps your
            household running smoothly.
          </p>
        </div>

        <div
          className="features-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section
        id="how"
        style={{
          background: C.bgAlt,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "96px 24px",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <Tag label="How it works" color={C.blue} />
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 900,
                color: C.text,
                margin: "16px 0 12px",
                letterSpacing: "-0.02em",
              }}
            >
              Up and running in minutes
            </h2>
            <p style={{ fontSize: 16, color: C.muted }}>
              No complex setup. Just sign in and your family is ready to go.
            </p>
          </div>

          <div
            className="steps-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 48,
            }}
          >
            <StepCard
              num="1"
              color={C.blue}
              title="Create profiles"
              desc="Set up a profile for every family member — parents and kids. Each person gets their own personalised dashboard."
            />
            <StepCard
              num="2"
              color={C.green}
              title="Assign tasks & rewards"
              desc="Create tasks with point values and build a reward catalog. Kids complete tasks to earn points they can redeem."
            />
            <StepCard
              num="3"
              color={C.coral}
              title="Stay connected"
              desc="Use the family chat, shared calendar, and recipe hub to stay in sync — whether you're home or on the go."
            />
          </div>
        </div>
      </section>

      {/* ── Screens showcase ──────────────────────────────────────────── */}
      <section
        id="screens"
        style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <Tag label="App Screens" color={C.purple} />
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              color: C.text,
              margin: "16px 0 12px",
              letterSpacing: "-0.02em",
            }}
          >
            See Domix in action
          </h2>
          <p style={{ fontSize: 16, color: C.muted }}>
            A taste of what&apos;s inside.
          </p>
        </div>

        <div
          className="screens-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {/* Tasks card */}
          <div>
            <HeroMockup />
            <p
              style={{
                textAlign: "center",
                marginTop: 12,
                fontSize: 13,
                fontWeight: 600,
                color: C.muted,
              }}
            >
              Tasks &amp; Points
            </p>
          </div>

          {/* Rewards */}
          <div>
            <RewardMockup />
            <p
              style={{
                textAlign: "center",
                marginTop: 12,
                fontSize: 13,
                fontWeight: 600,
                color: C.muted,
              }}
            >
              Reward Catalog
            </p>
          </div>

          {/* Chat */}
          <div>
            <ChatMockup />
            <p
              style={{
                textAlign: "center",
                marginTop: 12,
                fontSize: 13,
                fontWeight: 600,
                color: C.muted,
              }}
            >
              Family Chat
            </p>
          </div>
        </div>
      </section>

      {/* ── Member profiles ───────────────────────────────────────────── */}
      <section
        style={{
          background: C.card,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <Tag label="Personalised" color={C.warm} />
          <h2
            style={{
              fontSize: "clamp(24px, 3.5vw, 40px)",
              fontWeight: 900,
              color: C.text,
              margin: "16px 0 12px",
              letterSpacing: "-0.02em",
            }}
          >
            Every family member gets their own space
          </h2>
          <p style={{ fontSize: 16, color: C.muted, marginBottom: 48, maxWidth: 520, margin: "0 auto 48px" }}>
            Parents see the big picture — full oversight, approval controls, and
            settings. Kids see their own tasks, rewards, and chat in a fun,
            age-appropriate UI.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            {[
              { name: "Roy", nameHe: "רועי", role: "Parent", color: C.members.Roy },
              { name: "Liron", nameHe: "לירון", role: "Parent", color: C.members.Liron },
              { name: "Tommy", nameHe: "טומי", role: "Child · 12", color: C.members.Tommy },
              { name: "Mailee", nameHe: "מיילי", role: "Child · 10", color: C.members.Mailee },
              { name: "Lian", nameHe: "ליאן", role: "Child · 7", color: C.members.Lian },
            ].map((m) => (
              <div
                key={m.name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${m.color}cc, ${m.color})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#fff",
                    border: `4px solid ${m.color}33`,
                    boxShadow: `0 8px 24px ${m.color}44`,
                  }}
                >
                  {m.name[0]}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>
                  {m.name}
                </div>
                <div style={{ fontSize: 12, color: m.color, fontWeight: 600 }}>
                  {m.nameHe}
                </div>
                <Tag label={m.role} color={m.color} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Highlights list ───────────────────────────────────────────── */}
      <section style={{ padding: "96px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
          className="features-grid"
        >
          {[
            { icon: "shield", text: "Private & local — your data stays on your device", color: C.blue },
            { icon: "zap", text: "Blazing fast with Next.js 15 and React 19", color: C.coral },
            { icon: "heart", text: "Bilingual — full Hebrew & English support (RTL)", color: C.purple },
            { icon: "sparkle", text: "Animated UI with Framer Motion spring physics", color: C.warm },
            { icon: "phone", text: "Touch-optimised for tablets and large screens", color: C.green },
            { icon: "users", text: "Role-based views — parents vs. kids dashboard", color: C.members.Tommy },
          ].map((h, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 20px",
                borderRadius: 14,
                background: C.card,
                border: `1.5px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: h.color + "18",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon d={ICONS[h.icon as keyof typeof ICONS] ?? ICONS.zap} size={20} color={h.color} />
              </div>
              <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>
                {h.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section
        ref={ctaRef}
        style={{
          margin: "0 24px 96px",
          borderRadius: 28,
          background: `linear-gradient(135deg, ${C.coral}ee 0%, ${C.warm} 50%, ${C.members.Lian}cc 100%)`,
          padding: "72px 48px",
          textAlign: "center",
          boxShadow: `0 24px 64px ${C.coral}33`,
          maxWidth: 900,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 900,
            color: "#fff",
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
            textShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          Ready to connect your family?
        </h2>
        <p
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.85)",
            marginBottom: 36,
            maxWidth: 460,
            margin: "0 auto 36px",
          }}
        >
          Start using Domix today. Set up takes less than 5 minutes.
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "16px 40px",
            borderRadius: 14,
            background: "#fff",
            color: C.coral,
            fontSize: 17,
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 14px 32px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
          }}
        >
          Open Domix →
        </a>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 16 }}>
          No account required. Runs locally on your device.
        </p>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${C.coral}, ${C.warm})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon d={ICONS.home} size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
            Domix
          </span>
        </div>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 8px" }}>
          The Unified Family Hub — מחברים את הבית יחד
        </p>
        <p style={{ fontSize: 12, color: C.border }}>
          Built with Next.js · React · Tailwind CSS · Framer Motion · Prisma
        </p>
      </footer>
    </>
  );
}
