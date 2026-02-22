import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CallsListClient } from "@/components/admin/CallsListClient";

export const dynamic = "force-dynamic";

export default async function AdminCallsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  const calls = await prisma.call.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });
  const callsJson = calls.map((c) => ({
    id: c.id,
    title: c.title,
    type: c.type,
    summary: c.summary,
    published: c.published,
    deadline: c.deadline ? c.deadline.toISOString() : null,
    updatedAt: c.updatedAt.toISOString(),
    submissionCount: c._count.submissions,
    imageUrl: c.imageUrl ?? null,
  }));
  return (
    <div
      className="min-h-full rounded-xl p-6"
      style={{ backgroundColor: "var(--sidebar-bg)" }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#171717] dark:text-[#f9fafb]">
            Application forms
          </h1>
          <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mt-1">
            Create and edit application forms. Published forms appear on the homepage under &quot;Calls&quot; for visitors to apply.
          </p>
        </div>
        <Link
          href="/dashboard/admin/calls/new"
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-95"
          style={{ backgroundColor: "var(--unipod-blue)" }}
        >
          New application form
        </Link>
      </div>
      <CallsListClient initialCalls={callsJson} />
    </div>
  );
}
