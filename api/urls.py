from django.urls import path
from .views import HelloView
from .auth.views import RegisterView, LoginView, RefreshView, ProfileMeView

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    # Auth endpoints
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", RefreshView.as_view(), name="auth-refresh"),
    # Profile endpoints
    path("profile/me/", ProfileMeView.as_view(), name="profile-me"),
]
