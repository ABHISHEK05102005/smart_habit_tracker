"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Task = any;

export default function WeeklyView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks/weekly")
      .then(r => r.json())
      .then(d => {
        setTasks(d);
        setLoading(false);
      });
  }, []);

  const handleComplete = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "weekly", status: "COMPLETED" })
    });
    if (res.ok) window.location.reload();
  };

  if (loading) return <div className="animate-fade-in">Loading weekly tasks...</div>;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>This Week's Modules</h1>
        <p style={{ color: "var(--text-muted)" }}>Deep dive into your rotated modules for the week.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
        {tasks.map((task) => (
          <Card key={task.id} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{task.skill.name}</h3>
                <p style={{ color: "var(--primary)", fontSize: "0.9rem", marginTop: "0.25rem", fontWeight: 500 }}>
                  {task.module?.name}
                </p>
              </div>
              <Badge variant={task.status === "COMPLETED" ? "success" : "neutral"}>
                {task.status.replace("_", " ")}
              </Badge>
            </div>
            
            <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <p><strong>Learn:</strong> {task.module?.learn}</p>
              <p><strong>Implement:</strong> {task.module?.implement}</p>
            </div>

            {task.status !== "COMPLETED" && (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto", paddingTop: "1rem" }}>
                <Button size="sm" onClick={() => handleComplete(task.id)}>Mark Module Complete (+50 XP)</Button>
              </div>
            )}
          </Card>
        ))}
        
        {tasks.length === 0 && (
          <div style={{ color: "var(--text-muted)" }}>No weekly tasks active.</div>
        )}
      </div>
    </div>
  );
}
