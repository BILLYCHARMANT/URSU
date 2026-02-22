import { NextResponse } from "next/server";
import { getPublicNews, getPublicCalls } from "@/lib/public-home-data";

/**
 * Public API: news and calls for the home page.
 * No auth required. Used by the global home hub.
 */
export async function GET() {
  try {
    const [news, calls] = await Promise.all([getPublicNews(20), getPublicCalls(20)]);
    return NextResponse.json({ news, calls });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load home data" }, { status: 500 });
  }
}
