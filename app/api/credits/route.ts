import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get("x-user-email");

    if (!email) {
      // No email = no credits tracking
      return NextResponse.json({ credits: null });
    }

    const supabase = await createClient();

    // Get user credits from database by email
    const { data: userCredits, error: creditsError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("email", email)
      .single();

    if (creditsError && creditsError.code !== "PGRST116") {
      console.error("Error fetching credits:", creditsError);
      return NextResponse.json({ credits: 0 });
    }

    return NextResponse.json({
      credits: userCredits?.credits || 0,
    });
  } catch (error) {
    console.error("Error getting credits:", error);
    return NextResponse.json({ credits: 0 });
  }
}
