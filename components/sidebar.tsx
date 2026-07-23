"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Wallet, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transaksi", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/anggaran", label: "Anggaran", icon: Wallet },
  { href: "/kategori", label: "Kategori", icon: Tag },
];

interface SidebarProps {
  userName?: string | null;
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-white border-r border-cream-300 shadow-sm">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-cream-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-maroon-600 flex items-center justify-center shadow-md shadow-maroon-600/30">
            <span className="text-gold-300 text-base font-bold leading-none">₭</span>
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-maroon-700 leading-tight tracking-wide">
              Keuangan
            </p>
            <p className="font-heading text-[10px] text-warm-400 leading-tight tracking-widest uppercase">
              Keluarga
            </p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-cream-200">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-cream-100">
          <UserAvatar name={userName} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-warm-800 truncate">
              {userName ?? "User"}
            </p>
            <p className="text-xs text-warm-400 truncate">Anggota Keluarga</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase text-warm-400">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                "transition-all duration-150 group",
                isActive
                  ? "bg-maroon-600 text-white shadow-md shadow-maroon-600/25"
                  : "text-warm-600 hover:text-warm-900 hover:bg-cream-100"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform",
                  isActive ? "text-gold-300" : "text-warm-400 group-hover:text-maroon-500"
                )}
              />
              <span>{label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-300 shadow-sm shadow-gold-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-2 border-t border-cream-200">
        <LogoutButton />
      </div>
    </aside>
  );
}
