import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "accent" | "success" | "warning" | "danger" | "outline";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:
    "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  secondary:
    "bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300",
  accent:
    "bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300",
  success:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  danger:
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  outline:
    "border border-gray-200 bg-transparent text-gray-700 dark:border-gray-700 dark:text-gray-300",
};

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
