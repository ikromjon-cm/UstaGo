from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.categories.models import Category, Service

User = get_user_model()


class CategoryAPITests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            phone='+998901234098', full_name='Admin', password='test123',
            username='+998901234098', role='admin'
        )

    def test_list_categories(self):
        Category.objects.create(title_uz='Test', title_ru='Тест', title_en='Test', is_active=True)
        resp = self.client.get('/api/v1/categories/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreater(len(data['results']), 0)

    def test_create_category_as_admin(self):
        self.client.force_login(self.admin)
        resp = self.client.post('/api/v1/categories/', {
            'title_uz': 'Santexnik',
            'title_ru': 'Сантехник',
            'title_en': 'Plumber',
        })
        self.assertEqual(resp.status_code, 405)

    def test_create_category_unauthenticated(self):
        resp = self.client.post('/api/v1/categories/', {
            'title_uz': 'Santexnik',
            'title_ru': 'Сантехник',
            'title_en': 'Plumber',
        })
        self.assertEqual(resp.status_code, 405)

    def test_categories_list(self):
        Category.objects.create(title_uz='Test', title_ru='Тест', title_en='Test', is_active=True)
        response = self.client.get('/api/v1/categories/')
        self.assertEqual(response.status_code, 200)

    def test_featured_endpoint(self):
        Category.objects.create(title_uz='Featured', title_ru='Избранный', title_en='Featured', is_featured=True, is_active=True)
        response = self.client.get('/api/v1/categories/featured/')
        self.assertEqual(response.status_code, 200)

    def test_tree_endpoint(self):
        Category.objects.create(title_uz='Root', title_ru='Корень', title_en='Root', is_active=True)
        response = self.client.get('/api/v1/categories/tree/')
        self.assertEqual(response.status_code, 200)


class CategoryServicesAPITests(TestCase):
    def setUp(self):
        self.cat = Category.objects.create(
            title_uz='Test', title_ru='Тест', title_en='Test',
            is_active=True
        )
        Service.objects.create(
            category=self.cat, title_uz='Service 1', is_active=True
        )

    def test_category_services_nested(self):
        response = self.client.get(f'/api/v1/categories/{self.cat.id}/services/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(len(data), 1)
