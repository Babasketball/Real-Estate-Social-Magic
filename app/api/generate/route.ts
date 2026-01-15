import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an elite real estate marketer. Turn the following property description into 5 posts: 1 for Instagram (with emojis), 1 for LinkedIn (professional), 1 for Facebook (community-focused), 1 for X (short/punchy), and 1 TikTok script. Return the result as a JSON object with the following structure:
{
  "instagram": "Instagram post text with emojis",
  "linkedin": "Professional LinkedIn post",
  "facebook": "Community-focused Facebook post",
  "x": "Short and punchy X (Twitter) post",
  "tiktok": "TikTok script"
}`;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Property description text is required" },
        { status: 400 }
      );
    }

    // Check for email-based credits (no login required)
    const email = request.headers.get("x-user-email") || null;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required to track credits. Please buy credits to generate posts." },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Get credits by email (stored from Stripe checkout)
    const { data: userCredits, error: creditsError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("email", email)
      .single();

    // If no record, treat as 0 credits
    if (creditsError && creditsError.code !== "PGRST116") {
      console.error("Error fetching credits:", creditsError);
    }

    const credits = userCredits?.credits || 0;

    // 1 generation costs 10 credits
    if (credits < 10) {
      return NextResponse.json(
        { error: "Insufficient credits. You need 10 credits to generate posts. Please purchase credits." },
        { status: 403 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    const parsedContent = JSON.parse(content);

    // Validate the response structure
    if (
      !parsedContent.instagram ||
      !parsedContent.linkedin ||
      !parsedContent.facebook ||
      !parsedContent.x ||
      !parsedContent.tiktok
    ) {
      return NextResponse.json(
        { error: "Invalid response format from OpenAI" },
        { status: 500 }
      );
    }

    // Deduct 10 credits after successful generation (1 generation = 10 credits)
    const { data: updatedCredits } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("email", email)
      .single();

    const currentCredits = updatedCredits?.credits || 0;
    const newCredits = Math.max(0, currentCredits - 10);

    await supabase
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

    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error("Error generating posts:", error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse OpenAI response" },
        { status: 500 }
      );
    }

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
