import re

from django.contrib.auth import authenticate
from django.utils.translation import gettext as _
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    MasterDocument,
    MasterPortfolio,
    MasterProfile,
    MasterSchedule,
    Transaction,
    User,
    UserAddress,
    UserFavorite,
    UserWallet,
)


class OTPSerializer(serializers.Serializer):
    phone = serializers.CharField()
    otp = serializers.CharField(required=False, write_only=True)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(
        write_only=True, min_length=6, required=False
    )

    class Meta:
        model = User
        fields = ["phone", "full_name", "password", "confirm_password", "role"]

    def validate_phone(self, value):
        raw_value = str(value).strip()
        cleaned = re.sub(r"[^0-9]", "", raw_value)
        if len(cleaned) < 10:
            raise serializers.ValidationError(_("Invalid phone number"))
        return raw_value if raw_value.startswith("+") else f"+{cleaned}"

    def validate(self, attrs):
        confirm_password = attrs.pop("confirm_password", attrs["password"])
        if attrs["password"] != confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": _("Passwords do not match")}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        phone = validated_data.pop("phone")
        user = User.objects.create(phone=phone, **validated_data)
        user.set_password(password)
        user.save()
        user.generate_otp()
        return user


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        phone = attrs.get("phone")
        password = attrs.get("password")
        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            raise serializers.ValidationError({"phone": _("User not found")})
        user = authenticate(
            request=self.context.get("request"),
            username=user.username,
            password=password,
        )
        if not user:
            raise serializers.ValidationError({"password": _("Invalid password")})
        if user.status != User.Status.ACTIVE:
            raise serializers.ValidationError({"phone": _("Account is not active")})
        refresh = RefreshToken.for_user(user)
        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "phone",
            "full_name",
            "avatar",
            "role",
            "status",
            "bio",
            "lang",
            "is_phone_verified",
            "is_identity_verified",
            "two_factor_enabled",
            "last_active",
            "created_at",
        ]
        read_only_fields = ["id", "last_active", "created_at"]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["full_name", "avatar", "bio", "lang"]


class UserAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at"]


class MasterProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    category_names = serializers.SerializerMethodField()

    class Meta:
        model = MasterProfile
        fields = "__all__"
        read_only_fields = [
            "id",
            "user",
            "rating",
            "rating_count",
            "completed_jobs",
            "created_at",
        ]

    def get_category_names(self, obj):
        return [
            {"id": c.id, "title": c.title, "icon": c.icon.url if c.icon else None}
            for c in obj.categories.all()
        ]


class MasterProfileListSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    distance = serializers.SerializerMethodField()

    class Meta:
        model = MasterProfile
        fields = [
            "id",
            "user",
            "categories",
            "rating",
            "rating_count",
            "completed_jobs",
            "response_time",
            "completion_rate",
            "is_online",
            "is_available",
            "is_verified",
            "price_per_hour",
            "distance",
            "latitude",
            "longitude",
        ]

    def get_distance(self, obj):
        request = self.context.get("request")
        if request and hasattr(obj, "distance"):
            return float(obj.distance)
        return None


class MasterDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterDocument
        fields = "__all__"
        read_only_fields = [
            "id",
            "master",
            "is_verified",
            "verified_by",
            "verified_at",
            "created_at",
        ]


class MasterPortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterPortfolio
        fields = "__all__"
        read_only_fields = ["id", "master", "created_at"]


class UserFavoriteSerializer(serializers.ModelSerializer):
    master_detail = MasterProfileListSerializer(source="master", read_only=True)

    class Meta:
        model = UserFavorite
        fields = ["id", "master", "master_detail", "created_at"]
        read_only_fields = ["id", "user", "created_at"]


class UserWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserWallet
        fields = ["id", "balance", "hold_balance", "total_earned", "total_withdrawn"]


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"
        read_only_fields = ["id", "wallet", "created_at", "updated_at"]


class MasterScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterSchedule
        fields = "__all__"
        read_only_fields = ["id", "master"]


class MasterScheduleBulkSerializer(serializers.Serializer):
    schedules = MasterScheduleSerializer(many=True)


class TokenRefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    access = serializers.CharField(read_only=True)

    def validate(self, attrs):
        refresh = RefreshToken(attrs["refresh"])
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
