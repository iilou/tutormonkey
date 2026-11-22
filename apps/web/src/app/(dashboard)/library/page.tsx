import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { createRequestAuthClient, isAuthUnavailable } from "@/lib/supabase/server";
import { signOut } from "./actions";

async function PrivateLibrary({ searchParams }: Pick<PageProps<"/library">, "searchParams">) {
  await connection();
  const auth = await createRequestAuthClient("read");
  if (!auth) {
    redirect("/login?error=unavailable");
  }

  const { data: { user }, error } = await auth.client.auth.getUser();
  if (isAuthUnavailable(error)) {
    redirect("/login?error=unavailable");
  }
  if (!user || user.is_anonymous) {
    redirect("/login");
  }

  const { error: actionError } = await searchParams;

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">Library</h1>
          {user.email && <p className="break-all text-sm text-muted">{user.email}</p>}
        </div>
        <form action={signOut}>
          <button type="submit" className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-secondary">
            Sign out
          </button>
        </form>
      </header>
      {actionError === "sign-out" && (
        <p role="alert" className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent">
          Sign-out couldn’t finish. Try again.
        </p>
      )}
    </>
  );
}

export default function LibraryPage({ searchParams }: PageProps<"/library">) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-4 px-6 py-8">
      <Suspense fallback={<p role="status" className="text-sm text-muted">Checking your session…</p>}>
        <PrivateLibrary searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
