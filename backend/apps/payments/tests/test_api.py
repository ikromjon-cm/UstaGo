import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.categories.models import Category
from apps.orders.models import Order
from apps.payments.models import Payment

User = get_user_model()


@pytest.mark.django_db
class TestPaymentAPI:
    def setup_method(self):
        self.client = APIClient()

    def test_pay_endpoint_reuses_existing_payment(self):
        customer = User.objects.create_user(
            phone="+998901234586",
            full_name="Payment API Customer",
            password="testpass123",
            role="customer",
        )
        master_user = User.objects.create_user(
            phone="+998901234587",
            full_name="Payment API Master",
            password="testpass123",
            role="master",
        )
        category = Category.objects.create(
            title_uz="Test",
            title_ru="Тест",
            title_en="Test",
        )
        order = Order.objects.create(
            customer=customer,
            master=master_user.master_profile,
            category=category,
            title="Accepted order",
            budget=150000,
            final_price=150000,
            address="Tashkent",
            latitude=41.3,
            longitude=69.24,
            status=Order.Status.ACCEPTED,
        )
        payment = Payment.objects.create(
            order=order,
            customer=customer,
            master=master_user,
            amount=150000,
            method=Payment.Method.WALLET,
            status=Payment.Status.PENDING,
        )

        self.client.force_authenticate(user=customer)
        response = self.client.post(
            f"/api/v1/payments/{payment.id}/pay/",
            {"method": Payment.Method.CLICK},
            format="json",
        )

        assert response.status_code == 200, response.content
        payment.refresh_from_db()

        assert response.json()["id"] == str(payment.id)
        assert Payment.objects.filter(order=order, customer=customer).count() == 1
        assert payment.method == Payment.Method.CLICK
        assert payment.status == Payment.Status.PENDING
        assert payment.payment_url.endswith(f"/click/{payment.id}")

    def test_list_payments_can_filter_by_order(self):
        customer = User.objects.create_user(
            phone="+998901234588",
            full_name="Payment Filter Customer",
            password="testpass123",
            role="customer",
        )
        category = Category.objects.create(
            title_uz="Test",
            title_ru="Тест",
            title_en="Test",
        )
        order_a = Order.objects.create(
            customer=customer,
            category=category,
            title="Order A",
            budget=90000,
            address="Tashkent",
            latitude=41.3,
            longitude=69.24,
        )
        order_b = Order.objects.create(
            customer=customer,
            category=category,
            title="Order B",
            budget=120000,
            address="Samarkand",
            latitude=39.65,
            longitude=66.96,
        )
        payment_a = Payment.objects.create(
            order=order_a,
            customer=customer,
            amount=90000,
            method=Payment.Method.CLICK,
        )
        Payment.objects.create(
            order=order_b,
            customer=customer,
            amount=120000,
            method=Payment.Method.PAYME,
        )

        self.client.force_authenticate(user=customer)
        response = self.client.get("/api/v1/payments/", {"order": str(order_a.id)})

        assert response.status_code == 200, response.content
        data = response.json()
        results = data.get("results", data)
        assert len(results) == 1
        assert results[0]["id"] == str(payment_a.id)
