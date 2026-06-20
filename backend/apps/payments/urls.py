from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, PayoutViewSet

router = DefaultRouter()
router.register(r'', PaymentViewSet, basename='payments')
router.register(r'payouts', PayoutViewSet, basename='payouts')

urlpatterns = router.urls
