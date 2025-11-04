import os
from typing import Optional

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser

from drf_spectacular.utils import extend_schema

from .serializers import (
    MessageSerializer,
    ListingListSerializer,
    ListingDetailSerializer,
    ListingCreateUpdateSerializer,
    ListingImageSerializer,
    FavoriteSerializer,
    ReviewSerializer,
    ReviewCreateSerializer,
    ConversationSerializer,
    ConversationDetailSerializer,
    ChatMessageSerializer,
    ChatMessageCreateSerializer,
)
from .models import (
    Listing,
    ListingImage,
    Favorite,
    Review,
    Conversation,
    Message as ChatMessage,
    ModerationStatus,
)
from .filters import ListingFilter
from .auth.permissions import IsAuthenticatedJWT
from .auth.jwt_utils import decode as jwt_decode


class HelloView(APIView):
    """
    A simple API endpoint that returns a greeting message.
    """

    @extend_schema(
        responses={200: MessageSerializer}, description="Get a hello world message"
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = MessageSerializer(data)
        return Response(serializer.data)


class SchemaYamlView(APIView):
    """Serve the api_schema.yaml file as text/yaml."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        path = os.path.join(settings.BASE_DIR, "api_schema.yaml")
        if not os.path.exists(path):
            return Response({"detail": "Schema file not found"}, status=status.HTTP_404_NOT_FOUND)
        with open(path, "rb") as f:
            content = f.read()
        return HttpResponse(content, content_type="text/yaml")


class StandardPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 100


# Utility: try to resolve current user from Bearer token without enforcing auth
def _try_get_user_from_bearer(request) -> Optional[object]:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1].strip()
    try:
        payload = jwt_decode(token)
        if payload.get("token_type") != "access":
            return None
        from django.contrib.auth import get_user_model
        User = get_user_model()
        return User.objects.filter(id=payload.get("user_id")).first()
    except Exception:
        return None


class CatalogListingListCreateView(generics.ListCreateAPIView):
    queryset = Listing.objects.select_related("seller", "make", "car_model", "location").all()
    filterset_class = ListingFilter
    pagination_class = StandardPagination

    def get_serializer_class(self):
        if self.request.method.lower() == "post":
            return ListingCreateUpdateSerializer
        return ListingListSerializer

    def get_permissions(self):
        if self.request.method.lower() == "post":
            return [IsAuthenticatedJWT()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = super().get_queryset()
        # Visibility: only APPROVED for everyone, owner sees own any
        user = _try_get_user_from_bearer(self.request)
        if user is not None:
            qs = qs.filter(Q(status=ModerationStatus.APPROVED) | Q(seller=user))
        else:
            qs = qs.filter(status=ModerationStatus.APPROVED)

        # Sorting
        sort = self.request.query_params.get("sort") or "created_desc"
        mapping = {
            "created_desc": "-created_at",
            "created_asc": "created_at",
            "price_asc": "price",
            "price_desc": "-price",
            "year_desc": "-year",
            "year_asc": "year",
        }
        order = mapping.get(sort, "-created_at")
        qs = qs.order_by(order, "-id")
        return qs

    def list(self, request, *args, **kwargs):
        # Apply django-filter manually via filterset_class because base doesn't add backend by default
        filterset = self.filterset_class(request.GET, queryset=self.get_queryset())
        if not filterset.is_valid():
            return Response({"detail": filterset.errors}, status=status.HTTP_400_BAD_REQUEST)
        queryset = filterset.qs
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        # Force PENDING on create, seller is current user (permission already enforced)
        listing = serializer.save()
        listing.status = ModerationStatus.PENDING
        listing.rejection_reason = None
        listing.save(update_fields=["status", "rejection_reason"])

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Return full detail on create
        detail = ListingDetailSerializer(serializer.instance)
        headers = self.get_success_headers(detail.data)
        return Response(detail.data, status=status.HTTP_201_CREATED, headers=headers)


class CatalogListingRetrieveUpdateDestroyView(APIView):
    def get_permissions(self):
        if self.request.method.lower() in ("patch", "delete"):
            return [IsAuthenticatedJWT()]
        return [permissions.AllowAny()]

    def get_object(self, request, pk):
        listing = get_object_or_404(
            Listing.objects.select_related("seller", "make", "car_model", "location").prefetch_related("images"),
            pk=pk,
        )
        if request.method.lower() == "get":
            user = _try_get_user_from_bearer(request)
            if listing.status == ModerationStatus.APPROVED:
                return listing
            if user and (user.is_staff or user.id == listing.seller_id):
                return listing
            return None
        else:
            # For PATCH/DELETE permission class ensures request.user is set
            user = request.user
            if user.is_staff or listing.seller_id == user.id:
                return listing
            return None

    def get(self, request, pk):
        obj = self.get_object(request, pk)
        if obj is None:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(ListingDetailSerializer(obj).data)

    def patch(self, request, pk):
        for perm in self.get_permissions():
            if not perm.has_permission(request, self):
                return Response({"detail": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        obj = self.get_object(request, pk)
        if obj is None:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        serializer = ListingCreateUpdateSerializer(instance=obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ListingDetailSerializer(obj).data)

    def delete(self, request, pk):
        for perm in self.get_permissions():
            if not perm.has_permission(request, self):
                return Response({"detail": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        obj = self.get_object(request, pk)
        if obj is None:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ListingImageUploadView(APIView):
    permission_classes = [IsAuthenticatedJWT]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        listing = get_object_or_404(Listing, pk=pk)
        if not (request.user.is_staff or listing.seller_id == request.user.id):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        image_file = request.FILES.get("image")
        if not image_file:
            return Response({"detail": "'image' file is required"}, status=status.HTTP_400_BAD_REQUEST)
        order = request.data.get("order")
        try:
            order = int(order) if order is not None else 0
        except ValueError:
            return Response({"detail": "'order' must be integer"}, status=status.HTTP_400_BAD_REQUEST)
        img = ListingImage.objects.create(listing=listing, image=image_file, order=order)
        return Response(ListingImageSerializer(img).data, status=status.HTTP_201_CREATED)


class ListingImageDeleteView(APIView):
    permission_classes = [IsAuthenticatedJWT]

    def delete(self, request, image_id):
        img = get_object_or_404(ListingImage.objects.select_related("listing"), pk=image_id)
        if not (request.user.is_staff or img.listing.seller_id == request.user.id):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FavoriteToggleView(APIView):
    permission_classes = [IsAuthenticatedJWT]

    def post(self, request, pk):
        listing = get_object_or_404(Listing, pk=pk)
        fav, created = Favorite.objects.get_or_create(user=request.user, listing=listing)
        if created:
            return Response({"status": "added"})
        return Response({"status": "exists"})

    def delete(self, request, pk):
        listing = get_object_or_404(Listing, pk=pk)
        Favorite.objects.filter(user=request.user, listing=listing).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FavoriteListView(generics.ListAPIView):
    permission_classes = [IsAuthenticatedJWT]
    serializer_class = FavoriteSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related("listing", "listing__make", "listing__car_model", "listing__location")


class SellerReviewsListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        return Review.objects.filter(seller_id=user_id).select_related("author", "seller", "listing")


class ReviewCreateView(APIView):
    permission_classes = [IsAuthenticatedJWT]

    def post(self, request):
        serializer = ReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        seller_id = serializer.validated_data["seller_id"]
        listing_id = serializer.validated_data.get("listing_id")
        rating = serializer.validated_data["rating"]
        text = serializer.validated_data.get("text", "")

        if seller_id == request.user.id:
            return Response({"detail": "You cannot review yourself"}, status=status.HTTP_400_BAD_REQUEST)

        listing = None
        if listing_id is not None:
            listing = get_object_or_404(Listing, pk=listing_id)
            if listing.seller_id != seller_id:
                return Response({"detail": "Listing does not belong to the seller"}, status=status.HTTP_400_BAD_REQUEST)

        review = Review.objects.create(author=request.user, seller_id=seller_id, rating=rating, text=text, listing=listing)
        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


class ReviewDeleteView(APIView):
    permission_classes = [IsAuthenticatedJWT]

    def delete(self, request, pk):
        review = get_object_or_404(Review, pk=pk)
        if not (request.user.is_staff or review.author_id == request.user.id):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ConversationsView(APIView):
    permission_classes = [IsAuthenticatedJWT]

    def get(self, request):
        qs = Conversation.objects.filter(Q(seller_id=request.user.id) | Q(buyer_id=request.user.id)).select_related("seller", "buyer", "listing", "listing__make", "listing__car_model", "listing__location").order_by("-last_message_at", "-created_at")
        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = ConversationSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        # seller_id, listing_id, text
        seller_id = request.data.get("seller_id")
        listing_id = request.data.get("listing_id")
        text = request.data.get("text")
        try:
            seller_id = int(seller_id)
            listing_id = int(listing_id)
        except (TypeError, ValueError):
            return Response({"detail": "seller_id and listing_id must be integers"}, status=status.HTTP_400_BAD_REQUEST)
        if not text or not isinstance(text, str) or not text.strip():
            return Response({"detail": "text is required"}, status=status.HTTP_400_BAD_REQUEST)

        listing = get_object_or_404(Listing.objects.select_related("seller"), pk=listing_id)
        if listing.seller_id != seller_id:
            return Response({"detail": "Listing seller mismatch"}, status=status.HTTP_400_BAD_REQUEST)
        if seller_id == request.user.id:
            return Response({"detail": "Cannot start a conversation with yourself"}, status=status.HTTP_400_BAD_REQUEST)

        # Find or create active conversation
        conv = Conversation.objects.filter(seller_id=seller_id, buyer_id=request.user.id, listing_id=listing_id, is_active=True).first()
        if conv is None:
            conv = Conversation.objects.create(seller_id=seller_id, buyer_id=request.user.id, listing_id=listing_id)
        # Create first message
        msg = ChatMessage.objects.create(conversation=conv, author=request.user, text=text.strip())
        return Response({
            "conversation": ConversationDetailSerializer(conv).data,
            "message": ChatMessageSerializer(msg).data,
        }, status=status.HTTP_201_CREATED)


class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticatedJWT]

    def get(self, request, pk):
        conv = get_object_or_404(Conversation.objects.select_related("seller", "buyer", "listing", "listing__make", "listing__car_model", "listing__location"), pk=pk)
        if request.user.id not in (conv.seller_id, conv.buyer_id) and not request.user.is_staff:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        return Response(ConversationDetailSerializer(conv).data)


class ConversationMessagesView(APIView):
    permission_classes = [IsAuthenticatedJWT]

    def get(self, request, pk):
        conv = get_object_or_404(Conversation, pk=pk)
        if request.user.id not in (conv.seller_id, conv.buyer_id) and not request.user.is_staff:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        # Mark opponent messages as read when fetched
        ChatMessage.objects.filter(conversation=conv, read_at__isnull=True).exclude(author=request.user).update(read_at=timezone.now())
        qs = conv.messages.select_related("author").order_by("created_at", "id")
        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = ChatMessageSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request, pk):
        conv = get_object_or_404(Conversation, pk=pk)
        if request.user.id not in (conv.seller_id, conv.buyer_id) and not request.user.is_staff:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        serializer = ChatMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        msg = ChatMessage.objects.create(conversation=conv, author=request.user, text=serializer.validated_data["text"].strip())
        return Response(ChatMessageSerializer(msg).data, status=status.HTTP_201_CREATED)
