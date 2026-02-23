import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CallSubmissionsTable } from "@/components/admin/CallSubmissionsTable";
import type { FormFieldDef } from "@/components/admin/CallFormEditor";

export const dynamic = "force-dynamic";

export default async function CallSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  const { id } = await params;
  const call = await prisma.call.findUnique({
    where: { id },
    include: {
      submissions: { orderBy: { submittedAt: "desc" } },
    },
  });
  if (!call) notFound();

  const formSchema = (Array.isArray(call.formSchema) ? call.formSchema : []) as FormFieldDef[];
  const submissionRows = call.submissions.map((sub) => ({
    id: sub.id,
    data: (sub.data as Record<string, unknown>) ?? {},
    submitterName: sub.submitterName,
    submitterEmail: sub.submitterEmail,
    submittedAt: sub.submittedAt.toISOString(),
  }));

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
          Submissions: {call.title}
        </h1>
      </div>
      <CallSubmissionsTable
        formSchema={formSchema}
        submissions={submissionRows}
        callTitle={call.title}
      />
    </div>
  );
}
