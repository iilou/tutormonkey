import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { isAuthRetryableFetchError, type AuthError } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export function isAuthUnavailable(error: AuthError | null) {
  return isAuthRetryableFetchError(error) || (error?.status ?? 0) >= 500;
}

export function createAuthClient(cookieMethods: CookieMethodsServer) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const appUrl = process.env.APP_URL;

  if (!url || !key || !appUrl) {
    return null;
  }

  const origin = new URL(appUrl);
  const client = createServerClient(url, key, {
    cookies: cookieMethods,
    cookieOptions: {
      httpOnly: true,
      secure: origin.protocol === "https:",
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });

  return { client, origin };
}

export async function createRequestAuthClient(mode: "read" | "write") {
  const cookieStore = await cookies();

  return createAuthClient({
    getAll: () => cookieStore.getAll(),
    setAll: (updates) => {
      if (mode === "write") {
        for (const { name, value, options } of updates) {
          cookieStore.set(name, value, options);
        }
      }
    },
  });
}
