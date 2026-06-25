from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AuthViewSet,
    MasterDocumentViewSet,
    MasterPortfolioViewSet,
    MasterProfileViewSet,
    MasterScheduleViewSet,
    UserAddressViewSet,
    UserFavoriteViewSet,
    UserViewSet,
    WalletViewSet,
)

router = DefaultRouter()
router.register(r"auth", AuthViewSet, basename="auth")
router.register(r"users", UserViewSet, basename="users")
router.register(r"addresses", UserAddressViewSet, basename="addresses")
router.register(r"masters", MasterProfileViewSet, basename="masters")
router.register(r"documents", MasterDocumentViewSet, basename="documents")
router.register(r"portfolio", MasterPortfolioViewSet, basename="portfolio")
router.register(r"schedules", MasterScheduleViewSet, basename="schedules")
router.register(r"favorites", UserFavoriteViewSet, basename="favorites")
router.register(r"wallets", WalletViewSet, basename="wallets")

legacy_auth_patterns = [
    path(
        "auth/auth/change_password/",
        AuthViewSet.as_view({"post": "change_password"}),
        name="legacy-auth-change-password",
    ),
]

urlpatterns = legacy_auth_patterns + router.urls
