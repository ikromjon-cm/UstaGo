import hashlib
import json
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .models import Payment


class PaymentService:
    @staticmethod
    @transaction.atomic
    def create_payment(order, method="wallet", payment=None):
        commission_percent = settings.CONSTANCE_CONFIG["PLATFORM_COMMISSION"][0]
        amount = order.final_price or order.budget or 0
        commission_amount = (
            Decimal(str(amount)) * Decimal(str(commission_percent))
        ) / Decimal("100")
        net_amount = Decimal(str(amount)) - commission_amount

        payment = (
            payment
            or Payment.objects.filter(order=order, customer=order.customer)
            .order_by("-created_at")
            .first()
        )
        if payment:
            payment.master = order.master.user if order.master else payment.master
            payment.amount = amount
            payment.commission_percent = commission_percent
            payment.commission_amount = commission_amount
            payment.net_amount = net_amount
            payment.method = method
            payment.status = Payment.Status.PENDING
            payment.payment_url = ""
            payment.save(
                update_fields=[
                    "master",
                    "amount",
                    "commission_percent",
                    "commission_amount",
                    "net_amount",
                    "method",
                    "status",
                    "payment_url",
                ]
            )
        else:
            payment = Payment.objects.create(
                order=order,
                customer=order.customer,
                master=order.master.user if order.master else None,
                amount=amount,
                commission_percent=commission_percent,
                commission_amount=commission_amount,
                net_amount=net_amount,
                method=method,
                status=Payment.Status.PENDING,
            )

        if method == "wallet":
            from apps.users.services import WalletService

            WalletService.hold_funds(order.customer, float(amount))
            payment.status = Payment.Status.HELD
            payment.save(update_fields=["status"])
            order.is_paid = True
            order.save(update_fields=["is_paid"])
        elif method in ["payme", "click", "uzum"]:
            payment_url = PaymentService.generate_payment_url(payment, method)
            payment.payment_url = payment_url
            payment.save(update_fields=["payment_url"])
        return payment

    @staticmethod
    def generate_payment_url(payment, method):
        base_url = "https://api.ustago.uz/pay"
        if method == "payme":
            return f"{base_url}/payme/{payment.id}"
        elif method == "click":
            return f"{base_url}/click/{payment.id}"
        elif method == "uzum":
            return f"{base_url}/uzum/{payment.id}"
        return ""

    @staticmethod
    @transaction.atomic
    def verify_payment(payment_id, transaction_id, status):
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return None
        if status == "success":
            payment.status = Payment.Status.HELD
            payment.transaction_id = transaction_id
            payment.paid_at = timezone.now()
            payment.save()
            if not payment.order.is_paid:
                payment.order.is_paid = True
                payment.order.save(update_fields=["is_paid"])
        elif status == "failed":
            payment.status = Payment.Status.FAILED
            payment.save()
        return payment

    @staticmethod
    @transaction.atomic
    def release_payment(payment_id):
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return None
        if payment.status != Payment.Status.HELD:
            raise ValueError("Payment is not in held state")
        payment.status = Payment.Status.COMPLETED
        payment.save()
        return payment

    @staticmethod
    @transaction.atomic
    def refund_payment(payment_id):
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return None
        if payment.status not in [Payment.Status.HELD, Payment.Status.COMPLETED]:
            raise ValueError("Payment cannot be refunded")
        from apps.users.services import WalletService

        WalletService.add_funds(payment.customer, float(payment.amount), "refund")
        payment.status = Payment.Status.REFUNDED
        payment.refunded_at = timezone.now()
        payment.save()
        return payment

    @staticmethod
    @transaction.atomic
    def dispute_payment(payment_id, reason):
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return None
        if payment.status not in [Payment.Status.HELD, Payment.Status.COMPLETED]:
            raise ValueError("Payment cannot be disputed")
        payment.status = Payment.Status.DISPUTED
        payment.metadata["dispute_reason"] = reason
        payment.metadata["disputed_at"] = str(timezone.now())
        payment.save(update_fields=["status", "metadata"])
        return payment
