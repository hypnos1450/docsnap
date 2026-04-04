"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "./DashboardLayout";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchAuth() {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/auth?redirect=/dashboard");
          return;
        }

        setUser({ email: authUser.email, id: authUser.id });

        // Fetch plan
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", authUser.id)
          .single();
        setPlan(profile?.plan ?? "free");
      } catch (err) {
        console.error("Dashboard auth error:", err);
        router.push("/auth?redirect=/dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout user={user} plan={plan}>
      {children}
    </DashboardLayout>
  );
}
