"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ava Chen",
    role: "Frontend Lead",
    company: "NovaLabs",
    quote:
      "Cognify-AI cut our prototyping time in half. The generated components are genuinely production-ready — not throwaway demos.",
    rating: 5,
    initials: "AC",
    color: "hsl(230 70% 55%)",
  },
  {
    name: "Noah Patel",
    role: "Product Engineer",
    company: "PixelWorks",
    quote:
      "I went from idea to a working UI in 90 seconds. The live preview is instant and the Tailwind output is exactly what I'd write myself.",
    rating: 5,
    initials: "NP",
    color: "hsl(280 70% 55%)",
  },
  {
    name: "Sophia Martinez",
    role: "Design Systems Lead",
    company: "DesignForge",
    quote:
      "Finally, an AI tool that respects component architecture. Everything it generates integrates cleanly into our design system.",
    rating: 5,
    initials: "SM",
    color: "hsl(190 70% 45%)",
  },
  {
    name: "Ethan Wright",
    role: "Founder",
    company: "AppSprout",
    quote:
      "We replaced three days of frontend scaffolding with an afternoon of Cognify-AI sessions. Incredible leverage for a small team.",
    rating: 5,
    initials: "EW",
    color: "hsl(340 70% 55%)",
  },
  {
    name: "Lena Hoffman",
    role: "UX Engineer",
    company: "CloudNine",
    quote:
      "The dark mode support is automatic, the accessibility is baked in, and the animations are smooth. This is the future of UI work.",
    rating: 5,
    initials: "LH",
    color: "hsl(145 60% 45%)",
  },
  {
    name: "James Liu",
    role: "Senior Developer",
    company: "BrightStack",
    quote:
      "The Monaco editor integration means I can tweak the output without leaving the platform. Seamless workflow from start to export.",
    rating: 5,
    initials: "JL",
    color: "hsl(30 70% 50%)",
  },
] as const;

export function TestimonialsSection() {
  return (
    <section
      className="section-container py-20 sm:py-28"
      aria-labelledby="testimonials-heading"
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
            Testimonials
          </span>
          <h2
            id="testimonials-heading"
            className="mt-3 font-display text-balance text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Loved by builders worldwide
          </h2>
          <p className="mt-4 text-pretty text-lg text-gray-600 dark:text-gray-300">
            Join thousands of developers and designers already shipping faster with Cognify-AI.
          </p>
        </motion.div>
      </div>

      {/* Testimonial grid */}
      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.blockquote
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="flex flex-col gap-4 rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-card backdrop-blur-sm transition-shadow duration-300 hover:shadow-card-hover dark:border-gray-700/50 dark:bg-gray-900/70 card-glow"
          >
            {/* Stars */}
            <div className="flex gap-1" aria-label={`${t.rating} out of 5 stars`}>
              {Array.from({ length: t.rating }).map((_, si) => (
                <Star
                  key={si}
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* Quote */}
            <p className="flex-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Author */}
            <footer className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: t.color }}
                aria-hidden="true"
              >
                {t.initials}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t.role} · {t.company}
                </div>
              </div>
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </section>
  );
}
