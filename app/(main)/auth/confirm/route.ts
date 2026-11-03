import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { authConfirmRedirects } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // `next` keeps its query string (see lib/safe-redirect.ts): the calendar
  // handoff lands on /api/integrations/<id>/connect?next=..., and only the
  // token/type/next of THIS request are dropped - never the target's own.
  const { success, failure } = authConfirmRedirects(request.nextUrl.href);

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(success);
    }
  }

  return NextResponse.redirect(failure);
}
