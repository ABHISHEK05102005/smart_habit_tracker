"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Skill = any;

export default function Library() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/skills")
      .then(r => r.json())
      .then(d => {
        setSkills(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="animate-fade-in">Loading library...</div>;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Skill Library</h1>
          <p style={{ color: "var(--text-muted)" }}>Explore pre-defined skills and expand them using AI.</p>
        </div>
        <Button>+ Expand Custom Skill</Button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {skills.map(s => (
          <Card key={s.id}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>{s.name}</h2>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              {s.modules?.length || 0} Modules available
            </div>
            <Button size="sm" variant="secondary" style={{ width: "100%" }}>View Details</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
