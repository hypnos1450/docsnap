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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Document["status"]>("all");

  useEffect(() => {
    async function fetchDocs() {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", user.id)
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
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const filtered = filter === "all" ? documents : documents.filter(d => d.status === filter);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-500 mt-1">{filtered.length} of {documents.length} documents</p>
        </div>
        <Link
          href="/app"
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium text-sm"
        >
          + New Doc
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "completed", "generating", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === f
                ? "bg-indigo-100 text-indigo-700"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No documents</h2>
          <p className="text-slate-500 mb-6">
            {filter === "all" ? "Generate your first documentation set" : `No ${filter} documents`}
          </p>
          <Link
            href="/app"
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
          >
            Create a doc
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Document</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Format</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <Link href={`/generate?doc=${doc.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                      {doc.title || `Document #${doc.id.slice(0, 6)}`}
                    </Link>
                    <p className="text-sm text-slate-500 mt-0.5">{doc.steps_count} steps</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={statusColors[doc.status]}>{doc.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {doc.export_format.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(doc.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
