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

    const savedUrls: string[] = [];
    const imgbbKey = process.env.IMGBB_API_KEY;

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

      // Option 1: If ImgBB API key is configured in env, upload to ImgBB
      if (imgbbKey) {
        try {
          const body = new FormData();
          body.append("image", buffer.toString("base64"));
          const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
            method: "POST",
            body,
          });
          const data = await res.json();
          if (data?.data?.url) {
            savedUrls.push(data.data.url);
            continue;
          }
        } catch (imgbbErr) {
          console.warn("ImgBB upload failed, falling back to local/data-url", imgbbErr);
        }
      }

      // Option 2: Try saving to local filesystem (works in local dev & VPS)
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeName}`;
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);
        savedUrls.push(`/uploads/${filename}`);
      } catch (fsErr) {
        // Option 3: Fallback for Vercel / Serverless read-only filesystem using Data URL
        console.warn("Serverless read-only filesystem detected, converting file to Data URL", fsErr);
        const base64 = buffer.toString("base64");
        const mimeType = file.type || "image/png";
        const dataUrl = `data:${mimeType};base64,${base64}`;
        savedUrls.push(dataUrl);
      }
    }

    return NextResponse.json({
      success: true,
      url: savedUrls[0],
      urls: savedUrls,
    });
  } catch (error) {
    console.error("Image upload handler error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload image.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
