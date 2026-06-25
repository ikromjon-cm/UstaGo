from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import PaymentViewSet, PayoutViewSet
from .webhooks import click_webhook, payme_webhook, uzum_webhook

router = DefaultRouter()
router.register(r"", PaymentViewSet, basename="payments")
router.register(r"payouts", PayoutViewSet, basename="payouts")

urlpatterns = [
    path("webhooks/payme/", payme_webhook, name="payments-webhook-payme"),
    path("webhooks/click/", click_webhook, name="payments-webhook-click"),
    path("webhooks/uzum/", uzum_webhook, name="payments-webhook-uzum"),
] + router.urls
