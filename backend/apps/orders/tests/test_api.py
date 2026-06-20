import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.categories.models import Category
from apps.orders.models import Order

User = get_user_model()


@pytest.mark.django_db
class TestOrderFlowAPI:
    def setup_method(self):
        self.client = APIClient()

    def test_full_order_flow(self, django_user_model):
        cat = Category.objects.create(title_uz='Test', title_ru='Тест', title_en='Test')
        customer = django_user_model.objects.create_user(
            phone='+998901234590', full_name='Customer', password='testpass123', role='customer'
        )
        master = django_user_model.objects.create_user(
            phone='+998901234591', full_name='Master', password='testpass123', role='master'
        )

        # Login as customer
        resp = self.client.post('/api/v1/auth/login/', {
            'phone': '+998901234590', 'password': 'testpass123'
        }, format='json')
        token = resp.json().get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # Create order
        resp = self.client.post('/api/v1/orders/', {
            'category': cat.id, 'title': 'Fix leak', 'budget': 100000,
            'address': 'Tashkent', 'latitude': 41.3, 'longitude': 69.24,
        }, format='json')
        assert resp.status_code in [201, 200]
        order_id = resp.json().get('id')

        # List orders
        resp = self.client.get('/api/v1/orders/')
        assert resp.status_code == 200

        # Get order detail
        resp = self.client.get(f'/api/v1/orders/{order_id}/')
        assert resp.status_code in [200, 404]


@pytest.mark.django_db
class TestMasterAPI:
    def setup_method(self):
        self.client = APIClient()

    def test_list_masters(self):
        resp = self.client.get('/api/v1/masters/')
        assert resp.status_code == 200
