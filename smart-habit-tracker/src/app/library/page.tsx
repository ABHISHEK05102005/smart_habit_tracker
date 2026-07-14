"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Skill = any;

export default function Library() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/skills")
      .then(r => r.json())
      .then(d => {
        setSkills(d);
        setLoading(false);
      });
  }, []);

  const handleGenerateSkill = async () => {
    if (!newSkillName.trim()) return;
    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/ai/expand-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName: newSkillName })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate skill");
      
      // Navigate to the newly created skill details page
      router.push(`/library/${data.skillId}`);
    } catch (err: any) {
      setError(err.message);
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="animate-fade-in">Loading library...</div>;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem", position: "relative" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Skill Library</h1>
          <p style={{ color: "var(--text-muted)" }}>Explore pre-defined skills and expand them using AI.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Expand Custom Skill</Button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {skills.map(s => (
          <Card key={s.id}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>{s.name}</h2>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
              {s.modules?.length || 0} Modules available
            </div>
            <Link href={`/library/${s.id}`} style={{ width: "100%", display: "block" }}>
              <Button size="sm" variant="secondary" style={{ width: "100%" }}>View Details</Button>
            </Link>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
        }}>
          <div style={{
            background: "var(--background)", padding: "2rem", borderRadius: "var(--radius-lg)",
            width: "100%", maxWidth: "400px", border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Expand Custom Skill</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              Enter a new skill you want to learn. Our AI will break it down into a structured 3-4 hour module curriculum.
            </p>
            
            <input 
              type="text" 
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. Next.js App Router, Japanese, Piano..."
              style={{
                width: "100%", padding: "0.75rem", borderRadius: "var(--radius-sm)",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--foreground)", marginBottom: "1rem"
              }}
              disabled={isGenerating}
            />
            
            {error && <div style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}
            
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isGenerating}>Cancel</Button>
              <Button onClick={handleGenerateSkill} disabled={isGenerating || !newSkillName.trim()}>
                {isGenerating ? "Generating..." : "Generate Curriculum"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
