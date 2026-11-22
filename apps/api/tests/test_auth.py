from unittest import IsolatedAsyncioTestCase
from unittest.mock import patch

import httpx

from app.main import app


class AuthTests(IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://testserver"
        )
        self.addAsyncCleanup(self.client.aclose)
        environment = patch.dict(
            "os.environ",
            {
                "SUPABASE_URL": "https://project.example",
                "SUPABASE_PUBLISHABLE_KEY": "sb_publishable_test",
            },
        )
        environment.start()
        self.addCleanup(environment.stop)
        request = patch("app.api.deps.httpx.get")
        self.auth_request = request.start()
        self.addCleanup(request.stop)

    async def test_missing_or_malformed_token_is_rejected_locally(self) -> None:
        for headers in ({}, {"Authorization": "Basic abc"}, {"Authorization": "Bearer invalid"}):
            with self.subTest(headers=headers):
                response = await self.client.get("/me", headers=headers)
                self.assertEqual(response.status_code, 401)
                self.assertEqual(response.headers["WWW-Authenticate"], "Bearer")
        self.auth_request.assert_not_called()

    async def test_tokens_rejected_by_supabase_are_unauthorized(self) -> None:
        for token, status in (("header.invalid.signature", 401), ("header.expired.signature", 403)):
            with self.subTest(token=token):
                self.auth_request.return_value = httpx.Response(status)
                response = await self.client.get("/me", headers={"Authorization": f"Bearer {token}"})
                self.assertEqual(response.status_code, 401)

    async def test_valid_token_returns_only_verified_profile_fields(self) -> None:
        user = {"id": "b758e1b6-dc81-4a3a-97cd-ab2ba614a044", "email": "reader@example.test"}
        self.auth_request.return_value = httpx.Response(
            200, json={**user, "app_metadata": {"provider": "google"}}
        )
        response = await self.client.get(
            "/me", headers={"Authorization": "Bearer header.valid.signature"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), user)
        self.assertEqual(response.headers["Cache-Control"], "private, no-store")
        self.auth_request.assert_called_once_with(
            "https://project.example/auth/v1/user",
            headers={
                "apikey": "sb_publishable_test",
                "Authorization": "Bearer header.valid.signature",
            },
            timeout=5,
        )

    async def test_anonymous_user_is_unauthorized(self) -> None:
        self.auth_request.return_value = httpx.Response(
            200, json={"id": "b758e1b6-dc81-4a3a-97cd-ab2ba614a044", "is_anonymous": True}
        )
        response = await self.client.get(
            "/me", headers={"Authorization": "Bearer header.anonymous.signature"}
        )

        self.assertEqual(response.status_code, 401)

    async def test_provider_failure_fails_closed(self) -> None:
        self.auth_request.side_effect = httpx.ConnectTimeout("upstream unavailable")
        response = await self.client.get(
            "/me", headers={"Authorization": "Bearer header.valid.signature"}
        )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {"detail": "Authentication is unavailable"})

    async def test_health_is_public(self) -> None:
        response = await self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})
        self.auth_request.assert_not_called()
