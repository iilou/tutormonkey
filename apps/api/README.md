# TutorMonkey API

From the repository root, install the locked dependencies and start FastAPI with reload enabled. The project pins Python 3.12 in `.python-version`.

```sh
cd apps/api
uv sync --locked
uv run --locked uvicorn app.main:app --reload
```

Open [the health endpoint](http://127.0.0.1:8000/health). It returns HTTP 200 with `{"status":"ok"}`.
