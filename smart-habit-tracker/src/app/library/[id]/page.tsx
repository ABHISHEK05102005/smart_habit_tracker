"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Subtopic = {
  id: string;
  name: string;
  duration: string;
  learn: string;
  implement: string;
  miniProject: string;
};

type Module = {
  id: string;
  name: string;
  duration: string;
  learn: string;
  implement: string;
  miniProject: string;
  subtopics: Subtopic[];
};

type Skill = {
  id: string;
  name: string;
  modules: Module[];
};

export default function SkillDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addingStatus, setAddingStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    fetch(`/api/skills/${id}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load skill");
        return data;
      })
      .then(d => {
        setSkill(d);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  const handleAddToWeek = async (moduleId: string) => {
    setAddingStatus(prev => ({ ...prev, [moduleId]: "Adding..." }));
    try {
      const res = await fetch("/api/tasks/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: id, moduleId })
      });
      if (!res.ok) throw new Error("Failed to assign");
      setAddingStatus(prev => ({ ...prev, [moduleId]: "Added!" }));
      setTimeout(() => setAddingStatus(prev => ({ ...prev, [moduleId]: "" })), 2000);
    } catch (e) {
      setAddingStatus(prev => ({ ...prev, [moduleId]: "Error" }));
      setTimeout(() => setAddingStatus(prev => ({ ...prev, [moduleId]: "" })), 2000);
    }
  };

  const handleAddToToday = async (subtopicId: string) => {
    setAddingStatus(prev => ({ ...prev, [subtopicId]: "Adding..." }));
    try {
      const res = await fetch("/api/tasks/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: id, subtopicId })
      });
      if (!res.ok) throw new Error("Failed to assign");
      setAddingStatus(prev => ({ ...prev, [subtopicId]: "Added!" }));
      setTimeout(() => setAddingStatus(prev => ({ ...prev, [subtopicId]: "" })), 2000);
    } catch (e) {
      setAddingStatus(prev => ({ ...prev, [subtopicId]: "Error" }));
      setTimeout(() => setAddingStatus(prev => ({ ...prev, [subtopicId]: "" })), 2000);
    }
  };

  if (loading) return <div className="animate-fade-in">Loading skill details...</div>;
  if (error || !skill) return (
    <div className="animate-fade-in" style={{ padding: "2rem", color: "#ef4444" }}>
      <h2>Error loading skill</h2>
      <p>{error}</p>
      <Button onClick={() => router.push("/library")} variant="secondary" style={{ marginTop: "1rem" }}>Go Back</Button>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header>
        <Button variant="ghost" onClick={() => router.push("/library")} style={{ marginBottom: "1rem", padding: "0 0.5rem" }}>
          &larr; Back to Library
        </Button>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>{skill.name}</h1>
        <p style={{ color: "var(--text-muted)" }}>This curriculum is structured into 3-4 hour modules, broken down into 1-hour actionable subtopics.</p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {skill.modules?.map((mod, mIndex) => (
          <Card key={mod.id} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", borderLeft: "4px solid var(--primary)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 600, flex: 1 }}>Module {mIndex + 1}: {mod.name}</h2>
                <Badge variant="neutral">{mod.duration}</Badge>
                <Button size="sm" variant="secondary" onClick={() => handleAddToWeek(mod.id)} disabled={!!addingStatus[mod.id]}>
                  {addingStatus[mod.id] || "+ Assign to this Week"}
                </Button>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                  <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Learn</h4>
                  <p style={{ fontSize: "0.95rem" }}>{mod.learn}</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                  <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Implement</h4>
                  <p style={{ fontSize: "0.95rem" }}>{mod.implement}</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                  <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Mini Project</h4>
                  <p style={{ fontSize: "0.95rem" }}>{mod.miniProject}</p>
                </div>
              </div>
            </div>

            <div style={{ marginLeft: "1rem", paddingLeft: "1rem", borderLeft: "2px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-muted)" }}>Subtopics</h3>
              {mod.subtopics?.map((sub, sIndex) => (
                <div key={sub.id} style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 500, flex: 1 }}>{mIndex + 1}.{sIndex + 1} {sub.name}</h4>
                    <Badge variant="warning">{sub.duration}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => handleAddToToday(sub.id)} disabled={!!addingStatus[sub.id]} style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem", height: "auto" }}>
                      {addingStatus[sub.id] || "+ Add to Today"}
                    </Button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "0.75rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>Learn</span>
                      <span style={{ fontSize: "0.9rem" }}>{sub.learn}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>Implement</span>
                      <span style={{ fontSize: "0.9rem" }}>{sub.implement}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>Mini Project</span>
                      <span style={{ fontSize: "0.9rem" }}>{sub.miniProject}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
