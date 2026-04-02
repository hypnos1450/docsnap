import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-2.0-flash-001";

const DOC_SYSTEM_PROMPT = `You are an expert technical documentation generator. Analyze screenshots of software workflows and generate clear, step-by-step documentation.

For each screenshot, return a JSON object with:
- step: number (sequential starting at 1)
- title: string (max 60 chars, action-oriented like "Click the Settings button")
- description: string (max 200 chars, clear instructions)
- annotations: string[] (key UI elements visible)
- tip: string or null (practical troubleshooting hint)

Return a JSON array of these objects. No markdown code blocks, no explanation — only the JSON array.`;

interface DocStep {
  step: number;
  title: string;
  description: string;
  imageUrl: string;
  annotations: string[];
  tip: string | null;
}

async function generateWithOpenRouter(images: Array<{ id: string; data: string; name: string }>): Promise<DocStep[]> {
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not set");

  const allSteps: DocStep[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const base64Data = img.data.replace(/^data:image\/\w+;base64,/, "");

    let attempts = 0;
    const maxAttempts = 3;
    let lastError = "";

    while (attempts < maxAttempts) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://docsnap-mu.vercel.app",
            "X-Title": "DocSnap",
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `${DOC_SYSTEM_PROMPT}\n\nThis is screenshot ${i + 1} of ${images.length} in a workflow sequence. Generate documentation for this step.`,
                  },
                  {
                    type: "image_url",
                    image_url: { url: `data:image/png;base64,${base64Data}` },
                  },
                ],
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenRouter ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();

        if (text) {
          const cleanedText = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
          const parsed = JSON.parse(cleanedText);

          // Handle both { steps: [...] } and [...] formats
          const stepsArray = Array.isArray(parsed)
            ? parsed
            : parsed.steps || parsed.doc || [parsed];

          for (const s of stepsArray) {
            allSteps.push({
              step: s.step ?? allSteps.length + 1,
              title: s.title ?? `Step ${allSteps.length + 1}`,
              description: s.description ?? "",
              imageUrl: img.data,
              annotations: Array.isArray(s.annotations) ? s.annotations : [],
              tip: s.tip || null,
            });
          }
        }
        break; // Success — exit retry loop
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        attempts++;

        // Retry on rate limits with exponential backoff
        if (lastError.includes("429") || lastError.includes("rate_limit") || lastError.includes("overloaded")) {
          if (attempts < maxAttempts) {
            await new Promise((r) => setTimeout(r, attempts * 1500));
            continue;
          }
        }

        // Non-retryable error or max retries reached
        if (attempts >= maxAttempts) {
          // Fall back to a safe step entry
          allSteps.push({
            step: allSteps.length + 1,
            title: `Step ${allSteps.length + 1}`,
            description: "Documentation step — AI analysis could not be completed.",
            imageUrl: img.data,
            annotations: [],
            tip: null,
          });
        }
      }
    }
  }

  return allSteps;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images } = body as { images: Array<{ id: string; data: string; name: string }> };

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided." }, { status: 400 });
    }

    let steps: DocStep[] = [];
    let aiModel = "mock";

    try {
      steps = await generateWithOpenRouter(images);
      aiModel = MODEL;
    } catch (err) {
      console.error("OpenRouter failed, using mock:", err);
      // Graceful fallback
      const mockTitles = [
        "Log in to your account",
        "Navigate to the dashboard",
        "Access settings",
        "Configure your preferences",
        "Save your changes",
      ];
      steps = images.map((img, idx) => ({
        step: idx + 1,
        title: mockTitles[idx % mockTitles.length],
        description: "AI-generated documentation step.",
        imageUrl: img.data,
        annotations: ["Button", "Form field", "Menu item"],
        tip: "Tip: Review all settings before saving.",
      }));
    }

    // Save to Supabase if configured
    let docId: string | null = null;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: docData } = await supabase
          .from("documents")
          .insert({
            title: `Doc ${new Date().toLocaleDateString()}`,
            status: "completed",
            steps_count: steps.length,
            export_format: "markdown",
          })
          .select("id")
          .single();

        if (docData?.id) {
          docId = docData.id;
          await supabase.from("document_steps").insert(
            steps.map((s, idx) => ({
              document_id: docId,
              step_number: s.step,
              title: s.title,
              description: s.description,
              image_url: s.imageUrl,
              annotations: s.annotations,
              tip: s.tip,
              order_index: idx,
            }))
          );
        }
      }
    } catch {
      // Supabase not configured — skip silently
    }

    return NextResponse.json({ steps, document_id: docId, ai_model: aiModel });
  } catch (error) {
    console.error("DocSnap API error:", error);
    return NextResponse.json(
      { error: "Failed to generate documentation. Please try again." },
      { status: 500 }
    );
  }
}
