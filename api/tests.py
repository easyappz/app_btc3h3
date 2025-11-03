from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status


User = get_user_model()


class AuthFlowTests(APITestCase):
    def test_register_and_profile_me(self):
        # Register
        payload = {
            "username": "john",
            "email": "john@example.com",
            "password": "StrongPassw0rd!"
        }
        res = self.client.post("/api/auth/register/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("tokens", res.data)
        access = res.data["tokens"]["access"]

        # Access profile with access token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        me = self.client.get("/api/profile/me/")
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertEqual(me.data["username"], "john")

    def test_login_and_refresh(self):
        # Prepare user
        user = User.objects.create_user(username="alice", email="alice@example.com", password="S3cretPass!")
        self.assertIsNotNone(user.id)

        # Login with username
        res = self.client.post(
            "/api/auth/login/",
            {"username": "alice", "password": "S3cretPass!"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        refresh = res.data["tokens"]["refresh"]

        # Refresh access token
        ref = self.client.post(
            "/api/auth/refresh/",
            {"refresh_token": refresh},
            format="json",
        )
        self.assertEqual(ref.status_code, status.HTTP_200_OK)
        new_access = ref.data["access"]

        # Verify new access works
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {new_access}")
        me = self.client.get("/api/profile/me/")
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertEqual(me.data["username"], "alice")

    def test_profile_without_token_denied(self):
        res = self.client.get("/api/profile/me/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
