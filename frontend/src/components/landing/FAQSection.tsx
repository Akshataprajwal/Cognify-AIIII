"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What kind of code does Cognify-AI generate?",
    a: "Cognify-AI generates frontend-only code: React components, HTML, CSS, Tailwind CSS, and TypeScript. It never produces backend code, database schemas, or server logic — every output is immediately previewable in the browser.",
  },
  {
    q: "Do I need to set up a backend to use the generated code?",
    a: "No backend is required. All generated UI is rendered directly in the built-in live preview using Sandpack. You can also export and paste it into your own project without any server setup.",
  },
  {
    q: "Which frameworks does the output support?",
    a: "You can export generated code as React (functional components + hooks), Next.js UI components, or plain HTML/CSS/JavaScript. Tailwind CSS is supported in all formats.",
  },
  {
    q: "Can I edit the generated code directly?",
    a: "Yes. The Monaco editor (the same engine powering VS Code) is built into the workspace. You can refine any generated file, run follow-up prompts, and see changes reflected in the live preview instantly.",
  },
  {
    q: "Is dark mode supported in the generated output?",
    a: "Absolutely. All generated components include dark mode variants by default, following Tailwind's dark: utility class convention. Your generated UI looks great in any theme.",
  },
  {
    q: "How many projects can I have on the Free plan?",
    a: "The Free plan includes 3 active projects and 50 AI generations per month. Upgrade to Pro for unlimited projects and generations.",
  },
  {
    q: "Is there a team or collaboration plan?",
    a: "Yes — the Enterprise plan includes shared workspaces, team member management, and SSO integration. Contact our sales team to discuss your requirements.",
  },
  {
    q: "Can I export the project as a ZIP file?",
    a: "ZIP export is available on the Pro and Enterprise plans. It packages your entire project's generated files into a structured, ready-to-use archive.",
  },
] as const;

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="section-container py-20 sm:py-28"
      aria-labelledby="faq-heading"
    >
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
            FAQ
          </span>
          <h2
            id="faq-heading"
            className="mt-3 font-display text-balance text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Questions, answered
          </h2>
          <p className="mt-4 text-pretty text-lg text-gray-600 dark:text-gray-300">
            Everything you need to know before getting started with Cognify-AI.
          </p>
        </motion.div>
      </div>

      {/* Accordion */}
      <div className="mx-auto mt-16 max-w-3xl space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className={cn(
                "overflow-hidden rounded-2xl border transition-colors duration-200",
                isOpen
                  ? "border-primary-200/70 bg-primary-50/60 dark:border-primary-800/40 dark:bg-primary-950/30"
                  : "border-gray-200/70 bg-white/80 dark:border-gray-700/50 dark:bg-gray-900/70"
              )}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
                id={`faq-question-${i}`}
              >
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {faq.q}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors",
                    isOpen
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  )}
                  aria-hidden="true"
                >
                  <Plus className="h-3.5 w-3.5" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-question-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
