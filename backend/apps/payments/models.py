import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", _("Pending")
        PROCESSING = "processing", _("Processing")
        HELD = "held", _("Held in Escrow")
        COMPLETED = "completed", _("Completed")
        REFUNDED = "refunded", _("Refunded")
        FAILED = "failed", _("Failed")
        CANCELLED = "cancelled", _("Cancelled")
        DISPUTED = "disputed", _("Disputed")

    class Method(models.TextChoices):
        PAYME = "payme", _("Payme")
        CLICK = "click", _("Click")
        UZUM = "uzum", _("Uzum Bank")
        VISA = "visa", _("Visa")
        MASTERCARD = "mastercard", _("Mastercard")
        CASH = "cash", _("Cash")
        WALLET = "wallet", _("Wallet")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        "orders.Order", on_delete=models.CASCADE, related_name="payments"
    )
    customer = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="payments_made"
    )
    master = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="payments_received",
        null=True,
        blank=True,
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    commission_percent = models.DecimalField(max_digits=5, decimal_places=2, default=10)
    commission_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    method = models.CharField(
        max_length=20, choices=Method.choices, default=Method.WALLET
    )
    transaction_id = models.CharField(max_length=255, blank=True)
    payment_url = models.CharField(max_length=500, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["order"]),
            models.Index(fields=["status"]),
            models.Index(fields=["customer"]),
            models.Index(fields=["master"]),
        ]

    def __str__(self):
        return f"Payment {self.id} - {int(self.amount)} UZS"


class Payout(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", _("Pending")
        PROCESSING = "processing", _("Processing")
        COMPLETED = "completed", _("Completed")
        FAILED = "failed", _("Failed")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="payouts"
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    commission = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    bank_account = models.CharField(max_length=255, blank=True)
    card_number = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    method = models.CharField(max_length=50, default="bank")
    processed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "payouts"
        ordering = ["-created_at"]
