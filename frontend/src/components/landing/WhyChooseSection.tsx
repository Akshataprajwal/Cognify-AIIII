"use client";

import { motion } from "framer-motion";
import { Zap, Code2, Lock, Palette, RefreshCw, Users } from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "Blazing Fast Generation",
    description:
      "Purpose-built pipeline delivers your UI code in under two seconds — iterate without waiting.",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    icon: Code2,
    title: "Clean, Maintainable Code",
    description:
      "No bloated output. Every component is readable, semantic, and ready to paste into your codebase.",
    iconBg: "bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400",
  },
  {
    icon: Lock,
    title: "Frontend-Only Output",
    description:
      "Our AI is constrained to generate only UI code. No accidental backend scaffolding, ever.",
    iconBg: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    icon: Palette,
    title: "Theme-Aware Design",
    description:
      "Every generated UI supports dark and light mode automatically. Consistent across all components.",
    iconBg: "bg-secondary-100 text-secondary-600 dark:bg-secondary-900/40 dark:text-secondary-400",
  },
  {
    icon: RefreshCw,
    title: "Iterative Refinement",
    description:
      "Follow-up prompts modify existing code, not start over. Your context is preserved between iterations.",
    iconBg: "bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400",
  },
  {
    icon: Users,
    title: "Built for Teams",
    description:
      "Share projects, organize by workspace, and collaborate on UI generation across your entire team.",
    iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  },
] as const;

export function WhyChooseSection() {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-28"
      aria-labelledby="why-heading"
    >
      {/* Subtle background */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-50/60 via-transparent to-secondary-50/40 dark:from-primary-950/20 dark:via-transparent dark:to-secondary-950/20"
        aria-hidden="true"
      />

      <div className="section-container relative">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
              Why Cognify-AI
            </span>
            <h2
              id="why-heading"
              className="mt-3 font-display text-balance text-4xl font-bold tracking-tight sm:text-5xl"
            >
              Built differently, for teams who care about quality
            </h2>
            <p className="mt-4 text-pretty text-lg text-gray-600 dark:text-gray-300">
              Premium output is more than pretty pixels — it&apos;s clean architecture,
              predictable behavior, and code you can actually ship.
            </p>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, i) => (
            <motion.article
              key={reason.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="flex gap-4 rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-card backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/70 card-glow transition-shadow duration-300 hover:shadow-card-hover"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${reason.iconBg}`}
              >
                <reason.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {reason.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {reason.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
