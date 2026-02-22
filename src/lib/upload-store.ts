// Read uploaded file from Netlify Blob (on Netlify) or from disk (local).
import path from "path";
import fs from "fs";

const BLOB_STORE_NAME = "uploads";

export function useNetlifyBlob(): boolean {
  return process.env.NETLIFY === "true" || process.env.USE_NETLIFY_BLOB === "true";
}

/** Optional subPath (e.g. callId) for keys like "call-submissions/callId/filename". */
export async function getUploadBuffer(
  subdir: string,
  filename: string,
  subPath?: string
): Promise<Buffer | null> {
  if (useNetlifyBlob()) {
    try {
      const { getStore } = await import("@netlify/blobs");
      const store = getStore(BLOB_STORE_NAME);
      const key = subPath ? `${subdir}/${subPath}/${filename}` : `${subdir}/${filename}`;
      const data = await store.get(key, { type: "arrayBuffer" });
      if (data == null) return null;
      return Buffer.from(data);
    } catch {
      return null;
    }
  }
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  const filePath =
    subPath != null
      ? path.join(process.cwd(), uploadDir, subdir, subPath, filename)
      : path.join(process.cwd(), uploadDir, subdir, filename);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}
