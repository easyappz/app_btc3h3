from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from api.models import UserProfile


User = get_user_model()


class RegisterInputSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8, max_length=128)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value


class LoginInputSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True, min_length=1)

    def validate(self, attrs):
        username = attrs.get("username")
        email = attrs.get("email")
        if bool(username) == bool(email):
            # either username or email must be provided (but not both)
            raise serializers.ValidationError(
                {"non_field_errors": ["Provide either 'username' or 'email', but not both"]}
            )
        return attrs


class RefreshInputSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()


class ProfileSerializer(serializers.ModelSerializer):
    phone = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "date_joined", "last_login", "phone"]
        read_only_fields = ["id", "date_joined", "last_login", "phone"]

    def get_phone(self, obj):
        try:
            return obj.profile.phone or None
        except UserProfile.DoesNotExist:
            return None


class ProfileUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)


class TokensSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()


class AccessTokenSerializer(serializers.Serializer):
    access = serializers.CharField()


class AuthSuccessSerializer(serializers.Serializer):
    user = ProfileSerializer()
    tokens = TokensSerializer()
