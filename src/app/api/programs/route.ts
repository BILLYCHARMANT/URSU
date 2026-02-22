// GET /api/programs - List programs
// POST /api/programs - Create program (admin only; stored as INACTIVE until first cohort)
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProgram } from "@/lib/program-admin-service";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  duration: z.string().optional(),
  skillOutcomes: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const where: { id?: { in: string[] } } = {};
    const cohortWhere: { mentorId?: string } = {};
    if (session.user.role === "MENTOR") {
      const mentorCohorts = await prisma.cohort.findMany({
        where: { mentorId: session.user.id },
        select: { programId: true },
      });
      const programIds = [...new Set(mentorCohorts.map((c) => c.programId).filter(Boolean))] as string[];
      if (programIds.length === 0) {
        return NextResponse.json([]);
      }
      where.id = { in: programIds };
      cohortWhere.mentorId = session.user.id;
    }
    const programs = await prisma.program.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        cohorts: {
          where: Object.keys(cohortWhere).length ? cohortWhere : undefined,
          select: { id: true, name: true, startDate: true },
        },
        courses: {
          select: {
            id: true,
            name: true,
            modules: { select: { id: true, title: true, order: true } },
          },
        },
      },
    });
    return NextResponse.json(programs);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Only admin can create programs
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const program = await createProgram({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      imageUrl: parsed.data.imageUrl && parsed.data.imageUrl !== "" ? parsed.data.imageUrl : null,
      duration: parsed.data.duration ?? null,
      skillOutcomes: parsed.data.skillOutcomes ?? null,
      adminId: session.user.id,
    });
    return NextResponse.json(program);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
