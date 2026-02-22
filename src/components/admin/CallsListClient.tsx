"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type CallRow = {
  id: string;
  title: string;
  type: string;
  summary: string;
  published: boolean;
  deadline: string | null;
  updatedAt: string;
  submissionCount: number;
  imageUrl?: string | null;
};

const typeLabels: Record<string, string> = {
  PROJECT: "Project",
  APPLICATION: "Application",
  COMPETITION: "Competition",
  EVENT: "Event",
};

export function CallsListClient({ initialCalls }: { initialCalls: CallRow[] }) {
  const router = useRouter();

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This will also delete all submissions.`)) return;
    const res = await fetch(`/api/admin/calls/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to delete");
      return;
    }
    router.refresh();
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }

  if (initialCalls.length === 0) {
    return (
      <div className="rounded-xl border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] p-12 text-center">
        <p className="text-[#6b7280] dark:text-[#9ca3af] mb-4">
          No application forms yet. Create one to show on the homepage.
        </p>
        <Link
          href="/dashboard/admin/calls/new"
          className="inline-flex rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--unipod-blue)" }}
        >
          Create first form
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] dark:border-[#374151] bg-[var(--sidebar-bg)]">
              <th className="px-4 py-3 font-semibold text-[#171717] dark:text-[#f9fafb]">Title</th>
              <th className="px-4 py-3 font-semibold text-[#171717] dark:text-[#f9fafb]">Type</th>
              <th className="px-4 py-3 font-semibold text-[#171717] dark:text-[#f9fafb]">Flyer</th>
              <th className="px-4 py-3 font-semibold text-[#171717] dark:text-[#f9fafb]">Status</th>
              <th className="px-4 py-3 font-semibold text-[#171717] dark:text-[#f9fafb]">Submissions</th>
              <th className="px-4 py-3 font-semibold text-[#171717] dark:text-[#f9fafb]">Updated</th>
              <th className="px-4 py-3 font-semibold text-[#171717] dark:text-[#f9fafb]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialCalls.map((c) => (
              <tr
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/dashboard/admin/calls/${c.id}/edit`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/dashboard/admin/calls/${c.id}/edit`);
                  }
                }}
                className="border-b border-[#e5e7eb] dark:border-[#374151] hover:bg-[var(--unipod-blue-light)]/30 dark:hover:bg-[#374151]/30 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <span className="font-medium" style={{ color: "var(--unipod-blue)" }}>
                    {c.title}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#6b7280] dark:text-[#9ca3af]">
                  {typeLabels[c.type] ?? c.type}
                </td>
                <td className="px-4 py-3 text-[#6b7280] dark:text-[#9ca3af]">
                  {c.imageUrl ? (
                    <span className="text-green-600 dark:text-green-400">Yes</span>
                  ) : (
                    <span>—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: c.published ? "var(--unipod-yellow-bg)" : "var(--sidebar-bg)",
                      color: c.published ? "var(--ursu-navy)" : "var(--foreground)",
                    }}
                  >
                    {c.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#6b7280] dark:text-[#9ca3af]">
                  {c.submissionCount}
                </td>
                <td className="px-4 py-3 text-[#6b7280] dark:text-[#9ca3af]">
                  {formatDate(c.updatedAt)}
                </td>
                <td className="px-4 py-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/dashboard/admin/calls/${c.id}/submissions`}
                    className="text-sm hover:underline"
                    style={{ color: "var(--unipod-blue)" }}
                  >
                    View
                  </Link>
                  <Link
                    href={`/apply/${c.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                    style={{ color: "var(--unipod-blue)" }}
                  >
                    Preview
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDelete(c.id, c.title); }}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
