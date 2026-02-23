"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormField = {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  accept?: string;
};

export function ApplyFormClient({
  callId,
  formSchema,
  user,
}: {
  callId: string;
  formSchema: FormField[];
  user?: { name?: string; email?: string };
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Record<string, string | number | File>>(() => {
    const initial: Record<string, string | number | File> = {};
    if (user?.name) initial["_submitterName"] = user.name;
    if (user?.email) initial["_submitterEmail"] = user.email;
    formSchema.forEach((f) => {
      initial[f.id] = "";
    });
    return initial;
  });

  function updateField(id: string, value: string | number | File) {
    setFormData((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const fileFields = formSchema.filter((f) => f.type === "file");
      for (const field of fileFields) {
        if (field.required) {
          const v = formData[field.id];
          const hasFile = v instanceof File || (typeof v === "string" && v.length > 0);
          if (!hasFile) {
            setError(`Please upload a file for "${field.label}"`);
            setSubmitting(false);
            return;
          }
        }
      }
      const data: Record<string, string | number> = {};
      for (const field of fileFields) {
        const v = formData[field.id];
        if (v instanceof File) {
          const fd = new FormData();
          fd.append("file", v);
          const up = await fetch(`/api/public/calls/${callId}/upload`, {
            method: "POST",
            body: fd,
          });
          if (!up.ok) {
            const err = await up.json().catch(() => ({}));
            setError(err.error ?? "File upload failed");
            setSubmitting(false);
            return;
          }
          const { fileUrl } = await up.json();
          data[field.id] = fileUrl;
        } else if (typeof v === "string" && v) {
          data[field.id] = v;
        }
      }
      formSchema.filter((f) => f.type !== "file").forEach((f) => {
        const v = formData[f.id];
        if (v !== undefined && v !== "" && typeof v !== "object") data[f.id] = v;
      });
      const submitterName =
        (formData["_submitterName"] as string)?.trim() || user?.name || undefined;
      const submitterEmail =
        (formData["_submitterEmail"] as string)?.trim() || user?.email || undefined;
      const res = await fetch(`/api/public/calls/${callId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          ...(submitterName && { submitterName }),
          ...(submitterEmail && { submitterEmail }),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "Submission failed");
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setSubmitting(false);
    } catch {
      setError("Network error");
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div
        className="rounded-xl border-2 p-10 text-center max-w-lg mx-auto"
        style={{
          borderColor: "var(--unipod-blue)",
          backgroundColor: "var(--unipod-blue-light)",
        }}
      >
        <p className="text-4xl mb-4" aria-hidden="true">
          🎉
        </p>
        <h2 className="text-2xl font-bold" style={{ color: "var(--ursu-navy)" }}>
          Congratulations!
        </h2>
        <p className="mt-2 text-base font-medium" style={{ color: "var(--ursu-navy)" }}>
          Your application has been submitted successfully.
        </p>
        <p className="mt-3 text-sm" style={{ color: "var(--foreground)" }}>
          Thank you for applying. We have received your application and will get back to you.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm"
          style={{ backgroundColor: "var(--unipod-blue)" }}
        >
          Back to home
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!user && (
        <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--unipod-blue-light)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--ursu-navy)" }}>
            Your contact (optional)
          </p>
          <div>
            <label className="block text-sm text-[#6b7280] dark:text-[#9ca3af] mb-1">Name</label>
            <input
              type="text"
              value={(formData["_submitterName"] as string) ?? ""}
              onChange={(e) => updateField("_submitterName", e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-2 text-[#171717] dark:text-[#f9fafb] focus:ring-2 focus:ring-[var(--unipod-blue)]"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm text-[#6b7280] dark:text-[#9ca3af] mb-1">Email</label>
            <input
              type="email"
              value={(formData["_submitterEmail"] as string) ?? ""}
              onChange={(e) => updateField("_submitterEmail", e.target.value)}
              className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-2 text-[#171717] dark:text-[#f9fafb] focus:ring-2 focus:ring-[var(--unipod-blue)]"
              placeholder="your@email.com"
            />
          </div>
        </div>
      )}

      <div className="rounded-xl border p-4 space-y-4" style={{ borderColor: "var(--unipod-blue-light)" }}>
        {formSchema.filter((f) => f.label.trim()).map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                required={field.required}
                value={(formData[field.id] as string) ?? ""}
                onChange={(e) => updateField(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-2 text-[#171717] dark:text-[#f9fafb] focus:ring-2 focus:ring-[var(--unipod-blue)]"
              />
            ) : field.type === "select" ? (
              <select
                required={field.required}
                value={(formData[field.id] as string) ?? ""}
                onChange={(e) => updateField(field.id, e.target.value)}
                className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-2 text-[#171717] dark:text-[#f9fafb] focus:ring-2 focus:ring-[var(--unipod-blue)]"
              >
                <option value="">Select…</option>
                {(field.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "file" ? (
              <div className="space-y-1">
                <input
                  type="file"
                  required={field.required}
                  accept={field.accept ?? ".pdf,.doc,.docx,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    updateField(field.id, file ?? "");
                  }}
                  className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-2 text-sm text-[#171717] dark:text-[#f9fafb] focus:ring-2 focus:ring-[var(--unipod-blue)] file:mr-2 file:rounded file:border-0 file:bg-[var(--unipod-blue)] file:px-3 file:py-1 file:text-white file:text-sm"
                />
                {(formData[field.id] instanceof File || (typeof formData[field.id] === "string" && formData[field.id])) && (
                  <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
                    {formData[field.id] instanceof File
                      ? (formData[field.id] as File).name
                      : "File uploaded"}
                  </p>
                )}
              </div>
            ) : (
              <input
                type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
                required={field.required}
                value={(formData[field.id] as string | number) ?? ""}
                onChange={(e) =>
                  updateField(
                    field.id,
                    field.type === "number" ? (e.target.value ? Number(e.target.value) : "") : e.target.value
                  )
                }
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-2 text-[#171717] dark:text-[#f9fafb] focus:ring-2 focus:ring-[var(--unipod-blue)]"
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-50"
        style={{ backgroundColor: "var(--unipod-blue)" }}
      >
        {submitting ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
