import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seedPath = path.join(process.cwd(), "public", "skills_seed.json");
    const rawData = await fs.readFile(seedPath, "utf-8");
    const data = JSON.parse(rawData);

    // Upsert Skills
    for (const [skillName, modules] of Object.entries(data.skills)) {
      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: {
          name: skillName,
          source: "seed",
        },
      });

      // Modules
      let mOrder = 0;
      for (const mod of modules as any[]) {
        mOrder++;
        let moduleRow = await prisma.module.findFirst({
          where: { skillId: skill.id, name: mod.name },
        });

        if (!moduleRow) {
          moduleRow = await prisma.module.create({
            data: {
              skillId: skill.id,
              name: mod.name,
              duration: mod.duration || "3-4 hours",
              learn: mod.learn || "",
              implement: mod.implement || "",
              miniProject: mod.mini_project || "",
              order: mOrder,
              status: "NOT_STARTED",
            },
          });
        }

        // Subtopics
        let sOrder = 0;
        if (mod.subtopics) {
          for (const sub of mod.subtopics) {
            sOrder++;
            let subRow = await prisma.subtopic.findFirst({
              where: { moduleId: moduleRow.id, name: sub.name },
            });

            if (!subRow) {
              await prisma.subtopic.create({
                data: {
                  moduleId: moduleRow.id,
                  name: sub.name,
                  duration: sub.duration || "1 hour",
                  learn: sub.learn || "",
                  implement: sub.implement || "",
                  miniProject: sub.mini_project || "",
                  order: sOrder,
                  status: "NOT_STARTED",
                },
              });
            }
          }
        }
      }
    }

    // Ensure default UserSettings exists
    await prisma.userSettings.upsert({
      where: { userId: "default" },
      update: {},
      create: {
        userId: "default",
        principleSkills: [],
        totalXp: 0,
        currentStreak: 0,
        bestStreak: 0,
        rank: "E",
      },
    });

    return NextResponse.json({ success: true, message: "Seeding complete" });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
