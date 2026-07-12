import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#0a0a0f]">
      {/* Animated background orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[100px]"
      />

      {/* Grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"
      />

      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg">
            C
          </span>
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-2xl font-bold text-transparent">
            Cognify AI
          </span>
        </Link>

        <blockquote className="max-w-md text-center">
          <p className="text-xl font-medium leading-relaxed text-white/80">
            &ldquo;Transform your ideas into stunning interfaces in seconds.
            The future of frontend development is here.&rdquo;
          </p>
          <footer className="mt-6 flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500" />
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Sarah Chen</p>
              <p className="text-xs text-white/50">Lead Designer at TechCorp</p>
            </div>
          </footer>
        </blockquote>

        <div className="mt-16 grid grid-cols-3 gap-6">
          {[
            { label: "Active users", value: "50K+" },
            { label: "UIs generated", value: "2M+" },
            { label: "Time saved", value: "97%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4 text-center backdrop-blur-sm"
            >
              <p className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-2xl font-bold text-transparent">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        {/* Mobile logo */}
        <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
            C
          </span>
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-lg font-bold text-transparent">
            Cognify AI
          </span>
        </Link>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
