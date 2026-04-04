"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "🏠" },
  { label: "Documents", href: "/dashboard/documents", icon: "📄" },
  { label: "Billing", href: "/dashboard/billing", icon: "💳" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

interface DashboardLayoutProps {
  user: { email?: string; id?: string };
  plan: string;
  children: React.ReactNode;
}

export default function DashboardLayout({ user, plan, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const planBadgeColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-700",
    pro: "bg-indigo-100 text-indigo-700",
  };

  const handleSignOut = async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-40 hidden md:flex">
        {/* Logo */}
        <div className="h-16 border-b border-slate-200 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="text-lg font-bold text-slate-900">DocSnap</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + plan */}
        <div className="border-t border-slate-200 px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge className={planBadgeColors[plan] ?? "bg-gray-100 text-gray-700"}>
              {plan === "pro" ? "⭐ Pro" : "Free"}
            </Badge>
            <span className="text-xs text-slate-500">{user.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <span className="text-lg font-bold text-slate-900">DocSnap</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-slate-900"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-bold text-slate-900">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-500">✕</button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    pathname === item.href
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-3 px-3">
                <Badge className={planBadgeColors[plan] ?? "bg-gray-100 text-gray-700"}>
                  {plan === "pro" ? "⭐ Pro" : "Free"}
                </Badge>
                <span className="text-xs text-slate-500 truncate">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen pt-16 md:pt-0">
        <div className="p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
