// POST /api/upload - Handle file upload for assignment submissions, call flyers, etc.
// On Netlify uses Netlify Blob; locally uses UPLOAD_DIR on disk.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const BLOB_STORE_NAME = "uploads";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No file or invalid file" },
        { status: 400 }
      );
    }
    const type = formData.get("type") as string | null;
    const subdir =
      type === "avatar"
        ? "avatars"
        : type === "course" || type === "program"
          ? "courses"
          : type === "call"
            ? "calls"
            : "submissions";
    const ext = (path.extname(file.name) || "").toLowerCase();
    if (subdir === "submissions") {
      const allowed = [".pdf", ".doc", ".docx"];
      if (!allowed.includes(ext)) {
        return NextResponse.json(
          { error: "Only PDF and Word documents (.pdf, .doc, .docx) are allowed" },
          { status: 400 }
        );
      }
    }
    if (subdir === "calls") {
      const allowed = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf"];
      if (!allowed.includes(ext)) {
        return NextResponse.json(
          { error: "Call flyer: use image (.png, .jpg, .gif, .webp) or PDF" },
          { status: 400 }
        );
      }
    }
    const safeExt = ext || (subdir === "avatars" ? ".png" : subdir === "calls" ? ".png" : ".bin");
    const safeName = `${uuidv4()}${safeExt}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileUrl =
      subdir === "avatars"
        ? `/api/upload/serve/avatar/${safeName}`
        : subdir === "courses"
          ? `/api/upload/serve/course/${safeName}`
          : subdir === "calls"
            ? `/api/upload/serve/call-flyer/${safeName}`
            : `/api/upload/serve/${safeName}`;

    // Netlify: use Blob store (no persistent filesystem)
    const { useNetlifyBlob } = await import("@/lib/upload-store");
    if (useNetlifyBlob()) {
      try {
        const { getStore } = await import("@netlify/blobs");
        const store = getStore(BLOB_STORE_NAME);
        const key = `${subdir}/${safeName}`;
        await store.set(key, buffer);
        return NextResponse.json({ fileUrl, filename: file.name });
      } catch (blobErr) {
        console.error("Netlify Blob upload failed:", blobErr);
        return NextResponse.json(
          {
            error:
              "Upload failed on Netlify. Enable Netlify Blobs in the Netlify dashboard (Data & Storage) or use a flyer URL instead.",
          },
          { status: 500 }
        );
      }
    }

    // Local: write to disk
    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    const dir = path.join(process.cwd(), uploadDir, subdir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, safeName);
    fs.writeFileSync(filePath, buffer);
    return NextResponse.json({ fileUrl, filename: file.name });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
