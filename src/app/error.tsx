"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-background px-6"
      style={{ background: "#F7F5F0", color: "#2D2D2D" }}
    >
      <h1 className="text-2xl font-bold mb-2">משהו השתבש</h1>
      <p className="text-text-secondary mb-6 text-center max-w-md">
        {error.message || "נסה לרענן את הדף"}
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-6 py-3 rounded-xl font-medium text-white"
        style={{ backgroundColor: "#D4A574" }}
      >
        נסה שוב
      </button>
    </div>
  );
}
