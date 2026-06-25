from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.categories.models import Category
from apps.orders.models import Order
from apps.reviews.models import Review

User = get_user_model()


class ReviewModelTests(TestCase):
    def setUp(self):
        self.reviewer = User.objects.create_user(
            phone='+998901234001', full_name='Reviewer',
            password='testpass123', username='+998901234001'
        )
        self.target = User.objects.create_user(
            phone='+998901234002', full_name='Target',
            password='testpass123', username='+998901234002'
        )
        self.cat = Category.objects.create(title_uz='Test', title_ru='Тест', title_en='Test')
        self.order = Order.objects.create(
            customer=self.reviewer, category=self.cat, title='Test',
            budget=50000, address='Tashkent', latitude=41.3,
            longitude=69.24, status='completed'
        )

    def test_create_review(self):
        review = Review.objects.create(
            order=self.order, reviewer=self.reviewer,
            target_user=self.target, rating=5, comment='Great!'
        )
        self.assertEqual(review.rating, 5)
        self.assertEqual(str(review), f'Review by {self.reviewer.full_name}: 5/5')

    def test_review_response(self):
        review = Review.objects.create(
            order=self.order, reviewer=self.reviewer,
            target_user=self.target, rating=4, comment='Good job'
        )
        self.assertFalse(review.response)
        review.response = 'Thank you!'
        review.save()
        self.assertEqual(review.response, 'Thank you!')

    def test_review_no_response_by_default(self):
        review = Review.objects.create(
            order=self.order, reviewer=self.reviewer,
            target_user=self.target, rating=3, comment='OK'
        )
        self.assertEqual(review.response, '')
        self.assertIsNone(review.responded_at)

    def test_review_ordered_by_date(self):
        order2 = Order.objects.create(
            customer=self.reviewer, category=self.cat,
            title='Test 2', budget=50000,
            address='Tashkent', latitude=41.3,
            longitude=69.24, status='completed'
        )
        r1 = Review.objects.create(
            order=self.order, reviewer=self.reviewer,
            target_user=self.target, rating=5, comment='First'
        )
        r2 = Review.objects.create(
            order=order2, reviewer=self.reviewer,
            target_user=self.target, rating=4, comment='Second'
        )
        reviews = Review.objects.all()
        self.assertEqual(reviews.count(), 2)
        self.assertEqual(reviews[0], r2)
        self.assertEqual(reviews[1], r1)

    def test_review_str_method(self):
        review = Review.objects.create(
            order=self.order, reviewer=self.reviewer,
            target_user=self.target, rating=4, comment='Nice'
        )
        expected = f'Review by {self.reviewer.full_name}: 4/5'
        self.assertEqual(str(review), expected)
