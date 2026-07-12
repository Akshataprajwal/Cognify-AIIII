import * as React from "react";
import { cn } from "@/lib/utils";

/* ─── Card Root ─────────────────────────────────────────────── */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
}

export function Card({ className, glass = false, hover = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 shadow-card dark:border-gray-800",
        glass
          ? "bg-white/70 backdrop-blur-md dark:bg-gray-900/60"
          : "bg-white dark:bg-gray-900",
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover card-glow",
        className
      )}
      {...props}
    />
  );
}

/* ─── Card Header ───────────────────────────────────────────── */
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  );
}

/* ─── Card Title ────────────────────────────────────────────── */
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

/* ─── Card Description ──────────────────────────────────────── */
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)} {...props} />
  );
}

/* ─── Card Content ──────────────────────────────────────────── */
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

/* ─── Card Footer ───────────────────────────────────────────── */
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
  );
}
