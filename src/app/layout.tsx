import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "optional",
});

export const metadata: Metadata = {
  title: "המרכז המשפחתי המאוחד",
  description: "מחברים את הבית יחד — Connecting the Home Together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${heebo.variable} font-sans antialiased`}
        style={{ backgroundColor: "#F7F5F0", color: "#2D2D2D" }}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
