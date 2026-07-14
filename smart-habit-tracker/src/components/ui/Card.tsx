import React from "react";

export function Card({ children, className = "", style, onClick }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div 
      className={`glass-panel ${className}`} 
      style={{ padding: "1.5rem", cursor: onClick ? "pointer" : "default", ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
