import { NextResponse } from "next/server";
import { getAllProductsFromDb } from "@/lib/product-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getAllProductsFromDb();
  return NextResponse.json({ products });
}
