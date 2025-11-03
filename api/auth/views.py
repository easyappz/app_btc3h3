from typing import Dict

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from drf_spectacular.utils import extend_schema

from api.models import UserProfile
from .jwt_utils import encode, decode
from .permissions import IsAuthenticatedJWT
from .serializers import (
    RegisterInputSerializer,
    LoginInputSerializer,
    RefreshInputSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    TokensSerializer,
    AccessTokenSerializer,
    AuthSuccessSerializer,
)


ACCESS_TOKEN_TTL_SECONDS = 3600
REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 3600

User = get_user_model()


def _issue_tokens_for_user(user: User) -> Dict[str, str]:
    payload_base = {"user_id": user.id}
    access = encode({**payload_base, "token_type": "access"}, ACCESS_TOKEN_TTL_SECONDS)
    refresh = encode({**payload_base, "token_type": "refresh"}, REFRESH_TOKEN_TTL_SECONDS)
    return {"access": access, "refresh": refresh}


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Register new user",
        request=RegisterInputSerializer,
        responses={201: AuthSuccessSerializer, 400: None},
        tags=["Auth"],
    )
    def post(self, request):
        serializer = RegisterInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = User(username=username, email=email)
        user.set_password(password)
        user.last_login = timezone.now()
        user.save()
        UserProfile.objects.get_or_create(user=user)

        tokens = _issue_tokens_for_user(user)
        return Response(
            {"user": ProfileSerializer(user).data, "tokens": TokensSerializer(tokens).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Login with username or email and password",
        request=LoginInputSerializer,
        responses={200: AuthSuccessSerializer, 400: None, 401: None},
        tags=["Auth"],
    )
    def post(self, request):
        serializer = LoginInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data.get("username")
        email = serializer.validated_data.get("email")
        password = serializer.validated_data["password"]

        user = None
        if username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                pass
        else:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass

        if user is None or not check_password(password, user.password):
            raise AuthenticationFailed("Invalid credentials")

        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        tokens = _issue_tokens_for_user(user)
        return Response({"user": ProfileSerializer(user).data, "tokens": TokensSerializer(tokens).data})


class RefreshView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Refresh access token",
        request=RefreshInputSerializer,
        responses={200: AccessTokenSerializer, 401: None},
        tags=["Auth"],
    )
    def post(self, request):
        serializer = RefreshInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["refresh_token"]
        try:
            payload = decode(token)
        except ValueError as exc:
            raise AuthenticationFailed(str(exc))

        if payload.get("token_type") != "refresh":
            raise AuthenticationFailed("Refresh token required")

        user_id = payload.get("user_id")
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found")

        access = encode({"user_id": user.id, "token_type": "access"}, ACCESS_TOKEN_TTL_SECONDS)
        return Response({"access": access})


class ProfileMeView(APIView):
    permission_classes = [IsAuthenticatedJWT]

    @extend_schema(
        summary="Get current user profile",
        responses={200: ProfileSerializer, 401: None},
        tags=["Profile"],
    )
    def get(self, request):
        return Response(ProfileSerializer(request.user).data)

    @extend_schema(
        summary="Update current user profile (username, email, phone)",
        request=ProfileUpdateSerializer,
        responses={200: ProfileSerializer, 400: None, 401: None},
        tags=["Profile"],
    )
    def patch(self, request):
        serializer = ProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if "username" in serializer.validated_data:
            user.username = serializer.validated_data["username"]
        if "email" in serializer.validated_data:
            user.email = serializer.validated_data["email"]
        user.save()
        # Phone in profile
        prof, _ = UserProfile.objects.get_or_create(user=user)
        if "phone" in serializer.validated_data:
            prof.phone = serializer.validated_data["phone"]
            prof.save()
        return Response(ProfileSerializer(user).data)
