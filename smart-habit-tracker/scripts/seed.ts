const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database from skills_seed.json...");
  
  const seedPath = path.join(__dirname, "..", "public", "skills_seed.json");
  const rawData = fs.readFileSync(seedPath, "utf-8");
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

    console.log(`Ensured Skill: ${skill.name}`);

    // Modules
    let mOrder = 0;
    for (const mod of modules as any[]) {
      mOrder++;
      // We don't have a unique constraint on module name per skill in DB schema right now,
      // so we use findFirst. For a real upsert without unique constraints, we need to do it manually.
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
  const userSettings = await prisma.userSettings.upsert({
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
  console.log("Ensured default UserSettings exists.");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
