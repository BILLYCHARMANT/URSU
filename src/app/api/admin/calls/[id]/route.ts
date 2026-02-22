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

const updateCallSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(["PROJECT", "APPLICATION", "COMPETITION", "EVENT"]).optional(),
  summary: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  published: z.boolean().optional(),
  formSchema: z.array(formFieldSchema).optional(),
});

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const call = await prisma.call.findUnique({
      where: { id },
      include: { _count: { select: { submissions: true } } },
    });
    if (!call) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(call);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();
    const parsed = updateCallSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const data: Record<string, unknown> = { ...parsed.data };
    if (data.deadline !== undefined)
      data.deadline = data.deadline ? new Date(data.deadline as string) : null;
    if (data.formSchema !== undefined) data.formSchema = data.formSchema as object;
    if (data.imageUrl !== undefined)
      data.imageUrl = (typeof data.imageUrl === "string" && data.imageUrl.trim()) ? data.imageUrl.trim() : null;
    const call = await prisma.call.update({
      where: { id },
      data,
    });
    return NextResponse.json(call);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    await prisma.call.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
