"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { URSULogo } from "@/components/URSULogo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-[var(--unipod-blue-light)] bg-white p-8 shadow-sm">
      <div className="flex justify-center mb-4">
        <URSULogo className="h-14 w-auto object-contain" alt="URSU" />
      </div>
      <div className="flex justify-center mb-2">
        <span className="text-2xl font-bold" style={{ color: "var(--unipod-blue)" }}>URSU</span>
        <span className="text-2xl font-bold" style={{ color: "var(--ursu-navy, #1a237e)" }}> PROJECTS</span>
      </div>
      <p className="text-xs uppercase tracking-wide text-center mb-6" style={{ color: "var(--ursu-navy, #1a237e)", opacity: 0.85 }}>
        University of Rwanda Students&apos; Union
      </p>
      <h1 className="text-xl font-semibold text-center mb-6" style={{ color: "var(--foreground)" }}>
        Sign in to dashboard
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[var(--unipod-blue)] focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#374151] mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[var(--unipod-blue)] focus:border-transparent"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-white font-medium rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--unipod-blue)" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[#6b7280]">
        <Link href="/" className="hover:underline" style={{ color: "var(--unipod-blue)" }}>
          Back to home
        </Link>
      </p>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-[var(--unipod-blue-light)] bg-white p-8 shadow-sm">
      <div className="flex justify-center mb-4">
        <URSULogo className="h-14 w-auto object-contain" alt="URSU" />
      </div>
      <div className="flex justify-center mb-2">
        <span className="text-2xl font-bold" style={{ color: "var(--unipod-blue)" }}>URSU</span>
        <span className="text-2xl font-bold" style={{ color: "var(--ursu-navy, #1a237e)" }}> PROJECTS</span>
      </div>
      <p className="text-xs uppercase tracking-wide text-center mb-6" style={{ color: "var(--ursu-navy, #1a237e)", opacity: 0.85 }}>
        University of Rwanda Students&apos; Union
      </p>
      <h1 className="text-xl font-semibold text-center mb-6" style={{ color: "var(--foreground)" }}>
        Sign in to dashboard
      </h1>
      <div className="flex justify-center py-8 text-[#6b7280]">Loading…</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--sidebar-bg)]">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
