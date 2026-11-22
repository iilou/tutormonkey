"use server";

import { redirect } from "next/navigation";
import { createRequestAuthClient } from "@/lib/supabase/server";

export async function signOut() {
  const auth = await createRequestAuthClient("write");
  if (!auth) {
    redirect("/login?error=unavailable");
  }

  const { error } = await auth.client.auth.signOut({ scope: "local" });
  if (error) {
    redirect("/library?error=sign-out");
  }

  redirect("/login");
}
