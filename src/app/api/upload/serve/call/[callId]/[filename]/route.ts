// GET /api/upload/serve/call/[callId]/[filename] - Serve call application upload (authenticated)
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs";

const MIME_BY_EXT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".txt": "text/plain",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ callId: string; filename: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { callId, filename } = await params;
  if (!callId || !filename || !/^[a-f0-9\-]+\.[a-z0-9]+$/i.test(filename)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const inline = searchParams.get("inline") === "1";

  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  const filePath = path.join(process.cwd(), uploadDir, "call-submissions", callId, filename);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_BY_EXT[ext] || "application/octet-stream";

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Disposition": inline ? "inline" : `attachment; filename="${filename}"`,
  };
  return new NextResponse(buffer, { headers });
}
