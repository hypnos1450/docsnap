"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Base64Image {
  id: string;
  data: string;
  name: string;
}

interface GeneratedStep {
  step: number;
  title: string;
  description: string;
  imageUrl: string;
  annotations: string[];
  tip?: string;
}

export default function PreviewPage() {
  const [images, setImages] = useState<Base64Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<GeneratedStep[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("docsnap_images");
    if (data) {
      try {
        setImages(JSON.parse(data));
      } catch {
        console.error("Failed to parse images");
      }
    }
  }, []);

  const generateDocs = useCallback(async () => {
    setGenerating(true);

    const generatedSteps: GeneratedStep[] = images.map((img, index) => ({
      step: index + 1,
      title: `Step ${index + 1}`,
      description: "AI-generated description will appear here.",
      imageUrl: img.data,
      annotations: ["Action area", "Interface element"],
      tip: "Pro tip: This tip will be replaced with AI-generated suggestions.",
    }));

    // Try the API — if it fails, use mock with delay for demo feel
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map((img) => ({ id: img.id, data: img.data, name: img.name })),
        }),
      });
      if (response.ok) {
        const result = await response.json();
        setSteps(result.steps || generatedSteps);
      } else {
        // Fallback: simulate with mock
        await new Promise((r) => setTimeout(r, 2000));
        setSteps(generatedSteps);
      }
    } catch {
      // API not ready yet — mock it
      await new Promise((r) => setTimeout(r, 2000));
      setSteps(generatedSteps);
    }

    setGenerating(false);
  }, [images]);

  // Auto-generate on mount
  useEffect(() => {
    generateDocs();
  }, [generateDocs]);

  const copyMarkdown = () => {
    const md = steps
      .map(
        (s) =>
          `## Step ${s.step}: ${s.title}\n\n${s.description}\n\n${
            s.tip ? `> 💡 **Tip:** ${s.tip}\n\n` : ""
          }`
      )
      .join("\n");
    navigator.clipboard.writeText(md);
  };

  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            No screenshots found
          </h2>
          <p className="text-slate-600 mb-6">
            Upload screenshots first to generate documentation.
          </p>
          <Link
            href="/app"
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Upload screenshots
          </Link>
        </div>
      </div>
    );
  }

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
            <Badge variant="secondary">{steps.length} steps</Badge>
            <Link href="/app" className="text-sm text-slate-500 hover:text-slate-700">
              ← New doc
            </Link>
          </div>
        </div>
      </nav>

      {/* Loading state */}
      {generating && (
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="text-5xl mb-6">🤖</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Analyzing your screenshots...
          </h2>
          <p className="text-slate-600">
            Identifying UI elements, generating descriptions, and building your
            documentation.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            {["Scanning", "Extracting", "Writing"].map((status, i) => (
              <Badge
                key={status}
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                {status}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Generated documentation */}
      {!generating && steps.length > 0 && (
        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Generated Documentation
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyMarkdown}
                className="text-sm"
              >
                📋 Copy Markdown
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            {steps.map((step) => (
              <Card key={step.step} className="overflow-hidden">
                <CardHeader className="bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-slate-700">{step.description}</p>
                  <img
                    src={step.imageUrl}
                    alt={step.title}
                    className="w-full rounded-xl border border-slate-200"
                  />
                  {step.annotations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {step.annotations.map((ann) => (
                        <Badge key={ann} variant="outline">
                          {ann}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {step.tip && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                      <span className="font-semibold text-amber-800">💡 Tip:</span>{" "}
                      <span className="text-amber-700">{step.tip}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}
