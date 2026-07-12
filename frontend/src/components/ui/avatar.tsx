"use client";

import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  /** "xs" | "sm" | "md" | "lg" | "xl" — defaults to "md" */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: { outer: "h-6 w-6", text: "text-[10px]" },
  sm: { outer: "h-8 w-8", text: "text-xs" },
  md: { outer: "h-10 w-10", text: "text-sm" },
  lg: { outer: "h-12 w-12", text: "text-base" },
  xl: { outer: "h-16 w-16", text: "text-xl" },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const { outer, text } = sizeMap[size];
  const initials = name ? getInitials(name) : "?";

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${outer} ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? "Avatar"}
          fill
          sizes="64px"
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 font-semibold text-white ${text}`}
        >
          {initials}
        </span>
      )}
    </span>
  );
}
