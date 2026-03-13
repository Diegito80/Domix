"use client";

import { ProfileSelector } from "@/components/dashboard/ProfileSelector";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7F5F0",
        color: "#2D2D2D",
      }}
    >
      <ProfileSelector />
    </div>
  );
}
