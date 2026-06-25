from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.categories.models import Category
from apps.orders.models import Order

User = get_user_model()


class OrderAPITests(TestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            phone="+998901234020",
            full_name="Customer",
            password="test123",
            username="+998901234020",
        )
        self.master_user = User.objects.create_user(
            phone="+998901234021",
            full_name="Master",
            password="test123",
            username="+998901234021",
            role="master",
        )
        self.master_profile = self.master_user.master_profile
        self.cat = Category.objects.create(
            title_uz="Test", title_ru="Тест", title_en="Test"
        )

    @patch("apps.orders.tasks.process_order_after_creation.delay")
    def test_create_order_api(self, mock_delay):
        mock_delay.return_value = None
        self.client.force_login(self.customer)
        response = self.client.post(
            "/api/v1/orders/",
            {
                "category": self.cat.id,
                "title": "Fix pipe",
                "budget": 100000,
                "address": "Tashkent",
                "latitude": 41.3,
                "longitude": 69.24,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["title"], "Fix pipe")

    def test_list_orders_requires_auth(self):
        response = self.client.get("/api/v1/orders/")
        self.assertEqual(response.status_code, 401)

    def test_list_orders_authenticated(self):
        self.client.force_login(self.customer)
        response = self.client.get("/api/v1/orders/")
        self.assertEqual(response.status_code, 200)

    def test_order_detail(self):
        self.client.force_login(self.customer)
        order = Order.objects.create(
            customer=self.customer,
            category=self.cat,
            title="Detail test",
            budget=100000,
            address="Tashkent",
            latitude=41.3,
            longitude=69.24,
        )
        response = self.client.get(f"/api/v1/orders/{order.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["title"], "Detail test")

    def test_my_orders_endpoint(self):
        self.client.force_login(self.customer)
        Order.objects.create(
            customer=self.customer,
            category=self.cat,
            title="My order",
            budget=100000,
            address="Tashkent",
            latitude=41.3,
            longitude=69.24,
        )
        response = self.client.get("/api/v1/orders/my_orders/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["results"]), 1)

    def test_active_orders(self):
        self.client.force_login(self.customer)
        response = self.client.get("/api/v1/orders/active/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 0)

    def test_make_offer(self):
        order = Order.objects.create(
            customer=self.customer,
            category=self.cat,
            title="Offer api",
            budget=100000,
            address="Tashkent",
            latitude=41.3,
            longitude=69.24,
        )
        self.client.force_login(self.master_user)
        response = self.client.post(
            f"/api/v1/orders/{order.id}/make_offer/",
            {
                "master": self.master_profile.id,
                "price": 90000,
                "description": "Can do it",
                "estimated_duration": 60,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)

    def test_make_offer_without_master_field(self):
        order = Order.objects.create(
            customer=self.customer,
            category=self.cat,
            title="Offer without master",
            budget=110000,
            address="Tashkent",
            latitude=41.3,
            longitude=69.24,
        )
        self.client.force_login(self.master_user)
        response = self.client.post(
            f"/api/v1/orders/{order.id}/make_offer/",
            {
                "price": 95000,
                "description": "Available today",
                "estimated_duration": 45,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
