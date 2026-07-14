"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Rule = any;

const DAYS_MAP: Record<string, string> = {
  "0": "Sun", "1": "Mon", "2": "Tue", "3": "Wed", "4": "Thu", "5": "Fri", "6": "Sat"
};

export default function Timetable() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);

  const fetchRules = async () => {
    const res = await fetch("/api/college-classes");
    const data = await res.json();
    setRules(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setParsing(true);
    try {
      const res = await fetch("/api/ai/parse-timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText })
      });
      if (res.ok) {
        setRawText("");
        await fetchRules();
      } else {
        alert("Failed to parse timetable.");
      }
    } catch (e) {
      console.error(e);
      alert("Error parsing timetable.");
    }
    setParsing(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/college-classes?id=${id}`, { method: "DELETE" });
    fetchRules();
  };

  if (loading) return <div className="animate-fade-in">Loading timetable...</div>;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "800px" }}>
      <header>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>College Timetable</h1>
        <p style={{ color: "var(--text-muted)" }}>Paste your timetable. AI will extract your classes and add them to your daily tasks automatically.</p>
      </header>

      <Card style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Import via AI</h2>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste timetable here (e.g., MTO2 on Monday 09:00 and Friday 14:30)..."
          style={{
            width: "100%",
            height: "150px",
            background: "rgba(0,0,0,0.2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "#fff",
            padding: "1rem",
            fontFamily: "inherit",
            resize: "vertical"
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={handleParse} disabled={parsing || !rawText.trim()}>
            {parsing ? "Parsing with AI..." : "Extract Classes"}
          </Button>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Active Classes</h2>
        {rules.length === 0 && <p style={{ color: "var(--text-muted)" }}>No classes scheduled.</p>}
        
        {rules.map((rule) => (
          <Card key={rule.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                {rule.subjectCode} <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 400 }}>{rule.subjectName && `— ${rule.subjectName}`}</span>
              </h3>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                {rule.days.split(",").map((d: string) => (
                  <span key={d} style={{ background: "var(--surface-hover)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem" }}>
                    {DAYS_MAP[d.trim()]}
                  </span>
                ))}
                <span style={{ color: "var(--secondary)", fontWeight: 600, fontSize: "0.9rem", marginLeft: "0.5rem" }}>@ {rule.timeIST}</span>
              </div>
            </div>
            <Button size="sm" variant="danger" onClick={() => handleDelete(rule.id)}>Remove</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
