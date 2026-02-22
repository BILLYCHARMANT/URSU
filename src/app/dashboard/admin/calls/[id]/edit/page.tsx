import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CallFormEditor, type FormFieldDef } from "@/components/admin/CallFormEditor";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "@/lib/get-server-session";

export default async function EditCallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  const { id } = await params;
  const call = await prisma.call.findUnique({ where: { id } });
  if (!call) notFound();

  const initial = {
    title: call.title,
    type: call.type,
    summary: call.summary,
    description: call.description ?? "",
    imageUrl: call.imageUrl ?? "",
    deadline: call.deadline ? call.deadline.toISOString().slice(0, 16) : "",
    published: call.published,
    formSchema: ((call.formSchema as unknown) as FormFieldDef[]) ?? [],
  };

  return (
    <div
      className="min-h-full rounded-xl p-6"
      style={{ backgroundColor: "var(--sidebar-bg)" }}
    >
      <div className="mb-6">
        <Link
          href="/dashboard/admin/calls"
          className="text-sm hover:underline"
          style={{ color: "var(--unipod-blue)" }}
        >
          ← Application forms
        </Link>
        <h1 className="text-2xl font-bold text-[#171717] dark:text-[#f9fafb] mt-2">
          Edit: {call.title}
        </h1>
        <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mt-1">
          Update the form. Published forms appear on the homepage.
        </p>
      </div>
      <CallFormEditor callId={id} initial={initial} />
    </div>
  );
}
