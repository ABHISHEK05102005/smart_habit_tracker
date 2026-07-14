"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Library", href: "/library" },
  { label: "Weekly View", href: "/weekly" },
  { label: "Monthly Progress", href: "/monthly" },
  { label: "Timetable", href: "/timetable" },
  { label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: "260px",
      borderRight: "1px solid var(--border)",
      background: "var(--surface)",
      backdropFilter: "var(--glass-backdrop)",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem"
    }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ 
          fontSize: "1.5rem", 
          fontWeight: 700, 
          background: `linear-gradient(to right, var(--primary), var(--secondary))`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Smart Habit Tracker
        </h1>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-sm)",
                background: isActive ? "var(--surface-hover)" : "transparent",
                color: isActive ? "#fff" : "var(--text-muted)",
                fontWeight: isActive ? 600 : 500,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "var(--surface-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div style={{
        marginTop: "auto",
        padding: "1rem",
        background: "rgba(99, 102, 241, 0.1)",
        borderRadius: "var(--radius-md)",
        border: "1px solid rgba(99, 102, 241, 0.2)"
      }}>
        <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Current Streak</div>
        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--warning)" }}>🔥 0 days</div>
      </div>
    </aside>
  );
}
