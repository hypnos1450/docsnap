"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  order: number;
}

export default function UploadPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    const newImages: UploadedImage[] = imageFiles.map((file, i) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      preview: URL.createObjectURL(file),
      order: images.length + i,
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, [images]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      return filtered.map((img, i) => ({ ...img, order: i }));
    });
  }, []);

  const moveImage = useCallback((index: number, direction: "up" | "down") => {
    setImages((prev) => {
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === prev.length - 1)
      )
        return prev;
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((img, i) => ({ ...img, order: i }));
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (images.length === 0) return;

    setProcessing(true);

    // For MVP: send to API (will use mock for now, real API wired up Day 3)
    // Store images in sessionStorage for cross-page access
    const imageMeta = images.map((img) => ({
      id: img.id,
      name: img.file.name,
      size: img.file.size,
      order: img.order,
    }));

    // Convert images to base64 for cross-page transfer
    const base64Images: { id: string; data: string; name: string }[] = [];
    for (const img of images) {
      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(img.file);
        });
        base64Images.push({ id: img.id, data: base64, name: img.file.name });
      } catch {
        console.warn("Failed to read image", img.id);
      }
    }

    sessionStorage.setItem("docsnap_images", JSON.stringify(base64Images));

    // Navigate to generate page
    window.location.href = "/generate";
  }, [images]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition">
            <span className="text-2xl">📋</span>
            <span className="text-xl font-bold text-slate-900">DocSnap</span>
          </Link>
          <div className="flex items-center gap-4">
            {images.length > 0 && (
              <Badge variant="secondary" className="text-sm">
                {images.length} screenshot{images.length !== 1 ? "s" : ""}
              </Badge>
            )}
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
              ← Back to home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Upload your screenshots
        </h1>
        <p className="text-slate-600 mb-8">
          Drag and drop or click to select. Order matters — arrange them in the
          sequence of your workflow.
        </p>

        {/* Drop Zone */}
        <div
          className={cn(
            "rounded-2xl border-2 border-dashed p-12 text-center transition cursor-pointer",
            dragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300 hover:border-slate-400 bg-white"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
        >
          <div className="text-5xl mb-4">📤</div>
          <p className="text-lg font-semibold text-slate-700 mb-2">
            Drop screenshots here
          </p>
          <p className="text-sm text-slate-500 mb-4">
            or click to browse • PNG, JPG, WebP • up to 5MB each
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Image List */}
        {images.length > 0 && (
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Steps ({images.length})
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setImages([]);
                }}
                className="text-red-500 hover:text-red-600"
              >
                Clear all
              </Button>
            </div>

            {images.map((img, index) => (
              <div
                key={img.id}
                className="flex items-center gap-4 bg-white rounded-xl p-4 border border-slate-200"
              >
                {/* Order number */}
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>

                {/* Thumbnail */}
                <img
                  src={img.preview}
                  alt={`Step ${index + 1}`}
                  className="w-20 h-14 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {img.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(img.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveImage(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveImage(index, "down")}
                    disabled={index === images.length - 1}
                    className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Generate Button */}
        {images.length >= 2 && (
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              disabled={processing}
              onClick={handleGenerate}
              className="px-8 py-4 text-lg bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              {processing ? (
                <>
                  <span className="animate-spin mr-2">🔄</span> Processing...
                </>
              ) : (
                <>Generate documentation →</>
              )}
            </Button>
          </div>
        )}

        {images.length > 0 && images.length < 2 && (
          <p className="text-center text-sm text-slate-500 mt-6">
            Add at least one more screenshot before generating
          </p>
        )}
      </main>
    </div>
  );
}
