import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className = "", style, children, ...props }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    borderRadius: "var(--radius-md)",
    border: "none",
    fontWeight: 600,
    transition: "all 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: "0.5rem 1rem", fontSize: "0.875rem" },
    md: { padding: "0.75rem 1.5rem", fontSize: "1rem" },
    lg: { padding: "1rem 2rem", fontSize: "1.125rem" },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--primary)",
      color: "#fff",
      boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.39)",
    },
    secondary: {
      background: "var(--surface)",
      color: "var(--text-main)",
      border: "1px solid var(--border)",
    },
    danger: {
      background: "var(--danger)",
      color: "#fff",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-muted)",
    }
  };

  const combinedStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button style={combinedStyle} className={className} {...props}>
      {children}
    </button>
  );
}
