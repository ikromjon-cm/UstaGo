import pytest
from django.contrib.auth import get_user_model

from apps.categories.models import Category
from apps.orders.models import Order
from apps.payments.models import Payment, Payout
from apps.users.models import MasterProfile

User = get_user_model()


@pytest.mark.django_db
class TestPaymentModel:
    def test_create_payment(self):
        customer = User.objects.create_user(
            phone="+998901234580",
            full_name="Customer Pay",
            password="testpass123",
            role="customer",
        )
        cat = Category.objects.create(
            title_uz="Santexnik", title_ru="Сантехник", title_en="Plumber"
        )
        order = Order.objects.create(
            customer=customer,
            category=cat,
            title="Fix pipe",
            budget=100000,
            address="Tashkent",
            latitude=41.3,
            longitude=69.24,
        )
        payment = Payment.objects.create(
            order=order,
            customer=customer,
            amount=100000,
            method="wallet",
        )
        assert payment.status == "pending"
        assert payment.method == "wallet"

    def test_payment_str(self):
        customer = User.objects.create_user(
            phone="+998901234581",
            full_name="Customer Str",
            password="testpass123",
        )
        cat = Category.objects.create(title_uz="Test", title_ru="Тест", title_en="Test")
        order = Order.objects.create(
            customer=customer,
            category=cat,
            title="Test order",
            budget=50000,
            address="Tashkent",
            latitude=41.3,
            longitude=69.24,
        )
        payment = Payment.objects.create(
            order=order, customer=customer, amount=50000, method="cash"
        )
        assert str(payment) == f"Payment {payment.id} - 50000 UZS"

    def test_dispute_flow(self):
        customer = User.objects.create_user(
            phone="+998901234582",
            full_name="Dispute User",
            password="testpass123",
        )
        cat = Category.objects.create(title_uz="Test", title_ru="Тест", title_en="Test")
        order = Order.objects.create(
            customer=customer,
            category=cat,
            title="Dispute order",
            budget=100000,
            address="Tashkent",
            latitude=41.3,
            longitude=69.24,
        )
        payment = Payment.objects.create(
            order=order,
            customer=customer,
            amount=100000,
            status=Payment.Status.HELD,
            method="wallet",
        )
        from apps.payments.services import PaymentService

        result = PaymentService.dispute_payment(payment.id, "Service not completed")
        assert result is not None
        assert result.status == Payment.Status.DISPUTED
        assert result.metadata["dispute_reason"] == "Service not completed"

    def test_dispute_invalid_state(self):
        customer = User.objects.create_user(
            phone="+998901234583",
            full_name="Invalid Dispute",
            password="testpass123",
        )
        cat = Category.objects.create(title_uz="Test", title_ru="Тест", title_en="Test")
        order = Order.objects.create(
            customer=customer,
            category=cat,
            title="Invalid dispute",
            budget=50000,
            address="Tashkent",
            latitude=41.3,
            longitude=69.24,
        )
        payment = Payment.objects.create(
            order=order,
            customer=customer,
            amount=50000,
            status=Payment.Status.FAILED,
            method="wallet",
        )
        from apps.payments.services import PaymentService

        with pytest.raises(ValueError, match="Payment cannot be disputed"):
            PaymentService.dispute_payment(payment.id, "Reason")

    def test_create_payment_reuses_existing_payment(self):
        customer = User.objects.create_user(
            phone="+998901234584",
            full_name="Reuse Payment",
            password="testpass123",
        )
        master_user = User.objects.create_user(
            phone="+998901234585",
            full_name="Master User",
            password="testpass123",
            role="master",
        )
        cat = Category.objects.create(title_uz="Test", title_ru="Тест", title_en="Test")
        order = Order.objects.create(
            customer=customer,
            master=master_user.master_profile,
            category=cat,
            title="Reuse order",
            budget=120000,
            final_price=120000,
            address="Tashkent",
            latitude=41.3,
            longitude=69.24,
            status="accepted",
        )
        payment = Payment.objects.create(
            order=order,
            customer=customer,
            master=master_user,
            amount=120000,
            method="wallet",
            status=Payment.Status.PENDING,
        )
        from apps.payments.services import PaymentService

        reused = PaymentService.create_payment(order, method="click", payment=payment)
        assert reused.id == payment.id
        assert Payment.objects.filter(order=order).count() == 1
        assert reused.method == "click"
        assert reused.payment_url.endswith(f"/click/{payment.id}")

    def test_verify_payment_marks_order_as_paid(self):
        customer = User.objects.create_user(
            phone="+998901234589",
            full_name="Verify Payment",
            password="testpass123",
        )
        cat = Category.objects.create(title_uz="Test", title_ru="Тест", title_en="Test")
        order = Order.objects.create(
            customer=customer,
            category=cat,
            title="Verify order",
            budget=80000,
            final_price=80000,
            address="Tashkent",
            latitude=41.3,
            longitude=69.24,
            status="accepted",
        )
        payment = Payment.objects.create(
            order=order,
            customer=customer,
            amount=80000,
            method="click",
            status=Payment.Status.PENDING,
        )
        from apps.payments.services import PaymentService

        verified = PaymentService.verify_payment(payment.id, "txn-123", "success")
        order.refresh_from_db()

        assert verified is not None
        assert verified.status == Payment.Status.HELD
        assert verified.transaction_id == "txn-123"
        assert order.is_paid is True
