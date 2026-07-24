import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required" },
        { status: 400 }
      );
    }

    // In production, this would send an email or store to DB.
    // For now we simulate success.
    console.log("Contact form submission:", { name, email, phone, message });

    return NextResponse.json({
      success: true,
      message:
        "Thank you for reaching out! Our team will get back to you within 24 hours.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
