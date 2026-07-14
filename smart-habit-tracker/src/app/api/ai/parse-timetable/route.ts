import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateText } from "@/lib/llm";

const SYSTEM_PROMPT = `
You are a timetable parser. The user will provide a raw, unstructured text dump of their college or school timetable.
Extract all recurring classes into structured data. Note that a single subject might occur on different days at different times. If the time differs, split them into separate rules.

Output ONLY valid JSON matching this schema exactly (no markdown blocks, just the JSON array):
[
  {
    "subjectCode": "MTO2",
    "subjectName": "Mathematics II (optional)",
    "days": [1, 5],
    "timeIST": "09:00"
  }
]

Note on days: use numbers 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat.
Note on timeIST: use HH:MM 24-hour format in IST. Assume the user is in IST if not specified.
`;

export async function POST(request: Request) {
  try {
    const { rawText } = await request.json();
    if (!rawText) return NextResponse.json({ error: "Missing rawText" }, { status: 400 });

    const rawResponse = await generateText(rawText, SYSTEM_PROMPT);
    let data: any[];
    try {
      const cleaned = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      data = JSON.parse(cleaned);
      if (!Array.isArray(data)) throw new Error("Not an array");
    } catch (e) {
      console.error("Failed to parse LLM timetable response:", rawResponse);
      return NextResponse.json({ error: "LLM returned invalid JSON" }, { status: 500 });
    }

    // Save to DB
    const savedRules = [];
    for (const rule of data) {
      if (!rule.subjectCode || !rule.days || !rule.timeIST) continue;
      
      const daysStr = rule.days.join(","); // e.g. "1,5"
      const saved = await prisma.collegeClassRule.upsert({
        where: {
          userId_subjectCode_days_timeIST: {
            userId: "default",
            subjectCode: rule.subjectCode,
            days: daysStr,
            timeIST: rule.timeIST,
          }
        },
        update: { isActive: true },
        create: {
          userId: "default",
          subjectCode: rule.subjectCode,
          subjectName: rule.subjectName || "",
          days: daysStr,
          timeIST: rule.timeIST,
          isActive: true,
        },
      });
      savedRules.push(saved);
    }

    return NextResponse.json(savedRules);
  } catch (error) {
    console.error("Error parsing timetable:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
