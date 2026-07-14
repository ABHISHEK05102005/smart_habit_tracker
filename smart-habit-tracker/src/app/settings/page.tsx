"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Settings() {
  const [skills, setSkills] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/skills").then(r => r.json()),
      fetch("/api/settings").then(r => r.json())
    ]).then(([skillsData, settingsData]) => {
      setSkills(skillsData);
      setSettings(settingsData);
    });
  }, []);

  const handleTogglePrinciple = (skillId: string) => {
    if (!settings) return;
    
    let nextSkills = [...settings.principleSkills];
    if (nextSkills.includes(skillId)) {
      nextSkills = nextSkills.filter(id => id !== skillId);
    } else {
      if (nextSkills.length >= 5) {
        alert("You can only select up to 5 principle skills at a time.");
        return;
      }
      nextSkills.push(skillId);
    }
    
    setSettings({ ...settings, principleSkills: nextSkills });
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ principleSkills: settings.principleSkills })
    });
    setSaving(false);
    alert("Settings saved successfully!");
  };

  if (!settings || skills.length === 0) return <div className="animate-fade-in">Loading settings...</div>;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "800px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Settings</h1>
          <p style={{ color: "var(--text-muted)" }}>Configure your active principle skills.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </header>

      <Card style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Principle Skills ({settings.principleSkills.length}/5)</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Select the skills you want to actively rotate through daily and weekly tasks.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {skills.map(skill => {
            const isActive = settings.principleSkills.includes(skill.id);
            return (
              <div 
                key={skill.id}
                onClick={() => handleTogglePrinciple(skill.id)}
                style={{
                  padding: "1rem",
                  background: isActive ? "rgba(99, 102, 241, 0.15)" : "var(--surface)",
                  border: `1px solid ${isActive ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s ease"
                }}
              >
                <span style={{ fontWeight: isActive ? 600 : 400 }}>{skill.name}</span>
                {isActive && <span style={{ color: "var(--primary)" }}>✓ Active</span>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
