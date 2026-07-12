"use client";

import { motion } from "framer-motion";
import { MessageSquarePlus, Cpu, Eye, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquarePlus,
    title: "Write Your Prompt",
    description:
      "Describe what you want in plain English — 'a pricing table with three tiers', 'a hero section with gradient', or anything you can imagine.",
    iconBg: "bg-primary-600",
    connector: true,
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Generates Code",
    description:
      "Our AI instantly produces clean, semantic React or HTML code with Tailwind CSS styling — structured for real projects, not demos.",
    iconBg: "bg-secondary-600",
    connector: true,
  },
  {
    number: "03",
    icon: Eye,
    title: "Preview & Iterate",
    description:
      "See your UI rendered live in the browser. Refine with follow-up prompts or edit directly in the Monaco editor.",
    iconBg: "bg-accent-600",
    connector: true,
  },
  {
    number: "04",
    icon: Download,
    title: "Export & Ship",
    description:
      "Copy to clipboard, download as React / Next.js / HTML, or export a ZIP file. Ready to drop into your real codebase.",
    iconBg: "bg-primary-600",
    connector: false,
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden py-20 sm:py-28"
      aria-labelledby="how-heading"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-50/0 via-primary-50/40 to-gray-50/0 dark:via-primary-950/20" aria-hidden="true" />

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
              How It Works
            </span>
            <h2
              id="how-heading"
              className="mt-3 font-display text-balance text-4xl font-bold tracking-tight sm:text-5xl"
            >
              From idea to working UI in seconds
            </h2>
            <p className="mt-4 text-pretty text-lg text-gray-600 dark:text-gray-300">
              A simple four-step workflow designed to keep you in full control of every pixel.
            </p>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-6 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Connector line (lg screens) */}
              {step.connector && (
                <div
                  className="absolute left-full top-10 hidden w-6 lg:block"
                  aria-hidden="true"
                >
                  <div className="mx-auto mt-0.5 h-0.5 w-full bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600" />
                </div>
              )}

              <div className="flex flex-col gap-5 rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-card backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/70 h-full">
                {/* Number + icon */}
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${step.iconBg} text-white shadow-sm`}
                    aria-hidden="true"
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-4xl font-bold text-gray-100 dark:text-gray-800 select-none">
                    {step.number}
                  </span>
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
