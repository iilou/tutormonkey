import { NextResponse, type NextRequest } from "next/server";
import { createAuthClient, isAuthUnavailable } from "@/lib/supabase/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const auth = createAuthClient({
    getAll: () => request.cookies.getAll(),
    setAll: (updates, cacheHeaders) => {
      for (const { name, value } of updates) {
        request.cookies.set(name, value);
      }

      response = NextResponse.next({ request });

      for (const { name, value, options } of updates) {
        response.cookies.set(name, value, options);
      }

      for (const [name, value] of Object.entries(cacheHeaders)) {
        response.headers.set(name, value);
      }
    },
  });

  const session = await auth?.client.auth.getClaims();
  response.headers.set("Cache-Control", "private, no-store");

  if (session?.data?.claims.sub && !session.data.claims.is_anonymous) {
    return response;
  }

  const destination = !auth || isAuthUnavailable(session?.error ?? null)
    ? "/login?error=unavailable"
    : "/login";
  const redirect = NextResponse.redirect(new URL(destination, auth?.origin ?? request.nextUrl), 303);
  redirect.headers.set("Cache-Control", "private, no-store");

  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }

  return redirect;
}

export const config = {
  matcher: ["/library/:path*"],
};
