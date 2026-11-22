import { Suspense } from "react";
import { signInWithGoogle } from "./actions";

async function LoginError({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { error } = await searchParams;

  if (error !== "unavailable" && error !== "sign-in") {
    return null;
  }

  return (
    <p role="alert" className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent">
      {error === "unavailable"
        ? "Sign-in is currently unavailable. Try again later."
        : "Google sign-in couldn’t finish. Try signing in again."}
    </p>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      <div className="space-y-5 rounded-xl border border-border bg-surface p-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">TutorMonkey</h1>
          <p className="text-sm text-muted">Sign in to your private library.</p>
        </header>
        <Suspense fallback={null}>
          <LoginError searchParams={searchParams} />
        </Suspense>
        <form action={signInWithGoogle}>
          <button type="submit" className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Continue with Google
          </button>
        </form>
      </div>
    </main>
  );
}
