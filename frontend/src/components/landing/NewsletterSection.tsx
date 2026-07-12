"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section
      id="newsletter"
      className="section-container pb-20 sm:pb-28"
      aria-labelledby="newsletter-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-primary-200/50 bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600 p-10 shadow-glow-primary sm:p-16 dark:border-primary-700/30"
      >
        {/* Background pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-white/20" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
          {/* Left */}
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-white/80" aria-hidden="true" />
              <span className="text-sm font-semibold text-white/80 uppercase tracking-wide">
                Newsletter
              </span>
            </div>
            <h2
              id="newsletter-heading"
              className="mt-3 font-display text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Stay ahead of the curve
            </h2>
            <p className="mt-3 text-pretty text-base text-white/75">
              Get product updates, new templates, AI generation tips, and early access to new features.
              No spam — unsubscribe anytime.
            </p>
          </div>

          {/* Right: Form */}
          <div>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-white/15 p-6 text-center backdrop-blur-sm"
              >
                <div className="text-2xl">🎉</div>
                <p className="mt-2 text-base font-semibold text-white">
                  You&apos;re subscribed!
                </p>
                <p className="mt-1 text-sm text-white/75">
                  Check your inbox to confirm your email.
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 sm:flex-row"
                aria-label="Newsletter subscription form"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 flex-1 rounded-xl border-white/20 bg-white/15 text-white placeholder:text-white/50 backdrop-blur-sm focus-visible:ring-white/50 dark:bg-white/10"
                  autoComplete="email"
                />
                <Button
                  type="submit"
                  className="h-12 rounded-xl bg-white px-6 font-semibold text-primary-600 hover:bg-white/90"
                >
                  Subscribe
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </form>
            )}
            <p className="mt-3 text-xs text-white/60">
              By subscribing, you agree to our privacy policy. We respect your inbox.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
