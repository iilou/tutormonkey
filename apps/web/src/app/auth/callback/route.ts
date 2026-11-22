import { NextResponse, type NextRequest } from "next/server";
import { createRequestAuthClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const auth = await createRequestAuthClient("write");
  const code = request.nextUrl.searchParams.get("code");
  let destination = "/login?error=unavailable";

  if (auth) {
    destination = "/login?error=sign-in";
    if (code && !request.nextUrl.searchParams.has("error")) {
      const { data, error } = await auth.client.auth.exchangeCodeForSession(code);
      if (!error && data.session) {
        destination = "/library";
      }
    }
  }

  const response = NextResponse.redirect(new URL(destination, auth?.origin ?? request.nextUrl), 303);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
