import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();

  try {
    const formData = await req.formData();
    const uploadedFiles: File[] = [];

    // Support 'file' or 'files' input key
    const singleFile = formData.get("file");
    if (singleFile && singleFile instanceof File) {
      uploadedFiles.push(singleFile);
    }

    const multiFiles = formData.getAll("files");
    for (const f of multiFiles) {
      if (f instanceof File && !uploadedFiles.includes(f)) {
        uploadedFiles.push(f);
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const savedUrls: string[] = [];

    for (const file of uploadedFiles) {
      // Validate image type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: `File ${file.name} is not an image.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Clean filename
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeName}`;
      const filePath = path.join(uploadDir, filename);

      await writeFile(filePath, buffer);
      savedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({
      success: true,
      url: savedUrls[0],
      urls: savedUrls,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image." },
      { status: 500 }
    );
  }
}
