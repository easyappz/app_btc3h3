from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError

from api.models import Make, CarModel, Location, Listing, ListingImage, Review, SellerStats


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


class ListingModelValidationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="seller", password="pass12345")
        self.make1 = Make.objects.create(name="Toyota")
        self.make2 = Make.objects.create(name="Honda")
        self.cm_toyota = CarModel.objects.create(make=self.make1, name="Camry")
        self.cm_honda = CarModel.objects.create(make=self.make2, name="Civic")
        self.loc = Location.objects.create(name="New York", region="NY")

    def _base_listing_kwargs(self):
        return dict(
            seller=self.user,
            make=self.make1,
            car_model=self.cm_toyota,
            year=2020,
            price=15000,
            mileage=50000,
            transmission="AUTO",
            fuel="GASOLINE",
            body="SEDAN",
            drive="FWD",
            condition="USED",
            color="Black",
            location=self.loc,
            owners_count=1,
            vin="1234567890VIN",
            title="Great car",
            description="Nice condition",
        )

    def test_car_model_must_match_make(self):
        data = self._base_listing_kwargs()
        # Intentionally mismatch model and make
        data["car_model"] = self.cm_honda
        listing = Listing(**data)
        with self.assertRaises(ValidationError):
            listing.save()

    def test_valid_listing_saves(self):
        listing = Listing(**self._base_listing_kwargs())
        listing.save()
        self.assertIsNotNone(listing.id)


class ListingImageValidationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="seller", password="pass12345")
        self.make = Make.objects.create(name="Tesla")
        self.carmodel = CarModel.objects.create(make=self.make, name="Model 3")
        self.loc = Location.objects.create(name="San Francisco", region="CA")
        self.listing = Listing.objects.create(
            seller=self.user,
            make=self.make,
            car_model=self.carmodel,
            year=2021,
            price=35000,
            mileage=10000,
            transmission="AUTO",
            fuel="ELECTRIC",
            body="SEDAN",
            drive="RWD",
            condition="USED",
            color="White",
            location=self.loc,
            owners_count=1,
            vin="VIN123456789",
            title="Tesla Model 3",
            description="Excellent",
        )

    def test_rejects_unsupported_extension(self):
        bad_file = SimpleUploadedFile("malware.exe", b"abc", content_type="application/octet-stream")
        img = ListingImage(listing=self.listing, image=bad_file, order=0)
        with self.assertRaises(ValidationError):
            img.save()

    def test_accepts_supported_extensions(self):
        for name in ["photo.jpg", "image.JPEG", "pic.png", "cover.webp", "scan.heic"]:
            up = SimpleUploadedFile(name, b"binarydata", content_type="application/octet-stream")
            img = ListingImage(listing=self.listing, image=up, order=1)
            img.save()
            self.assertIsNotNone(img.id)
            img.delete()


class SellerStatsSignalTests(TestCase):
    def setUp(self):
        self.seller = User.objects.create_user(username="bob", password="pass123")
        self.author = User.objects.create_user(username="ann", password="pass123")
        self.make = Make.objects.create(name="Ford")
        self.carmodel = CarModel.objects.create(make=self.make, name="Focus")
        self.loc = Location.objects.create(name="Austin", region="TX")
        self.listing = Listing.objects.create(
            seller=self.seller,
            make=self.make,
            car_model=self.carmodel,
            year=2015,
            price=8000,
            mileage=90000,
            transmission="AUTO",
            fuel="GASOLINE",
            body="SEDAN",
            drive="FWD",
            condition="USED",
            color="Blue",
            location=self.loc,
            owners_count=2,
            vin="VINFOCUS123",
            title="Ford Focus",
            description="Reliable",
        )

    def test_stats_update_on_review_create_and_delete(self):
        r1 = Review.objects.create(author=self.author, seller=self.seller, rating=4, listing=self.listing)
        stats = SellerStats.objects.get(seller=self.seller)
        self.assertEqual(stats.rating_avg, 4.0)
        self.assertEqual(stats.rating_count, 1)

        r2 = Review.objects.create(author=self.author, seller=self.seller, rating=2, listing=self.listing)
        stats.refresh_from_db()
        self.assertAlmostEqual(stats.rating_avg, 3.0)
        self.assertEqual(stats.rating_count, 2)

        r1.delete()
        stats.refresh_from_db()
        self.assertEqual(stats.rating_count, 1)
        self.assertEqual(stats.rating_avg, 2.0)
