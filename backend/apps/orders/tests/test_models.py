from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.categories.models import Category
from apps.orders.models import Order, OrderOffer, OrderStatusLog

User = get_user_model()


class OrderModelTests(TestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            phone='+998901234010', full_name='Customer',
            password='test123', username='+998901234010'
        )
        self.master_user = User.objects.create_user(
            phone='+998901234011', full_name='Master',
            password='test123', username='+998901234011',
            role='master'
        )
        self.master_profile = self.master_user.master_profile
        self.cat = Category.objects.create(
            title_uz='Test', title_ru='Тест', title_en='Test'
        )

    def test_create_order(self):
        order = Order.objects.create(
            customer=self.customer, category=self.cat,
            title='Test order', budget=100000,
            address='Tashkent', latitude=41.3, longitude=69.24
        )
        self.assertEqual(order.status, 'pending')
        self.assertFalse(order.is_paid)

    def test_order_str(self):
        order = Order.objects.create(
            customer=self.customer, category=self.cat,
            title='Test order', budget=100000,
            address='Tashkent', latitude=41.3, longitude=69.24
        )
        self.assertIn('Test order', str(order))
        self.assertIn(str(order.id)[:8], str(order))

    def test_order_defaults(self):
        order = Order.objects.create(
            customer=self.customer, category=self.cat,
            title='Defaults test', budget=50000,
            address='Tashkent', latitude=41.3, longitude=69.24
        )
        self.assertEqual(order.urgency, 'normal')
        self.assertFalse(order.is_paid)
        self.assertFalse(order.is_rated)
        self.assertIsNotNone(order.created_at)

    def test_order_status_update(self):
        order = Order.objects.create(
            customer=self.customer, category=self.cat,
            title='Status update', budget=100000,
            address='Tashkent', latitude=41.3, longitude=69.24
        )
        order.status = 'in_progress'
        order.save()
        updated = Order.objects.get(id=order.id)
        self.assertEqual(updated.status, 'in_progress')

    def test_order_offer_creation(self):
        order = Order.objects.create(
            customer=self.customer, category=self.cat,
            title='Offer test', budget=100000,
            address='Tashkent', latitude=41.3, longitude=69.24
        )
        offer = OrderOffer.objects.create(
            order=order, master=self.master_profile,
            price=90000, estimated_duration=60
        )
        self.assertEqual(offer.status, 'pending')
        self.assertEqual(offer.price, 90000)
        self.assertEqual(offer.estimated_duration, 60)

    def test_order_offer_unique_together(self):
        order = Order.objects.create(
            customer=self.customer, category=self.cat,
            title='Unique offer', budget=100000,
            address='Tashkent', latitude=41.3, longitude=69.24
        )
        OrderOffer.objects.create(
            order=order, master=self.master_profile,
            price=90000, estimated_duration=60
        )
        with self.assertRaises(Exception):
            OrderOffer.objects.create(
                order=order, master=self.master_profile,
                price=80000, estimated_duration=45
            )

    def test_order_status_log(self):
        order = Order.objects.create(
            customer=self.customer, category=self.cat,
            title='Log test', budget=100000,
            address='Tashkent', latitude=41.3, longitude=69.24
        )
        log = OrderStatusLog.objects.create(
            order=order, from_status='pending',
            to_status='looking_master', changed_by=self.customer
        )
        self.assertEqual(log.from_status, 'pending')
        self.assertEqual(log.to_status, 'looking_master')
        self.assertEqual(log.changed_by, self.customer)
