# TutorMonkey API

From the repository root, install the locked dependencies and start FastAPI with reload enabled. The project pins Python 3.12 in `.python-version`.

```sh
cd apps/api
uv sync --locked
uv run --locked uvicorn app.main:app --reload
```

Open [the health endpoint](http://127.0.0.1:8000/health). It returns HTTP 200 with `{"status":"ok"}`.

## Supabase Auth

Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` to the same development project used by the web app. You can use an existing `.env` file or copy `.env.example` to start one. Run the API with that file from `apps/api`.

```sh
uv run --locked --env-file .env uvicorn app.main:app --reload
```

`GET /me` accepts the Supabase access token as `Authorization: Bearer <access-token>`. With a valid token, the API returns the verified user ID and email. A missing, invalid, or expired token returns HTTP 401.

Run API tests from `apps/api`.

```sh
uv run --locked python -m unittest discover -s tests -v
```
