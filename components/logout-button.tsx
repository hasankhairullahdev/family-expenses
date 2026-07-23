"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  iconOnly?: boolean;
}

export function LogoutButton({ className, iconOnly = false }: LogoutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={cn(
        "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium",
        "text-warm-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100",
        "transition-all duration-150 cursor-pointer group",
        className
      )}
    >
      <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
      {!iconOnly && <span>Logout</span>}
    </button>
  );
}
