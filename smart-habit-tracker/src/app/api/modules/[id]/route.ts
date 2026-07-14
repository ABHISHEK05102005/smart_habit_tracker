import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, linkedTaskId } = body;

    const module = await prisma.module.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(linkedTaskId !== undefined ? { linkedTaskId } : {}),
        ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
      },
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
