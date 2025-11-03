from django.contrib.auth import get_user_model
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated

from .jwt_utils import decode


class IsAuthenticatedJWT(BasePermission):
    """
    Permission that requires a valid Bearer access token.
    On success attaches request.user and request.auth (payload).
    """

    def has_permission(self, request, view):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise NotAuthenticated("Authorization: Bearer <token> header is required")

        token = auth_header.split(" ", 1)[1].strip()
        try:
            payload = decode(token)
        except ValueError as exc:
            raise AuthenticationFailed(str(exc))

        token_type = payload.get("token_type")
        if token_type != "access":
            raise AuthenticationFailed("Access token required")

        user_id = payload.get("user_id")
        if not user_id:
            raise AuthenticationFailed("Invalid token payload: user_id")

        User = get_user_model()
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found")

        request.user = user
        request.auth = payload
        return True
