from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    Listing,
    ListingImage,
    Favorite,
    Review,
    Conversation,
    Message as ChatMessage,
    Make,
    CarModel,
    Location,
)


# Keep this serializer for the existing /api/hello/ endpoint
class MessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)
    timestamp = serializers.DateTimeField(read_only=True)


User = get_user_model()


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ["id", "name", "region"]


class MakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Make
        fields = ["id", "name"]


class CarModelSerializer(serializers.ModelSerializer):
    make = MakeSerializer(read_only=True)

    class Meta:
        model = CarModel
        fields = ["id", "name", "make"]


class ListingImageSerializer(serializers.ModelSerializer):
    image = serializers.FileField(read_only=True)

    class Meta:
        model = ListingImage
        fields = ["id", "image", "order", "created_at"]
        read_only_fields = ["id", "created_at"]


class ListingListSerializer(serializers.ModelSerializer):
    make = serializers.CharField(source="make.name")
    car_model = serializers.CharField(source="car_model.name")
    location = serializers.CharField(source="location.name")
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "price",
            "year",
            "mileage",
            "make",
            "car_model",
            "location",
            "status",
            "created_at",
            "main_image",
        ]

    def get_main_image(self, obj: Listing):
        first_img = obj.images.order_by("order", "id").first()
        return first_img.image.url if first_img and first_img.image else None


class ListingDetailSerializer(serializers.ModelSerializer):
    seller = UserPublicSerializer(read_only=True)
    make = MakeSerializer(read_only=True)
    car_model = CarModelSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    images = ListingImageSerializer(many=True, read_only=True)

    class Meta:
        model = Listing
        fields = [
            "id",
            "seller",
            "make",
            "car_model",
            "year",
            "price",
            "mileage",
            "transmission",
            "fuel",
            "body",
            "drive",
            "condition",
            "color",
            "location",
            "owners_count",
            "vin",
            "title",
            "description",
            "status",
            "rejection_reason",
            "created_at",
            "updated_at",
            "images",
        ]


class ListingCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = [
            "make",
            "car_model",
            "year",
            "price",
            "mileage",
            "transmission",
            "fuel",
            "body",
            "drive",
            "condition",
            "color",
            "location",
            "owners_count",
            "vin",
            "title",
            "description",
        ]

    def create(self, validated_data):
        request = self.context.get("request")
        listing = Listing(**validated_data)
        listing.seller = request.user
        listing.status = listing.status or 'PENDING'
        listing.rejection_reason = None
        listing.save()
        return listing

    def update(self, instance: Listing, validated_data):
        # Only editable fields are updated
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance


class FavoriteSerializer(serializers.ModelSerializer):
    listing = ListingListSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ["id", "listing", "created_at"]


class ReviewSerializer(serializers.ModelSerializer):
    author = UserPublicSerializer(read_only=True)
    seller = UserPublicSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ["id", "author", "seller", "rating", "text", "listing", "created_at"]


class ReviewCreateSerializer(serializers.Serializer):
    seller_id = serializers.IntegerField()
    listing_id = serializers.IntegerField(required=False, allow_null=True)
    rating = serializers.IntegerField(min_value=1, max_value=5)
    text = serializers.CharField(allow_blank=True, required=False, default="")


class ConversationSerializer(serializers.ModelSerializer):
    seller = UserPublicSerializer(read_only=True)
    buyer = UserPublicSerializer(read_only=True)
    listing = ListingListSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "seller", "buyer", "listing", "is_active", "last_message_at", "created_at", "last_message"]

    def get_last_message(self, obj: Conversation):
        msg = obj.messages.order_by("-created_at", "-id").first()
        if not msg:
            return None
        return {
            "id": msg.id,
            "author": {"id": msg.author_id, "username": msg.author.username},
            "text": msg.text,
            "created_at": msg.created_at,
        }


class ConversationDetailSerializer(serializers.ModelSerializer):
    seller = UserPublicSerializer(read_only=True)
    buyer = UserPublicSerializer(read_only=True)
    listing = ListingListSerializer(read_only=True)

    class Meta:
        model = Conversation
        fields = ["id", "seller", "buyer", "listing", "is_active", "last_message_at", "created_at"]


class ChatMessageSerializer(serializers.ModelSerializer):
    author = UserPublicSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ["id", "author", "text", "created_at", "read_at"]


class ChatMessageCreateSerializer(serializers.Serializer):
    text = serializers.CharField(min_length=1)
