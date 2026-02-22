import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CallFormEditor } from "@/components/admin/CallFormEditor";

export const dynamic = "force-dynamic";

export default async function NewCallPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
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
          New application form
        </h1>
        <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mt-1">
          Design the form visitors will see on the homepage under Calls.
        </p>
      </div>
      <CallFormEditor callId={null} initial={null} />
    </div>
  );
}
