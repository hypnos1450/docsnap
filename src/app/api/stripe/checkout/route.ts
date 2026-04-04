import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const supabase = await createServerSupabaseClient();

    // Use Authorization header token if provided, otherwise fall back to cookie-based auth
    let user;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data, error } = await supabase.auth.getUser(token);
      user = error ? null : data.user;
    } else {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body as { plan: "pro" };

    if (plan !== "pro") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "DocSnap Pro",
              description: "$19/month — 50 docs/month, unlimited screenshots, all exports, AI troubleshooting tips, custom branding, hosted docs pages",
            },
            unit_amount: 1900, // $19.00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?stripe=success`,
      cancel_url: `${origin}/?stripe=cancelled`,
      metadata: {
        userId: user.id,
        plan: "pro",
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: "pro",
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to fetch plan status" }, { status: 500 });
    }

    return NextResponse.json({ plan: profile?.plan ?? "free" });
  } catch (error) {
    console.error("Plan status error:", error);
    return NextResponse.json({ plan: "free" });
  }
}
