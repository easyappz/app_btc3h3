from django.contrib import admin
from django import forms
from django.utils.html import format_html
from django.contrib.admin.helpers import ActionForm

from .models import (
    Make,
    CarModel,
    Location,
    Listing,
    ListingImage,
    Favorite,
    Review,
    SellerStats,
    Conversation,
    Message,
    ModerationStatus,
    UserProfile,
)


class CarModelInline(admin.TabularInline):
    model = CarModel
    extra = 0


@admin.register(Make)
class MakeAdmin(admin.ModelAdmin):
    list_display = ("id", "name",)
    search_fields = ("name",)
    inlines = [CarModelInline]


@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    list_display = ("id", "make", "name")
    search_fields = ("name", "make__name")
    list_filter = ("make",)


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "region")
    search_fields = ("name", "region")


class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 0
    readonly_fields = ("created_at", "preview",)
    fields = ("image", "order", "preview", "created_at")

    def preview(self, obj):
        if not obj or not obj.image:
            return ""
        return format_html('<img src="{}" style="max-height:80px; max-width:120px; border:1px solid #ddd;"/>', obj.image.url)

    preview.short_description = "Preview"


class ListingActionForm(ActionForm):
    reason = forms.CharField(required=False, label="Rejection reason")


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = (
        "id", "title", "seller", "make", "car_model", "price", "year", "mileage", "status", "created_at",
    )
    list_filter = (
        "status", "make", "car_model", "location", "transmission", "fuel", "body", "drive", "condition", "year",
    )
    search_fields = ("title", "description", "vin", "seller__username", "make__name", "car_model__name", "location__name")
    readonly_fields = ("created_at", "updated_at")
    inlines = [ListingImageInline]
    list_select_related = ("seller", "make", "car_model", "location")
    actions = ["approve_listings", "reject_listings"]
    action_form = ListingActionForm

    @admin.action(description="Approve selected listings")
    def approve_listings(self, request, queryset):
        updated = queryset.update(status=ModerationStatus.APPROVED, rejection_reason=None)
        self.message_user(request, f"Approved {updated} listings.")

    @admin.action(description="Reject selected listings (uses 'reason' field)")
    def reject_listings(self, request, queryset):
        reason = request.POST.get("reason") or "Rejected via bulk action"
        updated = queryset.update(status=ModerationStatus.REJECTED, rejection_reason=reason)
        self.message_user(request, f"Rejected {updated} listings with reason: {reason}")


@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ("id", "listing", "order", "created_at", "preview")
    search_fields = ("listing__title",)
    list_filter = ("listing",)
    readonly_fields = ("created_at", "preview")

    def preview(self, obj):
        if not obj or not obj.image:
            return ""
        return format_html('<img src="{}" style="max-height:80px; max-width:120px; border:1px solid #ddd;"/>', obj.image.url)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "listing", "created_at")
    search_fields = ("user__username", "listing__title")
    list_filter = ("user",)
    list_select_related = ("user", "listing")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "seller", "author", "rating", "created_at")
    list_filter = ("rating", "seller")
    search_fields = ("text", "seller__username", "author__username")
    list_select_related = ("seller", "author", "listing")
    readonly_fields = ("created_at",)


@admin.register(SellerStats)
class SellerStatsAdmin(admin.ModelAdmin):
    list_display = ("id", "seller", "rating_avg", "rating_count", "updated_at")
    search_fields = ("seller__username",)
    list_select_related = ("seller",)
    readonly_fields = ("updated_at",)


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "seller", "buyer", "listing", "is_active", "last_message_at", "created_at")
    list_filter = ("is_active", "seller", "buyer")
    search_fields = ("seller__username", "buyer__username", "listing__title")
    list_select_related = ("seller", "buyer", "listing")
    actions = ["archive_conversations"]

    @admin.action(description="Archive selected conversations")
    def archive_conversations(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"Archived {updated} conversations.")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "conversation", "author", "created_at", "read_at")
    list_filter = ("created_at", "read_at")
    search_fields = ("author__username", "conversation__id")
    list_select_related = ("conversation", "author")
    readonly_fields = ("created_at",)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "phone")
    search_fields = ("user__username", "phone")
    list_select_related = ("user",)
