"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Task = any; // We'll simplify types for now in client

export default function Dashboard() {
  const [data, setData] = useState<{ tasks: Task[], classTasks: Task[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks/daily")
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const handleComplete = async (type: "daily" | "college", id: string) => {
    const res = await fetch(`/api/tasks/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, status: "COMPLETED" })
    });
    if (res.ok) {
      // Reload for now
      window.location.reload();
    }
  };

  if (loading) return <div className="animate-fade-in">Loading tasks...</div>;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Today's Tasks</h1>
        <p style={{ color: "var(--text-muted)" }}>Focus on your principle skills and college classes.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Principle Skills */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--primary)" }}>Principle Skills</h2>
          {data?.tasks.length === 0 && <p style={{ color: "var(--text-muted)" }}>No tasks today. Have you set your principle skills?</p>}
          
          {data?.tasks.map((task) => (
            <Card key={task.id} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{task.skill.name}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                    {task.subtopic?.name}
                  </p>
                </div>
                <Badge variant={task.status === "COMPLETED" ? "success" : "warning"}>
                  {task.status.replace("_", " ")}
                </Badge>
              </div>
              
              {task.status !== "COMPLETED" && (
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                  <Button size="sm" onClick={() => handleComplete("daily", task.id)}>Mark Complete (+10 XP)</Button>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* College Classes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--secondary)" }}>College Classes</h2>
          {data?.classTasks.length === 0 && <p style={{ color: "var(--text-muted)" }}>No classes scheduled for today.</p>}
          
          {data?.classTasks.map((ct) => (
            <Card key={ct.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  background: "rgba(236, 72, 153, 0.1)",
                  color: "var(--secondary)",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600
                }}>
                  {ct.rule.timeIST}
                </div>
                <div>
                  <h3 style={{ fontWeight: 600 }}>{ct.rule.subjectCode}</h3>
                  {ct.rule.subjectName && <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{ct.rule.subjectName}</p>}
                </div>
              </div>
              
              {ct.status !== "COMPLETED" ? (
                <Button size="sm" variant="ghost" onClick={() => handleComplete("college", ct.id)}>Done</Button>
              ) : (
                <Badge variant="success">ATTENDED</Badge>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
