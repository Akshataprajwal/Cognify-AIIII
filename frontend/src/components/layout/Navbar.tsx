"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, useScroll } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string };

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 8));
    return unsub;
  }, [scrollY]);

  useBodyScrollLock(open);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Features", href: "/#features" },
      { label: "Templates", href: "/templates" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Docs", href: "/docs" },
    ],
    []
  );

  const isLanding = pathname === "/";

  const linkBase = cn(
    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70"
  );

  return (
    <motion.header
      initial={false}
      className="sticky top-0 z-50 w-full border-b"
      aria-label="Cognify-AI primary navigation"
      animate={{
        borderColor: scrolled
          ? "rgba(229, 231, 235, 0.8)"
          : "rgba(229, 231, 235, 0)",
        backgroundColor: scrolled
          ? "rgba(255, 255, 255, 0.8)"
          : "rgba(255, 255, 255, 0)",
        backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
        boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.06)" : "none",
      }}
      transition={{ duration: 0.2 }}
      style={{
        // Dark mode handled via CSS
      }}
    >
      <div className="section-container flex h-16 items-center justify-between">
        {/* ── Brand ───────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70"
          aria-label="Cognify-AI home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 shadow-sm">
            <Sparkles className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Cognify<span className="text-primary-600">-AI</span>
          </span>
        </Link>

        {/* ── Desktop Nav ──────────────────────────────────────── */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active =
              item.href === pathname ||
              (item.href.startsWith("/#") && isLanding);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  linkBase,
                  active
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Desktop Actions ──────────────────────────────────── */}
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className={cn(
              linkBase,
              "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            )}
          >
            Log in
          </Link>
          <Button size="sm">
            <Link href="/register" className="flex items-center justify-center w-full h-full">
              Get started free
            </Link>
          </Button>
        </div>

        {/* ── Mobile Actions ───────────────────────────────────── */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white/70 text-gray-700 shadow-sm backdrop-blur",
              "transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-200 dark:hover:bg-gray-800",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70"
            )}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-t border-gray-200/70 bg-white/90 backdrop-blur-md dark:border-gray-800/50 dark:bg-gray-950/90 lg:hidden"
          >
            <motion.nav
              aria-label="Mobile navigation"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="section-container flex flex-col gap-1 py-4"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    linkBase,
                    "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <Button
                  variant="secondary"
                  className="w-full"
                >
                  <Link href="/login" onClick={() => setOpen(false)} className="flex items-center justify-center w-full h-full">
                    Log in
                  </Link>
                </Button>
                <Button className="w-full">
                  <Link href="/register" onClick={() => setOpen(false)} className="flex items-center justify-center w-full h-full">
                    Get started
                  </Link>
                </Button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
