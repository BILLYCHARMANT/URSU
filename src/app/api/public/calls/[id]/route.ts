import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Get a single published call by id (for apply page). No auth. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const call = await prisma.call.findFirst({
      where: { id, published: true },
      select: {
        id: true,
        title: true,
        type: true,
        summary: true,
        description: true,
        imageUrl: true,
        deadline: true,
        formSchema: true,
        updatedAt: true,
      },
    });
    if (!call) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      ...call,
      deadline: call.deadline ? call.deadline.toISOString() : null,
      updatedAt: call.updatedAt.toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
