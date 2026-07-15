import { NextResponse } from "next/server";
import { runDailyRollover } from "@/lib/rollover";

export async function GET(request: Request) {
  try {
    // Basic protection against arbitrary calls outside Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (
      process.env.NODE_ENV === "production" &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await runDailyRollover();
    return NextResponse.json({ success: true, message: "Daily rollover executed" });
  } catch (error) {
    console.error("Daily rollover failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
