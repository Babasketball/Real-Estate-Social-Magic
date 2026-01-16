import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.metadata?.email || session.customer_email;
    const credits = parseInt(session.metadata?.credits || "10");

    if (email) {
      try {
        const supabase = await createClient();
        
        // Get current credits for user by email
        const { data: existingUser, error: fetchError } = await supabase
          .from("user_credits")
          .select("credits")
          .eq("email", email)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          // PGRST116 is "not found" error, which is expected for new users
          console.error("Error fetching user credits:", fetchError);
        }

        const currentCredits = existingUser?.credits || 0;
        const newCredits = currentCredits + credits;

        // Update or insert user credits by email
        const { error: upsertError } = await supabase
          .from("user_credits")
          .upsert(
            {
              email: email,
              credits: newCredits,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "email",
            }
          );

        if (upsertError) {
          console.error("Error updating user credits:", upsertError);
          return NextResponse.json(
            { error: "Failed to update credits" },
            { status: 500 }
          );
        }
      } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json(
          { error: "Failed to process webhook" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
