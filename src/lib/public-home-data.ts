/**
 * Public home page data: news and calls.
 * Calls come from DB (Call model); news is static until a News model exists.
 */

import { prisma } from "@/lib/prisma";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  date: string;
  slug?: string;
};

export type CallItem = {
  id: string;
  title: string;
  type: "PROJECT" | "APPLICATION" | "COMPETITION" | "EVENT";
  summary: string;
  imageUrl: string | null;
  deadline: string | null;
  date: string;
};

function formatDisplayDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export type NewsItemWithDate = NewsItem & { dateFormatted: string };
export type CallItemWithDate = CallItem & { deadlineFormatted: string | null; dateFormatted: string };

/** Latest news for the home page (static until News model exists). */
export function getPublicNews(limit = 10): NewsItemWithDate[] {
  const items: NewsItem[] = [
    {
      id: "1",
      title: "URSU Projects platform now live",
      summary:
        "The University of Rwanda Students' Union project and certification portal is open. Sign in to join programs and track your progress.",
      date: new Date().toISOString().split("T")[0],
    },
    {
      id: "2",
      title: "Strive for a golden future",
      summary:
        "Our motto reflects our commitment to supporting students through project-based learning and certification.",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  ];
  return items.slice(0, limit).map((n) => ({ ...n, dateFormatted: formatDisplayDate(n.date) }));
}

/** Open calls from DB (published only). Shown on home page in Calls section. */
export async function getPublicCalls(limit = 10): Promise<CallItemWithDate[]> {
  try {
    const calls = await prisma.call.findMany({
      where: { published: true },
      orderBy: [{ deadline: "asc" }, { updatedAt: "desc" }],
      take: limit,
      select: { id: true, title: true, type: true, summary: true, imageUrl: true, deadline: true, updatedAt: true },
    });
    return calls.map((c) => ({
    id: c.id,
    title: c.title,
    type: c.type,
    summary: c.summary,
    imageUrl: c.imageUrl ?? null,
    deadline: c.deadline ? c.deadline.toISOString().split("T")[0] : null,
    date: c.updatedAt.toISOString().split("T")[0],
    deadlineFormatted: c.deadline ? formatDisplayDate(c.deadline.toISOString()) : null,
    dateFormatted: formatDisplayDate(c.updatedAt.toISOString()),
  }));
  } catch {
    return [];
  }
}
