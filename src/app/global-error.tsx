"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ background: "#F7F5F0", color: "#2D2D2D", fontFamily: "system-ui, sans-serif", margin: 0, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>משהו השתבש</h1>
        <p style={{ color: "#6B7280", marginBottom: 24, textAlign: "center" }}>
          {error.message || "נסה לרענן את הדף"}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{ padding: "12px 24px", borderRadius: 12, fontWeight: 500, backgroundColor: "#D4A574", color: "white", border: "none", cursor: "pointer" }}
        >
          נסה שוב
        </button>
      </body>
    </html>
  );
}
