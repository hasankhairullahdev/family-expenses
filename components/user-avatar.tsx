import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-11 h-11 text-base",
};

export function UserAvatar({ name, className, size = "md" }: UserAvatarProps) {
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold select-none",
        "bg-maroon-700 text-gold-300 ring-1 ring-gold-400/30",
        sizeMap[size],
        className
      )}
    >
      {initials}
    </span>
  );
}
