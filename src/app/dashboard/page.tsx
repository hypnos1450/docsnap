"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: string;
  title: string;
  status: "draft" | "generating" | "completed" | "failed";
  steps_count: number;
  export_format: "markdown" | "pdf" | "html";
  created_at: string;
}

const statusColors: Record<Document["status"], string> = {
  draft: "bg-gray-100 text-gray-700",
  generating: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

function PlanSuccessToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe") === "success") {
      setVisible(true);
      // Clean the URL
      window.history.replaceState({}, "", "/dashboard");
    }
    const timer = setTimeout(() => setVisible(false), 6000);
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

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: sessionData } = await supabase.auth.getUser();
        if (!sessionData?.user) return;

        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", sessionData.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDocuments(data || []);
      } catch (err) {
        console.error("Failed to load documents:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDocs();
  }, []);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });
  };

  const recentDocs = documents.slice(0, 5);

  return (
    <>
      <PlanSuccessToast />

      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">
              {documents.length} document{documents.length !== 1 ? "s" : ""} generated
            </p>
          </div>
          <Link
            href="/app"
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium text-sm"
          >
            + New Doc
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total", value: documents.length, color: "text-slate-900" },
            { label: "Completed", value: documents.filter((d) => d.status === "completed").length, color: "text-green-600" },
            { label: "In Progress", value: documents.filter((d) => d.status === "generating").length, color: "text-blue-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent documents */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Recent Documents</h2>
            <Link href="/dashboard/documents" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : recentDocs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-slate-500 mb-4">No documents yet</p>
              <Link
                href="/app"
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium text-sm"
              >
                Create your first doc
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/generate?doc=${doc.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {doc.title || `Document #${doc.id.slice(0, 6)}`}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {doc.steps_count} steps • {doc.export_format.toUpperCase()} • {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <Badge className={statusColors[doc.status]}>{doc.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
