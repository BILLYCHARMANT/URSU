"use client";

import { useCallback } from "react";
import type { FormFieldDef } from "./CallFormEditor";

type SubmissionRow = {
  id: string;
  data: Record<string, unknown>;
  submitterName: string | null;
  submitterEmail: string | null;
  submittedAt: string; // ISO
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  catch {
    return iso;
  }
}

function cellValue(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function isFileUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return value.startsWith("/") || value.startsWith("http") || /\.(pdf|doc|docx|png|jpg|jpeg|gif|webp)$/i.test(value);
}

export function CallSubmissionsTable({
  formSchema,
  submissions,
  callTitle,
}: {
  formSchema: FormFieldDef[];
  submissions: SubmissionRow[];
  callTitle: string;
}) {
  const fieldColumns = formSchema.filter((f) => f.id && (f.label?.trim() || f.id));

  const exportExcel = useCallback(() => {
    import("xlsx").then((XLSX) => {
      const headers = [
        "Submitted at",
        "Submitter name",
        "Submitter email",
        ...fieldColumns.map((f) => f.label?.trim() || f.id),
      ];
      const rows = submissions.map((sub) => {
        const data = (sub.data as Record<string, unknown>) ?? {};
        return [
          formatDate(sub.submittedAt),
          sub.submitterName ?? "",
          sub.submitterEmail ?? "",
          ...fieldColumns.map((f) => cellValue(data[f.id])),
        ];
      });
      const sheetData = [headers, ...rows];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, "Submissions");
      const safeTitle = callTitle.replace(/[^\w\s-]/g, "").slice(0, 50) || "Submissions";
      XLSX.writeFile(wb, `${safeTitle}_submissions.xlsx`);
    });
  }, [submissions, fieldColumns, callTitle]);

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] p-12 text-center text-[#6b7280] dark:text-[#9ca3af]">
        No submissions yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
          {submissions.length} submission(s) · Columns match form fields
        </p>
        <button
          type="button"
          onClick={exportExcel}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--unipod-blue)" }}
        >
          <span aria-hidden>📥</span>
          Export to Excel
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937]">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] dark:border-[#374151]">
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-[#374151] dark:text-[#d1d5db]">
                Submitted at
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-[#374151] dark:text-[#d1d5db]">
                Submitter name
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-[#374151] dark:text-[#d1d5db]">
                Submitter email
              </th>
              {fieldColumns.map((f) => (
                <th
                  key={f.id}
                  className="whitespace-nowrap px-4 py-3 font-semibold text-[#374151] dark:text-[#d1d5db]"
                >
                  {f.label?.trim() || f.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => {
              const data = (sub.data as Record<string, unknown>) ?? {};
              return (
                <tr
                  key={sub.id}
                  className="border-b border-[#e5e7eb] dark:border-[#374151] last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-[#171717] dark:text-[#f9fafb]">
                    {formatDate(sub.submittedAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#171717] dark:text-[#f9fafb]">
                    {sub.submitterName ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#171717] dark:text-[#f9fafb]">
                    {sub.submitterEmail ?? "—"}
                  </td>
                  {fieldColumns.map((f) => {
                    const value = data[f.id];
                    const isFile = f.type === "file" && isFileUrl(value);
                    return (
                      <td
                        key={f.id}
                        className="max-w-[280px] px-4 py-3 text-[#171717] dark:text-[#f9fafb] break-words"
                      >
                        {isFile && typeof value === "string" ? (
                          <a
                            href={value.startsWith("http") ? value : value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                            style={{ color: "var(--unipod-blue)" }}
                          >
                            View file
                          </a>
                        ) : (
                          cellValue(value)
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
