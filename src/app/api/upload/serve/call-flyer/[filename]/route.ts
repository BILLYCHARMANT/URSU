// GET /api/upload/serve/call-flyer/[filename] - Serve call photo/flyer (public for home & apply)
import { NextResponse } from "next/server";
import path from "path";
import { getUploadBuffer } from "@/lib/upload-store";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename || !/^[a-f0-9\-]+\.[a-z0-9]+$/i.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }
  const buffer = await getUploadBuffer("calls", filename);
  if (!buffer) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  return new NextResponse(buffer as BodyInit, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
