import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Allow form data values: string, number, boolean, or array of primitives (e.g. multi-select)
const formValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.union([z.string(), z.number(), z.boolean()])),
]);
const submitSchema = z.object({
  data: z.record(z.string(), formValueSchema),
  submitterName: z.string().optional(),
  submitterEmail: z.string().email().optional().or(z.literal("")),
});

/** Submit an application form. No auth required; optional name/email for anonymous. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: callId } = await params;
    const call = await prisma.call.findFirst({
      where: { id: callId, published: true },
    });
    if (!call) return NextResponse.json({ error: "Call not found" }, { status: 404 });

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let session: Session | null = null;
    try {
      const s = await getServerSession(authOptions);
      session = s as Session | null;
    } catch {
      // Auth not required for submit; continue with null session
    }

    const user = session?.user as Session["user"] | undefined;
    // Ensure only JSON-serializable data for Prisma Json field
    const dataForDb = JSON.parse(JSON.stringify(parsed.data.data)) as object;

    const submission = await prisma.callSubmission.create({
      data: {
        callId,
        data: dataForDb,
        submittedById: user?.id ?? null,
        submitterName: (parsed.data.submitterName?.trim() || user?.name) ?? null,
        submitterEmail: (parsed.data.submitterEmail?.trim() || user?.email) ?? null,
      },
    });
    return NextResponse.json({ id: submission.id, message: "Application submitted successfully." });
  } catch (e) {
    console.error("Call submit error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
