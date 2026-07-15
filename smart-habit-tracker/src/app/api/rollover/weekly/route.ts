import { NextResponse } from "next/server";
import { runWeeklyRollover } from "@/lib/rollover";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (
      process.env.NODE_ENV === "production" &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await runWeeklyRollover();
    return NextResponse.json({ success: true, message: "Weekly rollover executed" });
  } catch (error) {
    console.error("Weekly rollover failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
