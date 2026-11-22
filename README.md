# TutorMonkey

TutorMonkey is a document reader for learning. Project requirements and milestones live in [docs](docs/outline.md).

## Local development

Use Node.js 24, pnpm 12.21.0, Python 3.12, and uv. The starter web page and API health endpoint run without service credentials or environment variables.

From the repository root, start the web app in one terminal.

```sh
cd apps/web
pnpm install --frozen-lockfile
pnpm dev
```

Open [the web app](http://localhost:3000).

In a second terminal, follow the [API setup](apps/api/README.md) to start FastAPI on port 8000.

## Frontend checks

From `apps/web`, run the following commands.

```sh
pnpm lint
pnpm typecheck
pnpm build
```

`pnpm typecheck` regenerates Next.js route types in `.next/types` before running TypeScript. This keeps old development route validators from affecting the check.

After a successful build, stop the development server before running `pnpm start` on the same port.
