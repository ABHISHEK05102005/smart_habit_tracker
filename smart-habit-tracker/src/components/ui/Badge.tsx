import React from "react";

export function Badge({ children, variant = "neutral", style }: { children: React.ReactNode; variant?: "success" | "warning" | "danger" | "primary" | "neutral"; style?: React.CSSProperties }) {
  const colors = {
    success: { bg: "rgba(16, 185, 129, 0.1)", color: "var(--success)", border: "rgba(16, 185, 129, 0.2)" },
    warning: { bg: "rgba(245, 158, 11, 0.1)", color: "var(--warning)", border: "rgba(245, 158, 11, 0.2)" },
    danger: { bg: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", border: "rgba(239, 68, 68, 0.2)" },
    primary: { bg: "rgba(99, 102, 241, 0.1)", color: "var(--primary)", border: "rgba(99, 102, 241, 0.2)" },
    neutral: { bg: "var(--surface)", color: "var(--text-muted)", border: "var(--border)" },
  };

  const current = colors[variant];

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "0.25rem 0.75rem",
      borderRadius: "var(--radius-full)",
      fontSize: "0.75rem",
      fontWeight: 600,
      background: current.bg,
      color: current.color,
      border: `1px solid ${current.border}`,
      ...style
    }}>
      {children}
    </span>
  );
}
