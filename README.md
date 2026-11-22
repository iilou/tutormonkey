# TutorMonkey

TutorMonkey is a document reader for learning. Project requirements and milestones live in [docs](docs/outline.md).

## Local development

Use Node.js 24, pnpm 12.21.0, Python 3.12, and uv. The login page and API health endpoint run without service credentials. Google sign-in uses the development Supabase project described below.

From the repository root, start the web app in one terminal.

```sh
cd apps/web
pnpm install --frozen-lockfile
pnpm dev
```

Open [the web app](http://localhost:3000).

In a second terminal, follow the [API setup](apps/api/README.md) to start FastAPI on port 8000.

## Local Google sign-in

1. Enable Google in the development project's Supabase Auth settings. In the Google OAuth client, register the Supabase callback shown in those settings as an authorized redirect URI.
2. In Supabase Auth URL Configuration, add `http://localhost:3000/auth/callback` to the redirect allow list.
3. Copy `apps/web/.env.example` to `apps/web/.env.local` and set the development project's URL and publishable API key. Use `APP_URL=http://localhost:3000` when opening the app on that origin. If you change the origin, update the Supabase redirect allow list and `APP_URL` together.
4. Restart Next.js, open `http://localhost:3000/library` in a signed-out browser, and confirm it redirects to login. Complete Google sign-in, confirm the library shows your account, then sign out and revisit the library to confirm it requires sign-in again.

OAuth provider setup is documented in the [Supabase Google sign-in guide](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).

## Frontend checks

From `apps/web`, run the following commands.

```sh
pnpm lint
pnpm typecheck
pnpm build
```

`pnpm typecheck` regenerates Next.js route types in `.next/types` before running TypeScript. This keeps old development route validators from affecting the check.

After a successful build, stop the development server before running `pnpm start` on the same port.
