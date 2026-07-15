import { prisma } from "@/lib/prisma";
import { todayIST, startOfWeekIST, weekdayIST } from "@/lib/timezone";

export async function runDailyRollover() {
  const today = todayIST();
  
  // 1. Get user settings
  const settings = await prisma.userSettings.findUnique({ where: { userId: "default" } });
  if (!settings || settings.principleSkills.length === 0) return;

  const { principleSkills } = settings;

  // 2. Generate daily tasks for Principle Skills
  for (const skillId of principleSkills) {
    // Flatten subtopics
    const modules = await prisma.module.findMany({
      where: { skillId },
      orderBy: { order: "asc" },
      include: {
        subtopics: { orderBy: { order: "asc" } },
      },
    });

    const subtopics = modules.flatMap((m) => m.subtopics);
    if (subtopics.length === 0) continue;

    // Get/create cursor
    const cursor = await prisma.rotationCursor.upsert({
      where: { userId_skillId: { userId: "default", skillId } },
      update: {},
      create: { userId: "default", skillId, dailyCursorIdx: 0, weeklyCursorIdx: 0 },
    });

    const targetSubtopic = subtopics[cursor.dailyCursorIdx % subtopics.length];

    // Create daily task if not exists
    const existingTask = await prisma.dailyTask.findFirst({
      where: {
        skillId,
        dateIST: today,
      }
    });

    if (!existingTask) {
      await prisma.dailyTask.create({
        data: {
          skillId,
          subtopicId: targetSubtopic.id,
          dateIST: today,
          source: "AUTO",
        },
      });

      // Advance cursor
      await prisma.rotationCursor.update({
        where: { id: cursor.id },
        data: { dailyCursorIdx: cursor.dailyCursorIdx + 1 },
      });
    }
  }

  // 3. Inject College Classes for today
  const currentWeekday = weekdayIST().toString(); // "0" to "6"
  const activeRules = await prisma.collegeClassRule.findMany({
    where: { isActive: true },
  });

  for (const rule of activeRules) {
    const daysArr = rule.days.split(",").map((d) => d.trim());
    if (daysArr.includes(currentWeekday)) {
      // Create CollegeClassTask
      await prisma.collegeClassTask.upsert({
        where: { ruleId_dateIST: { ruleId: rule.id, dateIST: today } },
        update: {},
        create: {
          ruleId: rule.id,
          dateIST: today,
        },
      });
    }
  }

  console.log(`Daily rollover completed for ${today}`);
}

export async function runWeeklyRollover() {
  const weekStart = startOfWeekIST();
  
  const settings = await prisma.userSettings.findUnique({ where: { userId: "default" } });
  if (!settings || settings.principleSkills.length === 0) return;

  const { principleSkills } = settings;
  const modulesPerWeek = 2; // Can be configurable later

  for (const skillId of principleSkills) {
    const modules = await prisma.module.findMany({
      where: { skillId },
      orderBy: { order: "asc" },
    });

    if (modules.length === 0) continue;

    const cursor = await prisma.rotationCursor.upsert({
      where: { userId_skillId: { userId: "default", skillId } },
      update: {},
      create: { userId: "default", skillId, dailyCursorIdx: 0, weeklyCursorIdx: 0 },
    });

    let addedTasks = 0;
    for (let i = 0; i < modulesPerWeek; i++) {
      const idx = (cursor.weeklyCursorIdx + i) % modules.length;
      const targetModule = modules[idx];

      // Create weekly task if not exists
      const existingWeekly = await prisma.weeklyTask.findFirst({
        where: {
          skillId,
          moduleId: targetModule.id,
          weekIST: weekStart,
        }
      });

      if (!existingWeekly) {
        await prisma.weeklyTask.create({
          data: {
            skillId,
            moduleId: targetModule.id,
            weekIST: weekStart,
            source: "AUTO",
          },
        });
        addedTasks++;
      }
    }

    if (addedTasks > 0) {
      // Advance cursor
      await prisma.rotationCursor.update({
        where: { id: cursor.id },
        data: { weeklyCursorIdx: cursor.weeklyCursorIdx + addedTasks },
      });
    }
  }

  console.log(`Weekly rollover completed for week starting ${weekStart}`);
}
