import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error = false, leftIcon, rightIcon, ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 flex h-4 w-4 items-center text-gray-400 dark:text-gray-500">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "dark:bg-gray-900 dark:text-gray-50",
              error
                ? "border-red-400 focus-visible:ring-red-400/50 dark:border-red-600"
                : "border-gray-200 dark:border-gray-700",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="pointer-events-none absolute right-3 flex h-4 w-4 items-center text-gray-400 dark:text-gray-500">
              {rightIcon}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-gray-900 dark:text-gray-50",
          error
            ? "border-red-400 focus-visible:ring-red-400/50 dark:border-red-600"
            : "border-gray-200 dark:border-gray-700",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
