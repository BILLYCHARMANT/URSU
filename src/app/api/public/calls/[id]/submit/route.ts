import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const submitSchema = z.object({
  data: z.record(z.string(), z.union([z.string(), z.number()])),
  submitterName: z.string().optional(),
  submitterEmail: z.string().email().optional(),
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

    const body = await req.json();
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const submission = await prisma.callSubmission.create({
      data: {
        callId,
        data: parsed.data.data as object,
        submittedById: session?.user?.id ?? null,
        submitterName: parsed.data.submitterName ?? session?.user?.name ?? null,
        submitterEmail: parsed.data.submitterEmail ?? (session?.user?.email as string) ?? null,
      },
    });
    return NextResponse.json({ id: submission.id, message: "Application submitted successfully." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
