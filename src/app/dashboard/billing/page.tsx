"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function BillingPage() {
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();
        setPlan(profile?.plan ?? "free");
      } catch (err) {
        console.error("Failed to load plan:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, []);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to open portal");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Portal error:", err);
    } finally {
      setPortalLoading(false);
    }
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "For trying out DocSnap",
      features: ["5 docs/month", "Up to 10 screenshots per doc", "Markdown export", "Basic annotations"],
      cta: plan === "free" ? "Current plan" : "Downgrade",
      current: plan === "free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "For power users and teams",
      features: ["50 docs/month", "Unlimited screenshots", "Markdown, PDF & HTML export", "AI troubleshooting tips", "Custom branding", "Hosted documentation pages"],
      cta: plan === "pro" ? "Manage subscription" : "Upgrade to Pro",
      current: plan === "pro",
      highlight: true,
    },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Billing</h1>
        <p className="text-slate-500 mt-1">Manage your subscription and billing</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-6 border ${
                p.highlight
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                {p.current && (
                  <Badge className="bg-green-100 text-green-700">Current</Badge>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-bold text-slate-900">{p.price}</span>
                <span className="text-slate-500 text-sm">/{p.period}</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">{p.description}</p>
              <ul className="space-y-2 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>

              {p.current && p.name === "Pro" ? (
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold transition bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {portalLoading ? "Opening..." : "Manage Subscription"}
                </button>
              ) : p.name === "Pro" ? (
                <Link
                  href="/?plan=pro#pricing"
                  className="block w-full py-2.5 px-4 rounded-xl font-semibold text-center transition bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Upgrade to Pro — $19/mo
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-xl font-semibold bg-slate-100 text-slate-400 cursor-not-allowed"
                >
                  {p.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-500">
        💳 Payments are securely processed by Stripe. Cancel anytime — no questions asked.
      </div>
    </div>
  );
}
