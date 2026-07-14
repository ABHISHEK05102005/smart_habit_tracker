import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfWeekIST } from "@/lib/timezone";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get("week") || startOfWeekIST();

    const tasks = await prisma.weeklyTask.findMany({
      where: { weekIST: week },
      include: {
        skill: true,
        module: true,
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching weekly tasks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { skillId, moduleId } = body;
    const task = await prisma.weeklyTask.create({
      data: {
        skillId,
        moduleId,
        weekIST: startOfWeekIST(),
        source: "MANUAL",
      },
      include: {
        skill: true,
        module: true,
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error("Error creating weekly task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
