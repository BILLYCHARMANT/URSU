// Read uploaded file from Netlify Blob (on Netlify) or from disk (local).
import path from "path";
import fs from "fs";

const BLOB_STORE_NAME = "uploads";

export function useNetlifyBlob(): boolean {
  return process.env.NETLIFY === "true" || process.env.USE_NETLIFY_BLOB === "true";
}

/** Optional subPath (e.g. callId) for keys like "call-submissions/callId/filename". Returns Uint8Array for use with NextResponse (BodyInit). */
export async function getUploadBuffer(
  subdir: string,
  filename: string,
  subPath?: string
): Promise<Uint8Array | null> {
  const tryBlob = useNetlifyBlob() || process.env.NODE_ENV === "production";
  if (tryBlob) {
    try {
      const { getStore } = await import("@netlify/blobs");
      const store = getStore(BLOB_STORE_NAME);
      const key = subPath ? `${subdir}/${subPath}/${filename}` : `${subdir}/${filename}`;
      const data = await store.get(key, { type: "arrayBuffer" });
      if (data != null) return new Uint8Array(data);
    } catch {
      // Fall through to filesystem
    }
  }
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  const filePath =
    subPath != null
      ? path.join(process.cwd(), uploadDir, subdir, subPath, filename)
      : path.join(process.cwd(), uploadDir, subdir, filename);
  if (!fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  return new Uint8Array(buf);
}
