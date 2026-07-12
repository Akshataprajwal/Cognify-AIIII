interface SpinnerProps {
  /** "xs" | "sm" | "md" | "lg" — defaults to "md" */
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = {
  xs: "h-3 w-3 border",
  sm: "h-4 w-4 border",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-2",
};

export function Spinner({ size = "md", className = "", label = "Loading…" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-indigo-500 border-t-transparent ${sizeMap[size]} ${className}`}
    />
  );
}

/** Full-screen centered spinner */
export function PageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-white/40">
      <Spinner size="lg" label={label} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
