import { NextRequest, NextResponse } from "next/server";

// DocSnap API — Screenshot-to-Documentation Generator
// Day 1: MVP structure. Day 3: Wire to Claude/GPT-4o vision model.

const MOCK_STEPS: Record<string, unknown>[] = [
  {
    step: 1,
    title: "Log in to your account",
    description:
      "Open the application login page. Enter your email address in the designated field and type your password. Click the blue 'Sign In' button to access your dashboard. Make sure your credentials are correct to avoid login errors.",
    annotations: ["Login form", "Sign in button", "Email field"],
    tip: "If you've enabled two-factor authentication, check your email for the verification code.",
  },
  {
    step: 2,
    title: "Navigate to settings",
    description:
      "Once logged in, click on your profile avatar in the top-right corner of the dashboard. In the dropdown menu, select 'Settings'. This will take you to the account configuration page where you can manage preferences, security, and integrations.",
    annotations: ["Profile menu", "Settings option", "Dropdown navigation"],
    tip: "You can also press Ctrl+, (comma) as a keyboard shortcut to access settings directly.",
  },
  {
    step: 3,
    title: "Configure your preferences",
    description:
      "On the settings page, scroll to the 'Preferences' section. Here you can customize your notification settings, choose your preferred language, and set your timezone. Toggle the options to match your workflow. Changes are saved automatically.",
    annotations: ["Preferences panel", "Toggle switches", "Auto-save indicator"],
    tip: "Click 'Reset to defaults' at the bottom if you want to return all preferences to their original state.",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images }: { images: Array<{ id: string; data: string; name: string }> } = body;

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided. Upload at least one screenshot." },
        { status: 400 }
      );
    }

    // TODO (Day 3): Replace mock with real AI vision call
    // Example with Claude Vision:
    //
    // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // const messages = [
    //   {
    //     role: "user",
    //     content: [
    //       {
    //         type: "text",
    //         text: `You are a technical documentation generator. Analyze these ${images.length} screenshots in order, which show a user navigating through a software workflow. For each screenshot, generate:
    //           1. A concise step title (action-oriented)
    //           2. A clear description explaining what the user should do
    //           3. Annotations identifying key UI elements
    //           4. A troubleshooting tip if applicable
    //           Return the result as a JSON array of objects matching this schema:
    //           [{ "step": number, "title": string, "description": string, "annotations": string[], "tip": string }]`,
    //       },
    //       ...images.flatMap((img) => [
    //         { type: "text", text: `Screenshot ${images.indexOf(img) + 1}:` },
    //         {
    //           type: "image",
    //           source: {
    //             type: "base64",
    //             media_type: "image/png",
    //             data: img.data.replace(/^data:image\/\w+;base64,/, ""),
    //           },
    //         },
    //       ]),
    //     ],
    //   },
    // ];
    //
    // const response = await anthropic.messages.create({
    //   model: "claude-sonnet-4-20250514",
    //   max_tokens: 4000,
    //   messages,
    // });
    //
    // const generated = JSON.parse(
    //   (response.content[0] as any).text
    // );

    // For now, return mock steps with actual images
    const steps = images.map((img, index) => ({
      step: index + 1,
      title: MOCK_STEPS[index % MOCK_STEPS.length]?.title ?? `Step ${index + 1}`,
      description: MOCK_STEPS[index % MOCK_STEPS.length]?.description ?? "Document this step.",
      imageUrl: img.data,
      annotations: (MOCK_STEPS[index % MOCK_STEPS.length]?.annotations ?? ["UI Element"]) as string[],
      tip: MOCK_STEPS[index % MOCK_STEPS.length]?.tip,
    }));

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 2000));

    return NextResponse.json({ steps });
  } catch (error) {
    console.error("DocSnap API error:", error);
    return NextResponse.json(
      { error: "Failed to generate documentation. Please try again." },
      { status: 500 }
    );
  }
}
