import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateText } from "@/lib/llm";

const SYSTEM_PROMPT = `
You are a highly analytical technical curriculum designer. The user will provide a skill they want to learn.
You must break it down into roughly 3-5 Modules (each taking 3-4 hours), and each module must have 3-5 Subtopics (each taking ~1 hour).

You must output valid JSON ONLY matching exactly this schema, and nothing else (no markdown blocks, just the raw JSON object):

{
  "skill": "Skill Name",
  "modules": [
    {
      "name": "Module Name",
      "duration": "3-4 hours",
      "learn": "1-sentence theory description.",
      "implement": "1-sentence practical exercise.",
      "mini_project": "1-sentence small project combining the subtopics.",
      "subtopics": [
        {
          "name": "Subtopic Name",
          "duration": "1 hour",
          "learn": "1-sentence theory description.",
          "implement": "1-sentence practical exercise.",
          "mini_project": "1-sentence small project."
        }
      ]
    }
  ]
}
`;

export async function POST(request: Request) {
  try {
    const { skillName } = await request.json();
    if (!skillName) return NextResponse.json({ error: "Missing skillName" }, { status: 400 });

    const rawResponse = await generateText(skillName, SYSTEM_PROMPT);
    let data;
    try {
      // Strip markdown code blocks if any
      const cleaned = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      data = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse LLM response:", rawResponse);
      return NextResponse.json({ error: "LLM returned invalid JSON" }, { status: 500 });
    }

    // Save to DB
    const skill = await prisma.skill.create({
      data: {
        name: data.skill,
        source: "ai",
      },
    });

    let mOrder = 0;
    for (const mod of data.modules) {
      mOrder++;
      const moduleRow = await prisma.module.create({
        data: {
          skillId: skill.id,
          name: mod.name,
          duration: mod.duration || "3-4 hours",
          learn: mod.learn || "",
          implement: mod.implement || "",
          miniProject: mod.mini_project || "",
          order: mOrder,
        },
      });

      let sOrder = 0;
      if (mod.subtopics) {
        for (const sub of mod.subtopics) {
          sOrder++;
          await prisma.subtopic.create({
            data: {
              moduleId: moduleRow.id,
              name: sub.name,
              duration: sub.duration || "1 hour",
              learn: sub.learn || "",
              implement: sub.implement || "",
              miniProject: sub.mini_project || "",
              order: sOrder,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, skillId: skill.id });
  } catch (error) {
    console.error("Error expanding skill:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
