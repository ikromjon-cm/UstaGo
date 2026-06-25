from compat import extend_tags
from config.permissions import IsCustomer, IsMaster, IsOwnerOrAdmin
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import filters, generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

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
from .serializers import (
    LoginSerializer,
    MasterDocumentSerializer,
    MasterPortfolioSerializer,
    MasterProfileListSerializer,
    MasterProfileSerializer,
    MasterScheduleSerializer,
    OTPSerializer,
    RegisterSerializer,
    TokenRefreshSerializer,
    TransactionSerializer,
    UserAddressSerializer,
    UserFavoriteSerializer,
    UserSerializer,
    UserUpdateSerializer,
    UserWalletSerializer,
)
from .services import UserService, WalletService


@extend_tags(["Authentication"])
class AuthViewSet(viewsets.ViewSet):
    throttle_scope = "login"

    @extend_schema(request=RegisterSerializer, responses={201: UserSerializer})
    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        throttle_scope="register",
    )
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, otp = UserService.register(**serializer.validated_data)
        return Response(
            {
                "success": True,
                "message": "OTP sent to your phone",
                "otp": otp,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(request=LoginSerializer)
    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def login(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        tokens = {
            "access": serializer.validated_data["access"],
            "refresh": serializer.validated_data["refresh"],
        }
        return Response(
            {
                "success": True,
                "user": UserSerializer(user).data,
                "tokens": tokens,
                "access": tokens["access"],
                "refresh": tokens["refresh"],
            }
        )

    @extend_schema(request=OTPSerializer)
    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        throttle_scope="otp",
    )
    def send_otp(self, request):
        serializer = OTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(phone=serializer.validated_data["phone"])
        except User.DoesNotExist:
            return Response({"success": False, "message": "User not found"}, status=404)
        otp = UserService.send_otp(user)
        return Response({"success": True, "message": "OTP sent", "otp": otp})

    @extend_schema(request=OTPSerializer)
    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def verify_otp(self, request):
        serializer = OTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(phone=serializer.validated_data["phone"])
        except User.DoesNotExist:
            return Response({"success": False, "message": "User not found"}, status=404)
        verified = UserService.verify_otp(user, serializer.validated_data["otp"])
        if verified:
            refresh = TokenRefreshSerializer(data={"refresh": ""})
            return Response({"success": True, "message": "Phone verified"})
        return Response({"success": False, "message": "Invalid OTP"}, status=400)

    @action(
        detail=False, methods=["get", "patch"], permission_classes=[IsAuthenticated]
    )
    def profile(self, request):
        if request.method == "GET":
            return Response(UserSerializer(request.user).data)
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def logout(self, request):
        from rest_framework_simplejwt.tokens import RefreshToken

        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({"success": True, "message": "Logged out"})

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def reset_password(self, request):
        phone = request.data.get("phone")
        otp = request.data.get("otp")
        password = request.data.get("password")
        if not phone or not otp or not password:
            return Response({"error": "phone, otp and password required"}, status=400)
        if len(password) < 6:
            return Response({"error": "Password min 6 characters"}, status=400)
        user = UserService.reset_password(phone, otp, password)
        if not user:
            return Response({"error": "Invalid OTP or user not found"}, status=400)
        return Response({"success": True, "message": "Password reset successfully"})

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        user = request.user
        old = request.data.get("old_password")
        new = request.data.get("new_password")
        if not old or not new:
            return Response(
                {"error": "old_password and new_password required"}, status=400
            )
        if not user.check_password(old):
            return Response({"error": "Current password is incorrect"}, status=400)
        if len(new) < 6:
            return Response({"error": "Password min 6 characters"}, status=400)
        user.set_password(new)
        user.save(update_fields=["password"])
        return Response({"success": True, "message": "Password changed successfully"})

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def refresh_token(self, request):
        serializer = TokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


@extend_tags(["Users"])
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        if request.method == "GET":
            return Response(UserSerializer(request.user).data)
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=["patch"])
    def device_token(self, request):
        user = request.user
        user.fcm_token = request.data.get("fcm_token", user.fcm_token)
        user.device_id = request.data.get("device_id", user.device_id)
        user.device_type = request.data.get("device_type", user.device_type)
        user.save(update_fields=["fcm_token", "device_id", "device_type"])
        return Response({"success": True})


class UserAddressViewSet(viewsets.ModelViewSet):
    serializer_class = UserAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MasterProfileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MasterProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["is_online", "is_available", "is_verified", "categories"]
    search_fields = ["user__full_name", "description"]
    ordering_fields = ["rating", "completed_jobs", "response_time", "price_per_hour"]

    def get_queryset(self):
        return (
            MasterProfile.objects.select_related("user")
            .prefetch_related("categories")
            .all()
        )

    def get_serializer_class(self):
        if self.action == "list":
            return MasterProfileListSerializer
        return MasterProfileSerializer

    @action(detail=False, methods=["get"], permission_classes=[IsMaster])
    def me(self, request):
        master = self.get_queryset().get(user=request.user)
        serializer = self.get_serializer(master)
        return Response(serializer.data)

    @action(detail=False, methods=["patch"], permission_classes=[IsMaster])
    def update_status(self, request):
        master = MasterProfile.objects.get(user=request.user)
        is_online = request.data.get("is_online")
        is_available = request.data.get("is_available")
        update_fields = []
        if is_online is not None:
            master.is_online = bool(is_online)
            update_fields.append("is_online")
        if is_available is not None:
            master.is_available = bool(is_available)
            update_fields.append("is_available")
        if update_fields:
            master.save(update_fields=update_fields)
        return Response(
            MasterProfileSerializer(master, context={"request": request}).data
        )

    @extend_schema(
        parameters=[
            OpenApiParameter(name="lat", type=float, required=True),
            OpenApiParameter(name="lng", type=float, required=True),
            OpenApiParameter(name="radius", type=int, default=50),
            OpenApiParameter(name="category", type=int),
        ]
    )
    @action(detail=False, methods=["get"])
    def nearby(self, request):
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        radius = int(request.query_params.get("radius", 50))
        category = request.query_params.get("category")
        if not lat or not lng:
            return Response({"error": "lat and lng required"}, status=400)
        masters = MasterProfile.objects.filter(
            is_available=True, user__status="active"
        ).select_related("user")[:50]
        page = self.paginate_queryset(masters)
        serializer = MasterProfileListSerializer(
            page if page else masters, many=True, context={"request": request}
        )
        if page:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)


class MasterDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = MasterDocumentSerializer
    permission_classes = [IsMaster]

    def get_queryset(self):
        return MasterDocument.objects.filter(master__user=self.request.user)

    def perform_create(self, serializer):
        master = MasterProfile.objects.get(user=self.request.user)
        serializer.save(master=master)


class MasterPortfolioViewSet(viewsets.ModelViewSet):
    serializer_class = MasterPortfolioSerializer
    permission_classes = [IsMaster]

    def get_queryset(self):
        return MasterPortfolio.objects.filter(master__user=self.request.user)

    def perform_create(self, serializer):
        master = MasterProfile.objects.get(user=self.request.user)
        serializer.save(master=master)


class MasterScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = MasterScheduleSerializer
    permission_classes = [IsMaster]

    def get_queryset(self):
        return MasterSchedule.objects.filter(master__user=self.request.user).order_by(
            "date"
        )

    def perform_create(self, serializer):
        master = MasterProfile.objects.get(user=self.request.user)
        serializer.save(master=master)


class UserFavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = UserFavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserFavorite.objects.filter(user=self.request.user).select_related(
            "master__user"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["post"])
    def toggle(self, request):
        master_id = request.data.get("master")
        if not master_id:
            return Response({"error": "master required"}, status=400)
        try:
            master = MasterProfile.objects.get(id=master_id)
        except MasterProfile.DoesNotExist:
            return Response({"error": "Master not found"}, status=404)
        fav, created = UserFavorite.objects.get_or_create(
            user=request.user, master=master
        )
        if not created:
            fav.delete()
            return Response({"favorited": False})
        return Response({"favorited": True})


class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserWalletSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserWallet.objects.filter(user=self.request.user)

    @action(detail=False, methods=["get"])
    def balance(self, request):
        wallet = WalletService.get_balance(request.user)
        return Response(UserWalletSerializer(wallet).data)

    @action(detail=False, methods=["get"])
    def transactions(self, request):
        wallet = WalletService.get_balance(request.user)
        transactions = Transaction.objects.filter(wallet=wallet).order_by("-created_at")
        page = self.paginate_queryset(transactions)
        serializer = TransactionSerializer(page if page else transactions, many=True)
        if page:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)
