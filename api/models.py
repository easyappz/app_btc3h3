from django.conf import settings
from django.db import models
from django.db.models import Q
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError


class Make(models.Model):
    name = models.CharField(max_length=64, unique=True, db_index=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class CarModel(models.Model):
    make = models.ForeignKey(Make, on_delete=models.CASCADE, related_name="models")
    name = models.CharField(max_length=64)

    class Meta:
        ordering = ["make__name", "name"]
        unique_together = ("make", "name")
        indexes = [
            models.Index(fields=["make", "name"], name="idx_carmodel_make_name"),
        ]

    def __str__(self) -> str:
        return f"{self.make.name} {self.name}"


class Location(models.Model):
    name = models.CharField(max_length=128, unique=True, db_index=True)
    region = models.CharField(max_length=128, blank=True, default="")

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name if not self.region else f"{self.name}, {self.region}"


class Transmission(models.TextChoices):
    MANUAL = "MANUAL", "Manual"
    AUTO = "AUTO", "Automatic"
    CVT = "CVT", "CVT"
    ROBOT = "ROBOT", "Robot"


class Fuel(models.TextChoices):
    GASOLINE = "GASOLINE", "Gasoline"
    DIESEL = "DIESEL", "Diesel"
    HYBRID = "HYBRID", "Hybrid"
    ELECTRIC = "ELECTRIC", "Electric"


class BodyType(models.TextChoices):
    SEDAN = "SEDAN", "Sedan"
    HATCHBACK = "HATCHBACK", "Hatchback"
    SUV = "SUV", "SUV"
    COUPE = "COUPE", "Coupe"
    WAGON = "WAGON", "Wagon"
    PICKUP = "PICKUP", "Pickup"
    VAN = "VAN", "Van"


class Drive(models.TextChoices):
    FWD = "FWD", "FWD"
    RWD = "RWD", "RWD"
    AWD = "AWD", "AWD"


class Condition(models.TextChoices):
    NEW = "NEW", "New"
    USED = "USED", "Used"


class ModerationStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"


class Listing(models.Model):
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="listings")

    make = models.ForeignKey(Make, on_delete=models.PROTECT, related_name="listings", db_index=True)
    car_model = models.ForeignKey(CarModel, on_delete=models.PROTECT, related_name="listings", db_index=True)

    year = models.PositiveSmallIntegerField(validators=[MinValueValidator(1900)], db_index=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)], db_index=True)
    mileage = models.PositiveIntegerField(validators=[MinValueValidator(0)], db_index=True)

    transmission = models.CharField(max_length=10, choices=Transmission.choices, db_index=True)
    fuel = models.CharField(max_length=10, choices=Fuel.choices, db_index=True)
    body = models.CharField(max_length=10, choices=BodyType.choices, db_index=True)
    drive = models.CharField(max_length=10, choices=Drive.choices, db_index=True)
    condition = models.CharField(max_length=10, choices=Condition.choices, db_index=True)

    color = models.CharField(max_length=32, db_index=True)
    location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name="listings", db_index=True)
    owners_count = models.PositiveSmallIntegerField(default=0, db_index=True)

    vin = models.CharField(max_length=32, null=True, blank=True, db_index=True)

    title = models.CharField(max_length=140, db_index=True)
    description = models.TextField(blank=True, default="")

    status = models.CharField(max_length=10, choices=ModerationStatus.choices, default=ModerationStatus.PENDING, db_index=True)
    rejection_reason = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["make", "car_model", "year", "price"], name="idx_listing_core"),
            models.Index(fields=["status", "created_at"], name="idx_listing_status_created"),
        ]
        constraints = [
            models.CheckConstraint(check=Q(price__gte=0), name="chk_listing_price_gte_0"),
            models.CheckConstraint(check=Q(mileage__gte=0), name="chk_listing_mileage_gte_0"),
            models.CheckConstraint(check=Q(year__gte=1900), name="chk_listing_year_gte_1900"),
            models.CheckConstraint(check=Q(owners_count__gte=0), name="chk_listing_owners_gte_0"),
        ]

    def __str__(self) -> str:
        return f"#{self.id} {self.title}"

    def clean(self):
        super().clean()
        # Ensure selected car_model belongs to the selected make
        if self.car_model_id and self.make_id:
            if self.car_model.make_id != self.make_id:
                raise ValidationError({
                    "car_model": "Selected car_model does not belong to selected make.",
                })

    def save(self, *args, **kwargs):
        # Enforce model-level validation on every save
        self.full_clean()
        return super().save(*args, **kwargs)


class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="images")
    # Use FileField to avoid Pillow dependency
    image = models.FileField(upload_to="listing_images/")
    order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["listing", "order", "id"]
        unique_together = ("listing", "order")

    def __str__(self) -> str:
        return f"Image {self.order} for Listing {self.listing_id}"


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("user", "listing")
        indexes = [
            models.Index(fields=["user", "listing"], name="idx_fav_user_listing"),
        ]

    def __str__(self) -> str:
        return f"Favorite u{self.user_id}-l{self.listing_id}"


class Review(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews_written")
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews_received")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], db_index=True)
    text = models.TextField(blank=True, default="")
    listing = models.ForeignKey(Listing, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviews")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["seller", "rating"], name="idx_review_seller_rating"),
            models.Index(fields=["author", "seller"], name="idx_review_author_seller"),
        ]
        constraints = [
            models.CheckConstraint(check=Q(rating__gte=1) & Q(rating__lte=5), name="chk_review_rating_1_5"),
        ]

    def __str__(self) -> str:
        return f"Review {self.rating}/5 by u{self.author_id} to u{self.seller_id}"


class SellerStats(models.Model):
    seller = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="seller_stats")
    rating_avg = models.FloatField(default=0.0)
    rating_count = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Seller stats"
        indexes = [
            models.Index(fields=["rating_avg", "rating_count"], name="idx_sellerstats_rating"),
        ]

    def __str__(self) -> str:
        return f"SellerStats u{self.seller_id}: {self.rating_avg:.2f} ({self.rating_count})"


class Conversation(models.Model):
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="conversations_as_seller")
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="conversations_as_buyer")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="conversations")
    is_active = models.BooleanField(default=True, db_index=True)
    last_message_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-last_message_at", "-created_at"]
        indexes = [
            models.Index(fields=["seller", "buyer", "listing"], name="idx_conv_triplet"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["seller", "buyer", "listing"],
                condition=Q(is_active=True),
                name="uniq_active_conversation",
            ),
        ]

    def __str__(self) -> str:
        return f"Conv s{self.seller_id}-b{self.buyer_id}-l{self.listing_id}"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="messages")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        ordering = ["created_at", "id"]
        indexes = [
            models.Index(fields=["conversation", "created_at"], name="idx_msg_conv_created"),
        ]

    def __str__(self) -> str:
        return f"Msg {self.id} in conv {self.conversation_id}"


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=32, blank=True, default="")

    class Meta:
        verbose_name = "User profile"
        verbose_name_plural = "User profiles"

    def __str__(self) -> str:
        return f"Profile u{self.user_id}"
