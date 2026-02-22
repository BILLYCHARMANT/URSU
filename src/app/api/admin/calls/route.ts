import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "email", "textarea", "number", "select", "file"]),
  label: z.string(),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  accept: z.string().optional(),
});

const createCallSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["PROJECT", "APPLICATION", "COMPETITION", "EVENT"]),
  summary: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  published: z.boolean().optional(),
  formSchema: z.array(formFieldSchema),
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const calls = await prisma.call.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { submissions: true } } },
    });
    return NextResponse.json(calls);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const parsed = createCallSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { title, type, summary, description, imageUrl, deadline, published, formSchema } = parsed.data;
    const call = await prisma.call.create({
      data: {
        title,
        type,
        summary,
        description: description ?? null,
        imageUrl: (typeof imageUrl === "string" && imageUrl.trim()) ? imageUrl.trim() : null,
        deadline: deadline ? new Date(deadline) : null,
        published: published ?? false,
        formSchema: formSchema as object,
        createdById: session.user.id,
      },
    });
    return NextResponse.json(call);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
