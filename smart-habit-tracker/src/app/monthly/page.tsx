"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function MonthlyView() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => setSettings(d));
  }, []);

  if (!settings) return <div className="animate-fade-in">Loading progress...</div>;

  const xpNextRank = settings.rank === "E" ? 100 : settings.rank === "D" ? 300 : settings.rank === "C" ? 600 : settings.rank === "B" ? 1000 : settings.rank === "A" ? 1500 : 2100;
  const progress = Math.min((settings.totalXp / xpNextRank) * 100, 100);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Monthly Progress</h1>
        <p style={{ color: "var(--text-muted)" }}>Track your XP, rank, and consistency.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Hunter Rank</h2>
          
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "2.5rem",
              boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)"
            }}>
              {settings.rank}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span>{settings.totalXp} XP</span>
                <span style={{ color: "var(--text-muted)" }}>Next: {xpNextRank} XP</span>
              </div>
              <ProgressBar progress={progress} color="var(--secondary)" />
            </div>
          </div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Consistency</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ background: "rgba(245, 158, 11, 0.1)", padding: "1.5rem", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--warning)", marginBottom: "0.5rem" }}>
                {settings.currentStreak}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Current Streak</div>
            </div>
            
            <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "1.5rem", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--success)", marginBottom: "0.5rem" }}>
                {settings.bestStreak}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Best Streak</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
