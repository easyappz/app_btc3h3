from django.urls import path
from .views import (
    HelloView,
    SchemaYamlView,
    CatalogListingListCreateView,
    CatalogListingRetrieveUpdateDestroyView,
    ListingImageUploadView,
    ListingImageDeleteView,
    FavoriteToggleView,
    FavoriteListView,
    SellerReviewsListView,
    ReviewCreateView,
    ReviewDeleteView,
    ConversationsView,
    ConversationDetailView,
    ConversationMessagesView,
)
from .auth.views import RegisterView, LoginView, RefreshView, ProfileMeView

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    path("schema/yaml/", SchemaYamlView.as_view(), name="schema-yaml"),
    # Auth endpoints
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", RefreshView.as_view(), name="auth-refresh"),
    # Profile endpoints
    path("profile/me/", ProfileMeView.as_view(), name="profile-me"),

    # Catalog
    path("catalog/listings/", CatalogListingListCreateView.as_view(), name="catalog-listings"),
    path("catalog/listings/<int:pk>/", CatalogListingRetrieveUpdateDestroyView.as_view(), name="catalog-listing-detail"),
    path("catalog/listings/<int:pk>/images/", ListingImageUploadView.as_view(), name="catalog-listing-images"),
    path("catalog/images/<int:image_id>/", ListingImageDeleteView.as_view(), name="catalog-image-detail"),

    # Favorites
    path("catalog/listings/<int:pk>/favorite/", FavoriteToggleView.as_view(), name="catalog-listing-favorite"),
    path("catalog/favorites/", FavoriteListView.as_view(), name="catalog-favorites"),

    # Reviews
    path("reviews/seller/<int:user_id>/", SellerReviewsListView.as_view(), name="reviews-seller"),
    path("reviews/", ReviewCreateView.as_view(), name="reviews-create"),
    path("reviews/<int:pk>/", ReviewDeleteView.as_view(), name="reviews-delete"),

    # Chat
    path("chat/conversations/", ConversationsView.as_view(), name="chat-conversations"),
    path("chat/conversations/<int:pk>/", ConversationDetailView.as_view(), name="chat-conversation-detail"),
    path("chat/conversations/<int:pk>/messages/", ConversationMessagesView.as_view(), name="chat-conversation-messages"),
]
