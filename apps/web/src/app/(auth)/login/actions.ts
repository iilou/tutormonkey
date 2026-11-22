"use server";

import { redirect } from "next/navigation";
import { createRequestAuthClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  const auth = await createRequestAuthClient("write");
  if (!auth) {
    redirect("/login?error=unavailable");
  }

  const { data, error } = await auth.client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: new URL("/auth/callback", auth.origin).href,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=sign-in");
  }

  redirect(data.url);
}
