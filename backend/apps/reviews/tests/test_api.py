import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.categories.models import Category
from apps.orders.models import Order
from apps.reviews.models import Review

User = get_user_model()


@pytest.mark.django_db
class TestReviewAPI:
    def setup_method(self):
        self.client = APIClient()

    def test_create_review(self, django_user_model):
        reviewer = django_user_model.objects.create_user(
            phone='+998901234592', full_name='Reviewer', password='testpass123'
        )
        target = django_user_model.objects.create_user(
            phone='+998901234593', full_name='Target', password='testpass123'
        )
        cat = Category.objects.create(title_uz='Test', title_ru='Тест', title_en='Test')
        order = Order.objects.create(
            customer=reviewer, category=cat, title='Test', budget=50000,
            address='Tashkent', latitude=41.3, longitude=69.24,
            status='completed'
        )

        resp = self.client.post('/api/v1/auth/login/', {
            'phone': '+998901234592', 'password': 'testpass123'
        }, format='json')
        token = resp.json().get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        resp = self.client.post('/api/v1/reviews/', {
            'order': order.id,
            'target_user': target.id,
            'rating': 5,
            'comment': 'Excellent!',
        }, format='json')
        assert resp.status_code in [201, 200]
