from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthViewSet, UserViewSet, UserAddressViewSet, MasterProfileViewSet,
    MasterDocumentViewSet, MasterPortfolioViewSet, UserFavoriteViewSet,
    WalletViewSet,
)

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='users')
router.register(r'addresses', UserAddressViewSet, basename='addresses')
router.register(r'masters', MasterProfileViewSet, basename='masters')
router.register(r'documents', MasterDocumentViewSet, basename='documents')
router.register(r'portfolio', MasterPortfolioViewSet, basename='portfolio')
router.register(r'favorites', UserFavoriteViewSet, basename='favorites')
router.register(r'wallets', WalletViewSet, basename='wallets')

urlpatterns = router.urls
