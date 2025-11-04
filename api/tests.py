from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from django.utils import timezone

from api.models import Make, CarModel, Location, Listing, ListingImage, Review, SellerStats, ModerationStatus
from api.auth.jwt_utils import encode as jwt_encode


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


# ---------------- New endpoint-level tests ----------------

class CatalogEndpointsTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(username="seller_u", password="pass123")
        self.other = User.objects.create_user(username="other_u", password="pass123")
        self.make_toyota = Make.objects.create(name="Toyota")
        self.cm_camry = CarModel.objects.create(make=self.make_toyota, name="Camry")
        self.loc = Location.objects.create(name="Moscow", region="RU")

    def _auth(self, user):
        token = jwt_encode({"user_id": user.id, "token_type": "access"}, 3600)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_create_listing_requires_auth(self):
        payload = {
            "make": self.make_toyota.id,
            "car_model": self.cm_camry.id,
            "year": 2020,
            "price": 1000000,
            "mileage": 50000,
            "transmission": "AUTO",
            "fuel": "GASOLINE",
            "body": "SEDAN",
            "drive": "FWD",
            "condition": "USED",
            "color": "Black",
            "location": self.loc.id,
            "owners_count": 1,
            "vin": "VIN001",
            "title": "Toyota Camry",
            "description": "Nice",
        }
        res = self.client.post("/api/catalog/listings/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        self._auth(self.seller)
        res2 = self.client.post("/api/catalog/listings/", payload, format="json")
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res2.data["status"], "PENDING")

    def test_visibility_and_filters(self):
        # Create 2 listings, one APPROVED, one PENDING
        l1 = Listing.objects.create(
            seller=self.seller,
            make=self.make_toyota,
            car_model=self.cm_camry,
            year=2019,
            price=900000,
            mileage=70000,
            transmission="AUTO",
            fuel="GASOLINE",
            body="SEDAN",
            drive="FWD",
            condition="USED",
            color="White",
            location=self.loc,
            owners_count=1,
            vin="VIN002",
            title="Camry Approved",
            description="Approved",
            status=ModerationStatus.APPROVED,
        )
        l2 = Listing.objects.create(
            seller=self.seller,
            make=self.make_toyota,
            car_model=self.cm_camry,
            year=2020,
            price=1200000,
            mileage=30000,
            transmission="AUTO",
            fuel="GASOLINE",
            body="SEDAN",
            drive="FWD",
            condition="USED",
            color="Black",
            location=self.loc,
            owners_count=1,
            vin="VIN003",
            title="Camry Pending",
            description="Pending",
            status=ModerationStatus.PENDING,
        )
        # Anonymous sees only APPROVED
        res = self.client.get("/api/catalog/listings/?make=Toyota")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 1)
        self.assertEqual(res.data["results"][0]["title"], "Camry Approved")
        # Seller sees both
        self._auth(self.seller)
        res2 = self.client.get("/api/catalog/listings/?make=Toyota")
        self.assertEqual(res2.data["count"], 2)


class ImageUploadEndpointsTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(username="im_seller", password="pass123")
        self.other = User.objects.create_user(username="im_other", password="pass123")
        self.make = Make.objects.create(name="Audi")
        self.carmodel = CarModel.objects.create(make=self.make, name="A4")
        self.loc = Location.objects.create(name="SPb", region="RU")
        self.listing = Listing.objects.create(
            seller=self.seller,
            make=self.make,
            car_model=self.carmodel,
            year=2018,
            price=800000,
            mileage=80000,
            transmission="AUTO",
            fuel="GASOLINE",
            body="SEDAN",
            drive="FWD",
            condition="USED",
            color="Gray",
            location=self.loc,
            owners_count=2,
            vin="VIN-A4-01",
            title="Audi A4",
            description="Good",
            status=ModerationStatus.PENDING,
        )

    def _auth(self, user):
        token = jwt_encode({"user_id": user.id, "token_type": "access"}, 3600)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_upload_image_permissions_and_response(self):
        # Other user forbidden
        self._auth(self.other)
        file = SimpleUploadedFile("photo.jpg", b"filecontent", content_type="image/jpeg")
        res_forbidden = self.client.post(f"/api/catalog/listings/{self.listing.id}/images/", {"image": file, "order": 0})
        self.assertEqual(res_forbidden.status_code, status.HTTP_403_FORBIDDEN)
        # Seller allowed
        self._auth(self.seller)
        file2 = SimpleUploadedFile("photo.jpg", b"filecontent", content_type="image/jpeg")
        res_ok = self.client.post(f"/api/catalog/listings/{self.listing.id}/images/", {"image": file2, "order": 0})
        self.assertEqual(res_ok.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", res_ok.data)
        self.assertIn("image", res_ok.data)


class FavoritesEndpointsTests(APITestCase):
    def setUp(self):
        self.buyer = User.objects.create_user(username="fav_buyer", password="pass123")
        self.seller = User.objects.create_user(username="fav_seller", password="pass123")
        self.make = Make.objects.create(name="BMW")
        self.carmodel = CarModel.objects.create(make=self.make, name="3 Series")
        self.loc = Location.objects.create(name="Kazan", region="RU")
        self.listing = Listing.objects.create(
            seller=self.seller,
            make=self.make,
            car_model=self.carmodel,
            year=2017,
            price=1100000,
            mileage=60000,
            transmission="AUTO",
            fuel="GASOLINE",
            body="SEDAN",
            drive="RWD",
            condition="USED",
            color="Black",
            location=self.loc,
            owners_count=2,
            vin="VIN-BMW-3S",
            title="BMW 3",
            description="Ok",
            status=ModerationStatus.APPROVED,
        )

    def _auth(self, user):
        token = jwt_encode({"user_id": user.id, "token_type": "access"}, 3600)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_favorites_flow(self):
        self._auth(self.buyer)
        add = self.client.post(f"/api/catalog/listings/{self.listing.id}/favorite/")
        self.assertEqual(add.status_code, status.HTTP_200_OK)
        lst = self.client.get("/api/catalog/favorites/")
        self.assertEqual(lst.status_code, status.HTTP_200_OK)
        self.assertEqual(lst.data["count"], 1)
        self.assertEqual(len(lst.data["results"]), 1)
        # delete
        rem = self.client.delete(f"/api/catalog/listings/{self.listing.id}/favorite/")
        self.assertEqual(rem.status_code, status.HTTP_204_NO_CONTENT)
        lst2 = self.client.get("/api/catalog/favorites/")
        self.assertEqual(lst2.data["count"], 0)


class ReviewsEndpointsTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(username="rev_seller", password="pass123")
        self.author = User.objects.create_user(username="rev_author", password="pass123")
        self.make = Make.objects.create(name="VW")
        self.carmodel = CarModel.objects.create(make=self.make, name="Golf")
        self.loc = Location.objects.create(name="Perm", region="RU")
        self.listing = Listing.objects.create(
            seller=self.seller,
            make=self.make,
            car_model=self.carmodel,
            year=2016,
            price=600000,
            mileage=120000,
            transmission="MANUAL",
            fuel="GASOLINE",
            body="HATCHBACK",
            drive="FWD",
            condition="USED",
            color="Red",
            location=self.loc,
            owners_count=3,
            vin="VIN-GOLF",
            title="VW Golf",
            description="Old but gold",
            status=ModerationStatus.APPROVED,
        )

    def _auth(self, user):
        token = jwt_encode({"user_id": user.id, "token_type": "access"}, 3600)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_create_and_delete_review(self):
        # create
        self._auth(self.author)
        payload = {"seller_id": self.seller.id, "listing_id": self.listing.id, "rating": 5, "text": "Great"}
        res = self.client.post("/api/reviews/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        rid = res.data["id"]
        # delete by other forbidden
        self._auth(self.seller)
        res_forb = self.client.delete(f"/api/reviews/{rid}/")
        self.assertEqual(res_forb.status_code, status.HTTP_403_FORBIDDEN)
        # delete by author ok
        self._auth(self.author)
        res_ok = self.client.delete(f"/api/reviews/{rid}/")
        self.assertEqual(res_ok.status_code, status.HTTP_204_NO_CONTENT)


class ChatReadAtTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(username="chat_seller", password="pass123")
        self.buyer = User.objects.create_user(username="chat_buyer", password="pass123")
        self.make = Make.objects.create(name="Nissan")
        self.carmodel = CarModel.objects.create(make=self.make, name="X-Trail")
        self.loc = Location.objects.create(name="Samara", region="RU")
        self.listing = Listing.objects.create(
            seller=self.seller,
            make=self.make,
            car_model=self.carmodel,
            year=2022,
            price=1800000,
            mileage=10000,
            transmission="CVT",
            fuel="GASOLINE",
            body="SUV",
            drive="AWD",
            condition="USED",
            color="Green",
            location=self.loc,
            owners_count=1,
            vin="VIN-NIS-01",
            title="X-Trail",
            description="Like new",
            status=ModerationStatus.APPROVED,
        )

    def _auth(self, user):
        token = jwt_encode({"user_id": user.id, "token_type": "access"}, 3600)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_read_at_marking_on_fetch(self):
        # Buyer starts conversation and sends message
        self._auth(self.buyer)
        res = self.client.post("/api/chat/conversations/", {"seller_id": self.seller.id, "listing_id": self.listing.id, "text": "Hello"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        conv_id = res.data["conversation"]["id"]
        # Seller fetches messages -> buyer's message should be marked read
        self._auth(self.seller)
        msgs = self.client.get(f"/api/chat/conversations/{conv_id}/messages/")
        self.assertEqual(msgs.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(msgs.data["count"], 1)
        first = msgs.data["results"][0]
        # read_at should be non-null string datetime
        self.assertIsNotNone(first.get("read_at"))
