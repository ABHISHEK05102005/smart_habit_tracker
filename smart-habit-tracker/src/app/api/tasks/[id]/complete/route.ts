import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardXp } from "@/lib/xp";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, status } = body; // type: 'daily' | 'weekly' | 'college'

    if (type === "daily") {
      const task = await prisma.dailyTask.findUnique({ where: { id } });
      if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

      await prisma.dailyTask.update({
        where: { id },
        data: {
          status,
          completedAt: status === "COMPLETED" ? new Date() : null,
        },
      });

      // Sync subtopic status
      if (task.subtopicId) {
        await prisma.subtopic.update({
          where: { id: task.subtopicId },
          data: {
            status,
            completedAt: status === "COMPLETED" ? new Date() : null,
          },
        });
      }

      // Award XP
      if (status === "COMPLETED" && task.status !== "COMPLETED") {
        await awardXp("default", 10); // arbitrary XP amount
      }
    } else if (type === "weekly") {
      const task = await prisma.weeklyTask.findUnique({ where: { id } });
      if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

      await prisma.weeklyTask.update({
        where: { id },
        data: {
          status,
          completedAt: status === "COMPLETED" ? new Date() : null,
        },
      });

      // Sync module status
      if (task.moduleId) {
        await prisma.module.update({
          where: { id: task.moduleId },
          data: {
            status,
            completedAt: status === "COMPLETED" ? new Date() : null,
          },
        });
      }

      if (status === "COMPLETED" && task.status !== "COMPLETED") {
        await awardXp("default", 50); // more XP for weekly
      }
    } else if (type === "college") {
      const task = await prisma.collegeClassTask.findUnique({ where: { id } });
      if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

      await prisma.collegeClassTask.update({
        where: { id },
        data: {
          status,
          completedAt: status === "COMPLETED" ? new Date() : null,
        },
      });
      if (status === "COMPLETED" && task.status !== "COMPLETED") {
        await awardXp("default", 5);
      }
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
