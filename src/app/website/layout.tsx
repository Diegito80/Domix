import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "../globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "optional",
});

export const metadata: Metadata = {
  title: "Domix — The Unified Family Hub",
  description:
    "Domix brings your whole family together. Manage tasks, track rewards, coordinate calendars, share recipes, and stay connected — all in one beautiful home hub.",
};

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body
        className={`${heebo.variable} font-sans antialiased`}
        style={{ backgroundColor: "#F7F5F0", color: "#2D2D2D" }}
      >
        {children}
      </body>
    </html>
  );
}
