"use client";

import { useEffect, useState } from "react";
import { formatTimeIST } from "@/lib/timezone";

export function TopBar() {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      // Just getting current IST time for topbar
      const now = new Date();
      const options = { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit', hour12: true } as const;
      setTimeStr(new Intl.DateTimeFormat('en-US', options).format(now));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      height: "70px",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 2rem",
      background: "var(--surface)",
      backdropFilter: "var(--glass-backdrop)"
    }}>
      <div style={{ color: "var(--text-muted)" }}>
        Welcome back, <span style={{ color: "#fff", fontWeight: 600 }}>Student</span>
      </div>
      
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{
          background: "var(--surface-hover)",
          padding: "0.5rem 1rem",
          borderRadius: "var(--radius-full)",
          fontSize: "0.875rem",
          color: "var(--primary)"
        }}>
          IST Time: {timeStr || "..."}
        </div>
        
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--primary), var(--secondary))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "1.2rem",
          boxShadow: "0 0 10px rgba(236, 72, 153, 0.3)"
        }}>
          E
        </div>
      </div>
    </header>
  );
}
