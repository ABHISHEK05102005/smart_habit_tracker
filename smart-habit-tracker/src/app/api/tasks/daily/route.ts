import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { todayIST } from "@/lib/timezone";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || todayIST();

    const tasks = await prisma.dailyTask.findMany({
      where: { dateIST: date },
      include: {
        skill: true,
        subtopic: true,
      },
      orderBy: { id: "asc" },
    });

    const classTasks = await prisma.collegeClassTask.findMany({
      where: { dateIST: date },
      include: {
        rule: true,
      },
      orderBy: { rule: { timeIST: "asc" } },
    });

    return NextResponse.json({ tasks, classTasks });
  } catch (error) {
    console.error("Error fetching daily tasks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Manual task addition
    const { skillId, subtopicId } = body;
    const task = await prisma.dailyTask.create({
      data: {
        skillId,
        subtopicId,
        dateIST: todayIST(),
        source: "MANUAL",
      },
      include: {
        skill: true,
        subtopic: true,
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error("Error creating daily task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
