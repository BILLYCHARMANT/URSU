import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

  function formatDate(d: Date) {
    return d.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

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
        <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mt-1">
          {call.submissions.length} submission(s)
        </p>
      </div>
      {call.submissions.length === 0 ? (
        <div className="rounded-xl border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] p-12 text-center text-[#6b7280] dark:text-[#9ca3af]">
          No submissions yet.
        </div>
      ) : (
        <div className="space-y-4">
          {call.submissions.map((sub) => {
            const data = (sub.data as Record<string, unknown>) ?? {};
            return (
              <div
                key={sub.id}
                className="rounded-xl border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b7280] dark:text-[#9ca3af] mb-3">
                  <span>{formatDate(sub.submittedAt)}</span>
                  {sub.submitterName && <span>• {sub.submitterName}</span>}
                  {sub.submitterEmail && <span>• {sub.submitterEmail}</span>}
                </div>
                <dl className="grid gap-2 text-sm">
                  {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <dt className="font-medium text-[#374151] dark:text-[#d1d5db] shrink-0">
                        {key}:
                      </dt>
                      <dd className="text-[#171717] dark:text-[#f9fafb] break-all">
                        {String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
