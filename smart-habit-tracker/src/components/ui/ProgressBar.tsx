import React from "react";

export function ProgressBar({ progress, color = "var(--primary)" }: { progress: number; color?: string }) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div style={{
      width: "100%",
      height: "8px",
      background: "var(--surface-hover)",
      borderRadius: "var(--radius-full)",
      overflow: "hidden"
    }}>
      <div style={{
        width: `${safeProgress}%`,
        height: "100%",
        background: color,
        borderRadius: "var(--radius-full)",
        transition: "width 0.5s ease-in-out"
      }} />
    </div>
  );
}
