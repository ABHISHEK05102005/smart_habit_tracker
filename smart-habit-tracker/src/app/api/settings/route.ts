import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runDailyRollover, runWeeklyRollover } from "@/lib/rollover";

export async function GET() {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: "default" },
    });
    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { principleSkills } = body;

    const settings = await prisma.userSettings.update({
      where: { userId: "default" },
      data: {
        ...(principleSkills ? { principleSkills } : {}),
      },
    });

    if (principleSkills) {
      // Generate tasks for newly added skills immediately
      await runDailyRollover();
      await runWeeklyRollover();
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
