import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.categories.models import Category

User = get_user_model()


@pytest.mark.django_db
class TestAuthAPI:
    def setup_method(self):
        self.client = APIClient()

    def test_register_customer(self):
        resp = self.client.post('/api/v1/auth/register/', {
            'phone': '+998901234567',
            'full_name': 'Test User',
            'password': 'testpass123',
            'role': 'customer',
        }, format='json')
        assert resp.status_code in [201, 200]
        data = resp.json()
        assert data['user']['phone'] == '+998901234567'
        assert data['user']['role'] == 'customer'

    def test_register_without_phone_fails(self):
        resp = self.client.post('/api/v1/auth/register/', {
            'full_name': 'No Phone',
            'password': 'testpass123',
        }, format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_success(self, django_user_model):
        user = django_user_model.objects.create_user(
            phone='+998901234568', full_name='Login Test', password='testpass123'
        )
        resp = self.client.post('/api/v1/auth/login/', {
            'phone': '+998901234568',
            'password': 'testpass123',
        }, format='json')
        assert resp.status_code in [200, 201]
        data = resp.json()
        assert 'access' in data

    def test_login_wrong_password(self, django_user_model):
        django_user_model.objects.create_user(
            phone='+998901234569', full_name='Wrong PW', password='testpass123'
        )
        resp = self.client.post('/api/v1/auth/login/', {
            'phone': '+998901234569',
            'password': 'wrongpassword',
        }, format='json')
        assert resp.status_code in [400, 401]

    def test_profile_requires_auth(self):
        resp = self.client.get('/api/v1/auth/profile/')
        assert resp.status_code in [401, 403]

    def test_profile_authenticated(self, django_user_model):
        user = django_user_model.objects.create_user(
            phone='+998901234570', full_name='Profile Test', password='testpass123'
        )
        resp = self.client.post('/api/v1/auth/login/', {
            'phone': '+998901234570', 'password': 'testpass123'
        }, format='json')
        token = resp.json().get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = self.client.get('/api/v1/auth/profile/')
        assert resp.status_code == 200
        assert resp.json()['phone'] == '+998901234570'


@pytest.mark.django_db
class TestCategoriesAPI:
    def setup_method(self):
        self.client = APIClient()

    def test_list_categories(self):
        Category.objects.create(title_uz='Santexnik', title_ru='Сантехник', title_en='Plumber', is_active=True)
        resp = self.client.get('/api/v1/categories/')
        assert resp.status_code == 200
        data = resp.json()
        assert len(data['results']) >= 1

    def test_category_list_unauthenticated(self):
        resp = self.client.get('/api/v1/categories/')
        assert resp.status_code in [200, 401]


@pytest.mark.django_db
class TestOrdersAPI:
    def setup_method(self):
        self.client = APIClient()

    def test_create_order_authenticated(self, django_user_model):
        user = django_user_model.objects.create_user(
            phone='+998901234571', full_name='Order User', password='testpass123'
        )
        cat = Category.objects.create(title_uz='Test', title_ru='Тест', title_en='Test')
        resp = self.client.post('/api/v1/auth/login/', {
            'phone': '+998901234571', 'password': 'testpass123'
        }, format='json')
        token = resp.json().get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = self.client.post('/api/v1/orders/', {
            'category': cat.id,
            'title': 'Fix pipe',
            'budget': 100000,
            'address': 'Tashkent',
            'latitude': 41.3,
            'longitude': 69.24,
        }, format='json')
        assert resp.status_code in [201, 200]

    def test_list_orders_unauthenticated(self):
        resp = self.client.get('/api/v1/orders/')
        assert resp.status_code in [401, 403]


@pytest.mark.django_db
class TestHealthAPI:
    def setup_method(self):
        self.client = APIClient()

    def test_health_check(self):
        resp = self.client.get('/api/v1/health/')
        assert resp.status_code == 200
        data = resp.json()
        assert 'status' in data
