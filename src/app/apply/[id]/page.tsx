import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { URSULogo } from "@/components/URSULogo";
import { ApplyFormClient } from "@/components/ApplyFormClient";

const typeLabels: Record<string, string> = {
  PROJECT: "Project",
  APPLICATION: "Application",
  COMPETITION: "Competition",
  EVENT: "Event",
};

export const dynamic = "force-dynamic";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const call = await prisma.call.findFirst({
    where: { id, published: true },
  });
  if (!call) notFound();

  const session = await getServerSession(authOptions);
  const formSchema = (call.formSchema as Array<{
    id: string;
    type: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
  }>) ?? [];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
      <header
        className="border-b px-4 py-3"
        style={{ borderColor: "var(--unipod-blue-light)" }}
      >
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <URSULogo className="h-8 w-auto object-contain" alt="" />
            <span className="font-bold" style={{ color: "var(--unipod-blue)" }}>
              URSU PROJECTS
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm hover:underline"
            style={{ color: "var(--unipod-blue)" }}
          >
            ← Home
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
        <div
          className="rounded-xl border overflow-hidden mb-6"
          style={{ borderColor: "var(--unipod-blue-light)" }}
        >
          {call.imageUrl && (
            <div className="w-full aspect-video bg-[#e5e7eb] dark:bg-[#374151] shrink-0">
              {call.imageUrl.toLowerCase().endsWith(".pdf") ? (
                <a
                  href={call.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-full text-sm font-medium"
                  style={{ color: "var(--unipod-blue)" }}
                >
                  View PDF flyer
                </a>
              ) : (
                <img
                  src={call.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          )}
          <div className="p-6">
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium mb-3"
            style={{
              backgroundColor: "var(--unipod-yellow-bg)",
              color: "var(--ursu-navy)",
              border: "1px solid var(--unipod-yellow)",
            }}
          >
            {typeLabels[call.type] ?? call.type}
          </span>
          <h1 className="text-2xl font-bold" style={{ color: "var(--ursu-navy)" }}>
            {call.title}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--foreground)", opacity: 0.9 }}>
            {call.summary}
          </p>
          {call.description && (
            <div
              className="mt-4 pt-4 border-t text-sm whitespace-pre-wrap"
              style={{ borderColor: "var(--unipod-blue-light)", color: "var(--foreground)" }}
            >
              {call.description}
            </div>
          )}
          {call.deadline && (
            <p className="mt-3 text-xs" style={{ color: "var(--foreground)", opacity: 0.8 }}>
              Deadline:{" "}
              {new Date(call.deadline).toLocaleString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          </div>
        </div>

        <ApplyFormClient
          callId={call.id}
          formSchema={formSchema}
          user={session?.user ? { name: session.user.name ?? undefined, email: session.user.email ?? undefined } : undefined}
        />
      </main>
    </div>
  );
}
