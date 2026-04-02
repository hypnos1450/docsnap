import { NextRequest, NextResponse } from "next/server";

// DocSnap API — Screenshot-to-Documentation Generator
// Day 2: Now saves generated docs to Supabase

const MOCK_STEPS = [
  {
    step: 1,
    title: "Log in to your account",
    description:
      "Open the application login page. Enter your email address in the designated field and type your password. Click the blue 'Sign In' button to access your dashboard.",
    annotations: ["Login form", "Sign in button", "Email field"],
    tip: "If you've enabled two-factor authentication, check your email for the verification code.",
  },
  {
    step: 2,
    title: "Navigate to settings",
    description:
      "Once logged in, click on your profile avatar in the top-right corner of the dashboard. In the dropdown menu, select 'Settings'. This will take you to the account configuration page.",
    annotations: ["Profile menu", "Settings option", "Dropdown navigation"],
    tip: "You can also press Ctrl+, (comma) as a keyboard shortcut to access settings directly.",
  },
  {
    step: 3,
    title: "Configure your preferences",
    description:
      "On the settings page, scroll to the 'Preferences' section. Here you can customize your notification settings, choose your preferred language, and set your timezone. Changes are saved automatically.",
    annotations: ["Preferences panel", "Toggle switches", "Auto-save indicator"],
    tip: "Click 'Reset to defaults' at the bottom if you want to return all preferences to their original state.",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images } = body as { images: Array<{ id: string; data: string; name: string }> };

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided." }, { status: 400 });
    }

    // TODO (Day 3): Replace mock with real Claude Vision API call
    const steps = images.map((img, index) => ({
      step: index + 1,
      title: MOCK_STEPS[index % MOCK_STEPS.length]?.title ?? `Step ${index + 1}`,
      description: MOCK_STEPS[index % MOCK_STEPS.length]?.description ?? "Document this step.",
      imageUrl: img.data,
      annotations: (MOCK_STEPS[index % MOCK_STEPS.length]?.annotations ?? ["UI Element"]) as string[],
      tip: MOCK_STEPS[index % MOCK_STEPS.length]?.tip,
    }));

    // Save document to Supabase if available
    let docId: string | null = null;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Create document record
        const { data: docData, error: docError } = await supabase
          .from("documents")
          .insert({
            user_id: null, // Will be set by RLS policy
            title: `Doc ${new Date().toLocaleDateString()}`,
            status: "completed",
            steps_count: steps.length,
            export_format: "markdown",
          })
          .select("id")
          .single();

        if (!docError && docData) {
          docId = docData.id;

          // Save each step
          const stepRecords = steps.map((s) => ({
            document_id: docId,
            step_number: s.step,
            title: s.title,
            description: s.description,
            image_url: s.imageUrl,
            annotations: s.annotations,
            tip: s.tip,
            order_index: s.step - 1,
          }));

          await supabase.from("document_steps").insert(stepRecords);
        }
      }
    } catch {
      // Supabase not configured — continue without saving
      console.log("Supabase not available, skipping DB save");
    }

    await new Promise((r) => setTimeout(r, 2000));

    return NextResponse.json({
      steps,
      document_id: docId,
    });
  } catch (error) {
    console.error("DocSnap API error:", error);
    return NextResponse.json(
      { error: "Failed to generate documentation. Please try again." },
      { status: 500 }
    );
  }
}
