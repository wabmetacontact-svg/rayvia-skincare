import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { desc } from "drizzle-orm";
import { reviews as seedReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbReviews = await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.createdAt))
      .limit(50);

    // Fallback to seed data if DB is empty
    if (dbReviews.length === 0) {
      return NextResponse.json({ reviews: seedReviews });
    }

    return NextResponse.json({ reviews: dbReviews });
  } catch {
    return NextResponse.json({ reviews: seedReviews });
  }
}

export async function POST(req: Request) {
  try {
    const { name, rating, comment, title, productId } = await req.json();

    if (!name || !rating || !comment) {
      return NextResponse.json(
        { error: "Name, rating and comment are required" },
        { status: 400 }
      );
    }

    const [review] = await db
      .insert(reviews)
      .values({
        name,
        rating: Number(rating),
        comment,
        title: title || null,
        productId: productId || null,
      })
      .returning();

    return NextResponse.json({ success: true, review });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
