"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type FormFieldDef = {
  id: string;
  type: "text" | "email" | "textarea" | "number" | "select" | "file";
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  accept?: string;
};

const FIELD_TYPES: { value: FormFieldDef["type"]; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "email", label: "Email" },
  { value: "textarea", label: "Long text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
  { value: "file", label: "File upload" },
];

const DEFAULT_FILE_ACCEPT = ".pdf,.doc,.docx,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp";

type CallFormData = {
  title: string;
  type: "PROJECT" | "APPLICATION" | "COMPETITION" | "EVENT";
  summary: string;
  description: string;
  imageUrl: string;
  deadline: string;
  published: boolean;
  formSchema: FormFieldDef[];
};

const defaultField = (): FormFieldDef => ({
  id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  type: "text",
  label: "",
  required: false,
  placeholder: "",
});

export function CallFormEditor({
  callId,
  initial,
}: {
  callId: string | null;
  initial: Partial<CallFormData> | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CallFormData>(() => ({
    title: initial?.title ?? "",
    type: initial?.type ?? "APPLICATION",
    summary: initial?.summary ?? "",
    description: initial?.description ?? "",
    imageUrl: initial?.imageUrl ?? "",
    deadline: initial?.deadline
      ? new Date(initial.deadline).toISOString().slice(0, 16)
      : "",
    published: initial?.published ?? false,
    formSchema: Array.isArray(initial?.formSchema) && initial.formSchema.length > 0
      ? (initial.formSchema as FormFieldDef[])
      : [defaultField()],
  }));
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);

  function updateForm(updates: Partial<CallFormData>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  function updateFormSchema(updater: (prev: FormFieldDef[]) => FormFieldDef[]) {
    setForm((prev) => ({ ...prev, formSchema: updater(prev.formSchema) }));
  }

  function addField() {
    updateFormSchema((prev) => [...prev, defaultField()]);
  }

  function removeField(index: number) {
    updateFormSchema((prev) => prev.filter((_, i) => i !== index));
  }

  function updateField(index: number, updates: Partial<FormFieldDef>) {
    updateFormSchema((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  }

  async function handlePublish(published: boolean) {
    if (!callId) return;
    setPublishLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/calls/${callId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Failed to update");
        return;
      }
      updateForm({ published });
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setPublishLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        summary: form.summary.trim(),
        description: form.description.trim() || undefined,
        imageUrl: form.imageUrl.trim() || null,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        published: form.published,
        formSchema: form.formSchema
          .filter((f) => f.label.trim())
          .map((f) => ({
            id: f.id,
            type: f.type,
            label: f.label.trim(),
            required: f.required ?? false,
            placeholder: f.placeholder?.trim() || undefined,
            options: f.type === "select" && f.options?.length ? f.options : undefined,
            accept: f.type === "file" ? (f.accept?.trim() || DEFAULT_FILE_ACCEPT) : undefined,
          })),
      };
      const url = callId ? `/api/admin/calls/${callId}` : "/api/admin/calls";
      const method = callId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = typeof data.error === "string"
          ? data.error
          : data.error?.title?.[0] ?? data.error?.message ?? "Failed to save";
        setError(errMsg);
        setSaving(false);
        return;
      }
      const data = await res.json();
      router.push("/dashboard/admin/calls");
      router.refresh();
    } catch {
      setError("Network error");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div className="rounded-xl border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#171717] dark:text-[#f9fafb]">
          Basic info
        </h2>
        <div>
          <label className="block text-sm font-medium text-[#374151] dark:text-[#d1d5db] mb-1">
            Title
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => updateForm({ title: e.target.value })}
            className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-2 text-[#171717] dark:text-[#f9fafb] focus:ring-2 focus:ring-[var(--unipod-blue)]"
            placeholder="e.g. Project-based program applications"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#374151] dark:text-[#d1d5db] mb-1">
            Type
          </label>
          <select
            value={form.type}
            onChange={(e) => updateForm({ type: e.target.value as CallFormData["type"] })}
            className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-2 text-[#171717] dark:text-[#f9fafb] focus:ring-2 focus:ring-[var(--unipod-blue)]"
          >
            <option value="PROJECT">Project</option>
            <option value="APPLICATION">Application</option>
            <option value="COMPETITION">Competition</option>
            <option value="EVENT">Event</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#374151] dark:text-[#d1d5db] mb-1">
            Summary (shown on homepage card)
          </label>
          <input
            type="text"
            required
            value={form.summary}
            onChange={(e) => updateForm({ summary: e.target.value })}
            className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-2 text-[#171717] dark:text-[#f9fafb] focus:ring-2 focus:ring-[var(--unipod-blue)]"
            placeholder="Short description for the Calls section"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#374151] dark:text-[#d1d5db] mb-1">
            Description (optional, shown on apply page)
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-2 text-[#171717] dark:text-[#f9fafb] focus:ring-2 focus:ring-[var(--unipod-blue)]"
            placeholder="Longer instructions for applicants"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#374151] dark:text-[#d1d5db] mb-1">
            Photo / Flyer (optional)
          </label>
          <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mb-2">
            Upload an image or PDF flyer for this call, or paste an image URL. Shown on the homepage and apply page.
          </p>
          <div className="flex flex-wrap items-start gap-3">
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.gif,.webp,.pdf"
              disabled={uploadingImage}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingImage(true);
                try {
                  setError("");
                  const fd = new FormData();
                  fd.append("file", file);
                  fd.append("type", "call");
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setError(data.error ?? "Upload failed");
                    return;
                  }
                  const fileUrl = data.fileUrl;
                  if (fileUrl) {
                    updateForm({ imageUrl: fileUrl });
                    setUploadedFilename(file.name);
                  } else {
                    setError("Upload did not return a URL");
                  }
                } catch {
                  setError("Upload failed");
                } finally {
                  setUploadingImage(false);
                  e.target.value = "";
                }
              }}
              className="rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-[var(--unipod-blue)] file:px-3 file:py-1 file:text-white file:text-sm"
            />
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => updateForm({ imageUrl: e.target.value })}
              placeholder="Or paste image/flyer URL or path (e.g. /api/upload/serve/call-flyer/...)"
              className="flex-1 min-w-[200px] rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-2 text-sm text-[#171717] dark:text-[#f9fafb] focus:ring-2 focus:ring-[var(--unipod-blue)]"
            />
            {form.imageUrl && (
              <button
                type="button"
                onClick={() => { updateForm({ imageUrl: "" }); setUploadedFilename(null); }}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {uploadingImage && (
            <p className="mt-2 text-sm text-[#6b7280] dark:text-[#9ca3af]">Uploading…</p>
          )}
          {uploadedFilename && form.imageUrl && (
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">Uploaded: {uploadedFilename}</p>
          )}
          {form.imageUrl && !uploadingImage && (
            <div className="mt-2">
              {form.imageUrl.toLowerCase().endsWith(".pdf") ? (
                <a
                  href={form.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--unipod-blue)] hover:underline"
                >
                  View PDF flyer
                </a>
              ) : (
                <img
                  src={form.imageUrl}
                  alt="Call flyer preview"
                  className="max-h-40 rounded-lg border border-[#e5e7eb] dark:border-[#374151] object-contain bg-[#f9fafb] dark:bg-[#111827]"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#374151] dark:text-[#d1d5db] mb-1">
            Deadline (optional)
          </label>
          <input
            type="datetime-local"
            value={form.deadline}
            onChange={(e) => updateForm({ deadline: e.target.value })}
            className="w-full rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-2 text-[#171717] dark:text-[#f9fafb] focus:ring-2 focus:ring-[var(--unipod-blue)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={form.published}
            onChange={(e) => updateForm({ published: e.target.checked })}
            className="rounded border-[#e5e7eb] dark:border-[#374151]"
          />
          <label htmlFor="published" className="text-sm text-[#374151] dark:text-[#d1d5db]">
            Publish on homepage (visible in Calls section)
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#171717] dark:text-[#f9fafb]">
            Application form fields
          </h2>
          <button
            type="button"
            onClick={addField}
            className="rounded-lg px-3 py-1.5 text-sm font-medium border"
            style={{
              borderColor: "var(--unipod-blue)",
              color: "var(--unipod-blue)",
            }}
          >
            + Add field
          </button>
        </div>
        <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
          Define the fields applicants will fill. At least one field with a label is required.
        </p>
        <div className="space-y-4">
          {form.formSchema.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-wrap items-start gap-3 rounded-lg border border-[#e5e7eb] dark:border-[#374151] p-4"
            >
              <select
                value={field.type}
                onChange={(e) =>
                  updateField(index, { type: e.target.value as FormFieldDef["type"] })
                }
                className="rounded border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-2 py-1.5 text-sm"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                placeholder="Field label"
                className="flex-1 min-w-[120px] rounded border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-1.5 text-sm"
              />
              <label className="flex items-center gap-1.5 text-sm text-[#6b7280] dark:text-[#9ca3af]">
                <input
                  type="checkbox"
                  checked={field.required ?? false}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                  className="rounded"
                />
                Required
              </label>
              {field.type !== "select" && field.type !== "file" && (
                <input
                  type="text"
                  value={field.placeholder ?? ""}
                  onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  placeholder="Placeholder (optional)"
                  className="flex-1 min-w-[120px] rounded border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-1.5 text-sm"
                />
              )}
              {field.type === "select" && (
                <input
                  type="text"
                  value={(field.options ?? []).join(", ")}
                  onChange={(e) =>
                    updateField(index, {
                      options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Options (comma-separated)"
                  className="flex-1 min-w-[160px] rounded border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-1.5 text-sm"
                />
              )}
              {field.type === "file" && (
                <input
                  type="text"
                  value={field.accept ?? DEFAULT_FILE_ACCEPT}
                  onChange={(e) => updateField(index, { accept: e.target.value })}
                  placeholder="Accepted extensions (e.g. .pdf,.doc,.docx,.pptx,.png,.jpg)"
                  className="flex-1 min-w-[200px] rounded border border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] px-3 py-1.5 text-sm"
                />
              )}
              <button
                type="button"
                onClick={() => removeField(index)}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: "var(--unipod-blue)" }}
        >
          {saving ? "Saving…" : callId ? "Save changes" : "Create form"}
        </button>
        {callId && (
          <>
            {!form.published ? (
              <button
                type="button"
                disabled={publishLoading || saving}
                onClick={() => handlePublish(true)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: "var(--ursu-navy)" }}
              >
                {publishLoading ? "Updating…" : "Publish"}
              </button>
            ) : (
              <button
                type="button"
                disabled={publishLoading || saving}
                onClick={() => handlePublish(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium border border-[#e5e7eb] dark:border-[#374151] text-[#374151] dark:text-[#d1d5db] disabled:opacity-50"
              >
                {publishLoading ? "Updating…" : "Unpublish"}
              </button>
            )}
            <Link
              href={`/apply/${callId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-4 py-2 text-sm font-medium border border-[#e5e7eb] dark:border-[#374151] text-[#374151] dark:text-[#d1d5db] hover:bg-[var(--sidebar-bg)]"
            >
              Preview
            </Link>
            <Link
              href={`/dashboard/admin/calls/${callId}/submissions`}
              className="rounded-lg px-4 py-2 text-sm font-medium border border-[#e5e7eb] dark:border-[#374151] text-[#374151] dark:text-[#d1d5db] hover:bg-[var(--sidebar-bg)]"
            >
              View submissions
            </Link>
          </>
        )}
        <Link
          href="/dashboard/admin/calls"
          className="rounded-lg px-4 py-2 text-sm font-medium border border-[#e5e7eb] dark:border-[#374151] text-[#374151] dark:text-[#d1d5db] hover:bg-[var(--sidebar-bg)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
