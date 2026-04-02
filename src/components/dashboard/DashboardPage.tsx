"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: string;
  title: string;
  status: "draft" | "generating" | "completed" | "failed";
  steps_count: number;
  export_format: "markdown" | "pdf" | "html";
  created_at: string;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-700",
  generating: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: sessionData } = await supabase.auth.getUser();
        if (!sessionData?.user) {
          window.location.href = "/auth";
          return;
        }
        setUser({ email: sessionData.user.email });

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
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition">
            <span className="text-2xl">📋</span>
            <span className="text-xl font-bold text-slate-900">DocSnap</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const { createClient } = await import("@supabase/supabase-js");
                const supabase = createClient(
                  process.env.NEXT_PUBLIC_SUPABASE_URL!,
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Documents</h1>
            <p className="text-slate-600 mt-1">{documents.length} document{documents.length !== 1 ? "s" : ""} generated</p>
          </div>
          <Link
            href="/app"
            className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
          >
            + New Doc
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total", value: documents.length, color: "text-slate-900" },
            { label: "Completed", value: documents.filter(d => d.status === "completed").length, color: "text-green-600" },
            { label: "In Progress", value: documents.filter(d => d.status === "generating").length, color: "text-blue-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Document list */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="text-5xl mb-4">📄</div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No documents yet</h2>
            <p className="text-slate-500 mb-6">Generate your first documentation set</p>
            <Link
              href="/app"
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
            >
              Create a doc
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/generate?doc=${doc.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{doc.title || `Document #${doc.id.slice(0, 6)}`}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {doc.steps_count} step{doc.steps_count !== 1 ? "s" : ""} • {doc.export_format.toUpperCase()} • {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <Badge className={statusColors[doc.status]}>{doc.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
