import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletter } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    await db.insert(newsletter).values({ email }).onConflictDoNothing();

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully! Use code RAYVIA10 for 10% off.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
