"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function SuccessToast() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3">
        <span className="text-xl">🎉</span>
        <div>
          <p className="font-semibold">Pro plan activated!</p>
          <p className="text-sm text-green-100">Welcome to DocSnap Pro</p>
        </div>
        <button onClick={() => setVisible(false)} className="ml-2 text-green-200 hover:text-white">
          ×
        </button>
      </div>
    </div>
  );
}

function CancelledToast() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-slate-800 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3">
        <span className="text-xl">ℹ️</span>
        <p className="text-sm">Checkout cancelled — no charge was made.</p>
        <button onClick={() => setVisible(false)} className="ml-2 text-slate-400 hover:text-white">
          ×
        </button>
      </div>
    </div>
  );
}

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  useEffect(() => {
    const stripeStatus = searchParams.get("stripe");
    if (stripeStatus === "success") {
      setShowSuccess(true);
      router.replace("/");
    } else if (stripeStatus === "cancelled") {
      setShowCancelled(true);
      router.replace("/");
    }
  }, [searchParams, router]);

  const handleProClick = async () => {
    setCheckingAuth(true);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/auth?redirect=/");
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });

      if (!res.ok) throw new Error("Checkout failed");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Pro checkout error:", err);
    } finally {
      setCheckingAuth(false);
    }
  };

  return (
    <>
      {showSuccess && <SuccessToast />}
      {showCancelled && <CancelledToast />}

      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <span className="text-xl font-bold text-slate-900">DocSnap</span>
          </div>
          <div className="flex gap-4">
            <Link href="/app" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
              Try it free
            </Link>
            <a
              href="#pricing"
              className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              Pricing
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
          <span className="text-sm font-medium text-indigo-700">✨ 7-day build — live by April 9th</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
          Turn screenshots into
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            step-by-step docs
          </span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Upload screenshots of any software workflow. Get polished documentation
          with annotations, descriptions, and troubleshooting tips — in seconds.
        </p>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          Start generating docs — free
          <span>→</span>
        </Link>
        <p className="mt-4 text-sm text-slate-500">No signup required • 5 free docs/month</p>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Screenshot",
              desc: "Take screenshots of your workflow. Upload them in order.",
              emoji: "📸",
            },
            {
              step: "2",
              title: "AI Analyzes",
              desc: "Our AI identifies UI elements, actions, and generates step descriptions.",
              emoji: "🤖",
            },
            {
              step: "3",
              title: "Export",
              desc: "Get beautiful docs in Markdown, PDF, or as a hosted page.",
              emoji: "📄",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition text-center"
            >
              <div className="text-4xl mb-4">{item.emoji}</div>
              <div className="text-sm font-semibold text-indigo-600 mb-1">Step {item.step}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Built for people who hate writing docs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "🎯", title: "Auto-annotations", desc: "AI identifies buttons, fields, and UI elements with callout labels" },
              { icon: "📝", title: "Step descriptions", desc: "Clear, concise instructions generated for each screenshot" },
              { icon: "🔧", title: "Troubleshooting tips", desc: "AI anticipates common user errors and adds helpful warnings" },
              { icon: "📤", title: "Multiple exports", desc: "Markdown, PDF, HTML — or get a shareable hosted documentation page" },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 bg-white rounded-xl p-5 border border-slate-200">
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-900">{f.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Simple pricing</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              name: "Free",
              price: "$0",
              period: "/forever",
              features: ["5 docs/month", "Up to 10 screenshots per doc", "Markdown export", "Basic annotations"],
              cta: "Get started",
              highlight: false,
            },
            {
              name: "Pro",
              price: "$19",
              period: "/month",
              features: [
                "50 docs/month",
                "Unlimited screenshots",
                "Markdown, PDF & HTML export",
                "AI troubleshooting tips",
                "Custom branding",
                "Hosted documentation pages",
              ],
              cta: checkingAuth ? "Redirecting..." : "Start Pro trial",
              highlight: true,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border ${
                plan.highlight
                  ? "border-indigo-300 bg-indigo-50 shadow-lg"
                  : "border-slate-200 bg-white"
              }`}
            >
              <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
              <div className="mt-2 mb-6">
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-600">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              {plan.highlight ? (
                <button
                  onClick={handleProClick}
                  disabled={checkingAuth}
                  className="w-full block text-center py-3 px-6 rounded-xl font-semibold transition bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
                >
                  {checkingAuth ? "Redirecting..." : "Start Pro trial"}
                </button>
              ) : (
                <Link
                  href="/app"
                  className={`block text-center py-3 px-6 rounded-xl font-semibold transition bg-slate-100 text-slate-900 hover:bg-slate-200`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span>📋</span> <span>DocSnap — © 2025</span>
          </div>
          <div>
            Built with Next.js, Supabase & AI vision
          </div>
        </div>
      </footer>
    </>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    }>
      <LandingContent />
    </Suspense>
  );
}
