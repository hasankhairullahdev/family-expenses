"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Wallet, Tag, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transaksi", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/anggaran", label: "Anggaran", icon: Wallet },
  { href: "/kategori", label: "Kategori", icon: Tag },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-cream-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-stretch">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium",
                "transition-colors duration-150",
                isActive ? "text-maroon-600" : "text-warm-400 hover:text-warm-600"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0",
                  isActive ? "text-maroon-600" : "text-warm-400"
                )}
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span className={cn(isActive ? "text-maroon-600 font-semibold" : "text-warm-400")}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium text-warm-400 hover:text-red-500 transition-colors duration-150 cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.75} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
