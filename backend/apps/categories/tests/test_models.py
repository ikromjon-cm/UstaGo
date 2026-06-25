from django.test import TestCase
from apps.categories.models import Category, Service


class CategoryModelTests(TestCase):
    def setUp(self):
        self.parent = Category.objects.create(
            title_uz='Ta\'mirlash', title_ru='Ремонт', title_en='Repair',
            is_active=True
        )
        self.child = Category.objects.create(
            title_uz='Santexnik', title_ru='Сантехник', title_en='Plumber',
            parent=self.parent, is_active=True
        )

    def test_create_category(self):
        self.assertEqual(str(self.parent), 'Ta\'mirlash')
        self.assertTrue(self.parent.is_active)

    def test_category_children(self):
        children = self.parent.get_children()
        self.assertEqual(children.count(), 1)
        self.assertEqual(children.first().title_uz, 'Santexnik')

    def test_create_service(self):
        service = Service.objects.create(
            category=self.child,
            title_uz='Kran ta\'mirlash',
            title_ru='Ремонт крана',
            title_en='Tap repair',
            price_from=50000, price_to=150000,
            duration_minutes=60, is_active=True
        )
        self.assertEqual(service.title_uz, 'Kran ta\'mirlash')
        self.assertEqual(service.duration_minutes, 60)

    def test_featured_category(self):
        featured = Category.objects.create(
            title_uz='Mashhur', title_ru='Популярный', title_en='Featured',
            is_featured=True, is_active=True
        )
        self.assertTrue(featured.is_featured)

    def test_service_str(self):
        service = Service.objects.create(
            category=self.child,
            title_uz='Kran ta\'mirlash',
        )
        self.assertEqual(str(service), 'Kran ta\'mirlash')
