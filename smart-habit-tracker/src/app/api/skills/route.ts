import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            subtopics: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
