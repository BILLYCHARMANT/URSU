import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { URSULogo } from "@/components/URSULogo";
import { getPublicNews, getPublicCalls } from "@/lib/public-home-data";

const callTypeLabels: Record<string, string> = {
  PROJECT: "Project",
  APPLICATION: "Application",
  COMPETITION: "Competition",
  EVENT: "Event",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const [news, calls] = await Promise.all([getPublicNews(10), getPublicCalls(10)]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:outline-none focus:ring-2"
        style={{ backgroundColor: "var(--unipod-blue)", color: "white" }}
      >
        Skip to main content
      </a>

      {/* Header: global nav for every visitor */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: "var(--background)",
          borderColor: "var(--unipod-blue-light)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="URSU Projects home">
            <URSULogo className="h-9 w-auto object-contain" alt="" />
            <span className="text-lg font-bold" style={{ color: "var(--unipod-blue)" }}>
              URSU
            </span>
            <span className="text-lg font-bold hidden sm:inline" style={{ color: "var(--ursu-navy)" }}>
              {" "}
              PROJECTS
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
            <Link
              href="/#news"
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:opacity-90"
              style={{ color: "var(--foreground)" }}
            >
              News
            </Link>
            <Link
              href="/#calls"
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:opacity-90"
              style={{ color: "var(--foreground)" }}
            >
              Calls
            </Link>
            {session?.user ? (
              <Link
                href="/dashboard"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-95"
                style={{ backgroundColor: "var(--unipod-blue)" }}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-95"
                style={{ backgroundColor: "var(--unipod-blue)" }}
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1 flex flex-col" tabIndex={-1}>
        {/* Hero */}
        <section
          className="px-4 py-12 sm:py-16 sm:px-6"
          style={{ backgroundColor: "var(--unipod-blue-light)" }}
          aria-labelledby="hero-heading"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h1 id="hero-heading" className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              <span style={{ color: "var(--unipod-blue)" }}>URSU</span>
              <span style={{ color: "var(--ursu-navy)" }}> PROJECTS</span>
            </h1>
            <p
              className="mt-2 text-sm font-medium uppercase tracking-widest sm:text-base"
              style={{ color: "var(--ursu-navy)", opacity: 0.9 }}
            >
              University of Rwanda Students&apos; Union
            </p>
            <p className="mt-4 text-lg text-balance" style={{ color: "var(--foreground)" }}>
              Your place for <strong>news</strong>, <strong>open calls</strong>, project-based competition, progress
              tracking, and certification.
            </p>
            <p className="mt-1 text-sm italic" style={{ color: "var(--unipod-yellow)" }}>
              Strive for a golden future.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <a
                href="#news"
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-95"
                style={{
                  backgroundColor: "var(--unipod-blue)",
                  color: "white",
                }}
              >
                Latest news
              </a>
              <a
                href="#calls"
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium border-2 transition-opacity hover:opacity-95"
                style={{
                  borderColor: "var(--unipod-blue)",
                  color: "var(--unipod-blue)",
                  backgroundColor: "transparent",
                }}
              >
                Open calls
              </a>
              {!session?.user && (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
                  style={{ backgroundColor: "var(--ursu-navy)" }}
                >
                  Sign in to dashboard
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* News */}
        <section
          id="news"
          className="scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16"
          style={{ backgroundColor: "var(--background)" }}
          aria-labelledby="news-heading"
        >
          <div className="mx-auto max-w-4xl">
            <h2 id="news-heading" className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--ursu-navy)" }}>
              Latest news
            </h2>
            <p className="mt-1 text-sm sm:text-base" style={{ color: "var(--foreground)", opacity: 0.85 }}>
              Updates and announcements from URSU Projects.
            </p>
            {news.length === 0 ? (
              <p className="mt-8 rounded-xl border border-dashed py-12 text-center text-sm" style={{ borderColor: "var(--unipod-blue-light)", color: "var(--foreground)" }}>
                No news at the moment. Check back later.
              </p>
            ) : (
              <ul className="mt-8 space-y-6" role="list">
                {news.map((item) => (
                  <li key={item.id}>
                    <article
                      className="rounded-xl border p-5 sm:p-6 transition-shadow hover:shadow-md"
                      style={{
                        borderColor: "var(--unipod-blue-light)",
                        backgroundColor: "var(--background)",
                      }}
                    >
                      <time
                        className="text-xs font-medium uppercase tracking-wide"
                        style={{ color: "var(--unipod-blue)" }}
                        dateTime={item.date}
                      >
                        {item.dateFormatted}
                      </time>
                      <h3 className="mt-2 text-lg font-semibold" style={{ color: "var(--ursu-navy)" }}>
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.9 }}>
                        {item.summary}
                      </p>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Calls */}
        <section
          id="calls"
          className="scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16"
          style={{ backgroundColor: "var(--unipod-blue-light)" }}
          aria-labelledby="calls-heading"
        >
          <div className="mx-auto max-w-4xl">
            <h2 id="calls-heading" className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--ursu-navy)" }}>
              Open calls
            </h2>
            <p className="mt-1 text-sm sm:text-base" style={{ color: "var(--foreground)", opacity: 0.9 }}>
              Projects, applications, and competitions you can join. Sign in to apply or enroll.
            </p>
            {calls.length === 0 ? (
              <p className="mt-8 rounded-xl border border-dashed py-12 text-center text-sm" style={{ borderColor: "var(--unipod-blue)", color: "var(--foreground)" }}>
                No open calls at the moment. Check back later.
              </p>
            ) : (
              <ul className="mt-8 grid gap-6 sm:grid-cols-2" role="list">
                {calls.map((item) => (
                  <li key={item.id}>
                    <article
                      className="flex h-full flex-col rounded-xl border overflow-hidden transition-shadow hover:shadow-md"
                      style={{
                        borderColor: "var(--unipod-blue)",
                        backgroundColor: "var(--background)",
                      }}
                    >
                      {item.imageUrl && (
                        <div className="w-full aspect-video bg-[#e5e7eb] dark:bg-[#374151] shrink-0">
                          {item.imageUrl.toLowerCase().endsWith(".pdf") ? (
                            <a
                              href={item.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center h-full text-sm font-medium"
                              style={{ color: "var(--unipod-blue)" }}
                            >
                              View PDF flyer
                            </a>
                          ) : (
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      )}
                      <div className="flex flex-col flex-1 p-5 sm:p-6">
                      <span
                        className="inline-block w-fit rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: "var(--unipod-yellow-bg)",
                          color: "var(--ursu-navy)",
                          border: "1px solid var(--unipod-yellow)",
                        }}
                      >
                        {callTypeLabels[item.type] ?? item.type}
                      </span>
                      <h3 className="mt-3 text-lg font-semibold" style={{ color: "var(--ursu-navy)" }}>
                        {item.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.9 }}>
                        {item.summary}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--foreground)", opacity: 0.8 }}>
                        <span>Posted {item.dateFormatted}</span>
                        {item.deadlineFormatted && (
                          <span>
                            Deadline: <strong>{item.deadlineFormatted}</strong>
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={`/apply/${item.id}`}
                          className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-95"
                          style={{ backgroundColor: "var(--unipod-blue)" }}
                        >
                          Apply →
                        </Link>
                        {session?.user ? (
                          <Link
                            href="/dashboard"
                            className="inline-flex items-center text-sm font-medium hover:underline"
                            style={{ color: "var(--unipod-blue)" }}
                          >
                            Dashboard
                          </Link>
                        ) : (
                          <Link
                            href="/login"
                            className="inline-flex items-center text-sm font-medium hover:underline"
                            style={{ color: "var(--unipod-blue)" }}
                          >
                            Sign in
                          </Link>
                        )}
                      </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* What we offer */}
        <section
          className="px-4 py-12 sm:px-6 sm:py-16"
          style={{ backgroundColor: "var(--background)" }}
          aria-labelledby="offer-heading"
        >
          <div className="mx-auto max-w-5xl">
            <h2 id="offer-heading" className="text-center text-2xl font-bold sm:text-3xl" style={{ color: "var(--ursu-navy)" }}>
              What we offer
            </h2>
            <p className="mt-2 text-center text-balance text-sm sm:text-base" style={{ color: "var(--foreground)", opacity: 0.9 }}>
              One platform for competitions, learning, and credentials.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <div
                className="rounded-2xl border p-6 text-center"
                style={{ borderColor: "var(--unipod-blue-light)" }}
              >
                <div
                  className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "var(--unipod-blue-light)" }}
                >
                  <svg className="h-5 w-5" style={{ color: "var(--unipod-blue)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold" style={{ color: "var(--ursu-navy)" }}>Project competitions</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.85 }}>
                  Join programs, complete modules and assignments, and get evaluated by mentors.
                </p>
              </div>
              <div
                className="rounded-2xl border p-6 text-center"
                style={{ borderColor: "var(--unipod-blue-light)" }}
              >
                <div
                  className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "var(--unipod-blue-light)" }}
                >
                  <svg className="h-5 w-5" style={{ color: "var(--unipod-blue)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold" style={{ color: "var(--ursu-navy)" }}>Progress tracking</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.85 }}>
                  Track progress, feedback, grades, and deadlines in one place.
                </p>
              </div>
              <div
                className="rounded-2xl border p-6 text-center"
                style={{ borderColor: "var(--unipod-blue-light)" }}
              >
                <div
                  className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "var(--unipod-yellow-bg)" }}
                >
                  <svg className="h-5 w-5" style={{ color: "var(--unipod-yellow)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold" style={{ color: "var(--ursu-navy)" }}>Certification</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.85 }}>
                  Earn and download certificates when you complete programs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="px-4 py-12 sm:px-6 sm:py-16"
          style={{ backgroundColor: "var(--unipod-blue-light)" }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xl font-bold sm:text-2xl" style={{ color: "var(--ursu-navy)" }}>
              Ready to get started?
            </h2>
            <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--foreground)", opacity: 0.9 }}>
              {session?.user
                ? "Go to your dashboard to access programs and submissions."
                : "Sign in with your URSU account to see your dashboard, enroll in programs, and submit work."}
            </p>
            {session?.user ? (
              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-95"
                style={{ backgroundColor: "var(--unipod-blue)" }}
              >
                Open dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="mt-6 inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-95"
                style={{ backgroundColor: "var(--unipod-blue)" }}
              >
                Sign in
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="border-t py-8 px-4 sm:px-6"
        style={{
          borderColor: "var(--unipod-blue-light)",
          backgroundColor: "var(--background)",
        }}
      >
        <div className="mx-auto max-w-6xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <URSULogo className="h-7 w-auto object-contain" alt="" />
              <span className="font-semibold" style={{ color: "var(--unipod-blue)" }}>
                URSU PROJECTS
              </span>
            </div>
            <p className="text-sm text-center sm:text-right" style={{ color: "var(--foreground)", opacity: 0.8 }}>
              University of Rwanda Students&apos; Union — Strive for a golden future.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 text-sm">
            <a href="#" className="hover:underline" style={{ color: "var(--unipod-blue)" }}>
              Back to top
            </a>
            <Link href="/#news" className="hover:underline" style={{ color: "var(--unipod-blue)" }}>
              News
            </Link>
            <Link href="/#calls" className="hover:underline" style={{ color: "var(--unipod-blue)" }}>
              Calls
            </Link>
            <Link href="/login" className="hover:underline" style={{ color: "var(--unipod-blue)" }}>
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
