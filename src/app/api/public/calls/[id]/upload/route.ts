// POST /api/public/calls/[id]/upload - Public file upload for call applications (no auth)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_EXT = new Set([
  ".pdf", ".doc", ".docx", ".pptx", ".xls", ".xlsx",
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".txt",
]);

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: callId } = await params;
    const call = await prisma.call.findFirst({
      where: { id: callId, published: true },
      select: { id: true },
    });
    if (!call) {
      return NextResponse.json({ error: "Call not found or not published" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file or invalid file" }, { status: 400 });
    }

    const ext = (path.extname(file.name) || "").toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { error: "File type not allowed. Allowed: PDF, Word, PPTX, Excel, images, TXT." },
        { status: 400 }
      );
    }

    const safeName = `${uuidv4()}${ext}`;
    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    const dir = path.join(process.cwd(), uploadDir, "call-submissions", callId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, safeName);
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));

    const fileUrl = `/api/upload/serve/call/${callId}/${safeName}`;
    return NextResponse.json({ fileUrl, filename: file.name });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
