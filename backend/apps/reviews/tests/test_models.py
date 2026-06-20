import pytest
from django.contrib.auth import get_user_model
from apps.reviews.models import Review
from apps.orders.models import Order
from apps.categories.models import Category

User = get_user_model()


@pytest.mark.django_db
class TestReviewModel:
    def test_create_review(self):
        reviewer = User.objects.create_user(phone='+998901234582', full_name='Reviewer', password='testpass123')
        target = User.objects.create_user(phone='+998901234583', full_name='Target', password='testpass123')
        cat = Category.objects.create(title_uz='Test', title_ru='Тест', title_en='Test')
        order = Order.objects.create(customer=reviewer, category=cat, title='Test order', budget=50000, address='Tashkent', latitude=41.3, longitude=69.24)
        review = Review.objects.create(order=order, reviewer=reviewer, target_user=target, rating=5, quality=5, speed=4, communication=5, professionalism=5, comment='Great work!')
        assert review.rating == 5
        assert review.comment == 'Great work!'

    def test_review_defaults(self):
        reviewer = User.objects.create_user(phone='+998901234584', full_name='Rev Default', password='testpass123')
        target = User.objects.create_user(phone='+998901234585', full_name='Tgt Default', password='testpass123')
        cat = Category.objects.create(title_uz='Test', title_ru='Тест', title_en='Test')
        order = Order.objects.create(customer=reviewer, category=cat, title='Test', budget=30000, address='Tashkent', latitude=41.3, longitude=69.24)
        review = Review.objects.create(order=order, reviewer=reviewer, target_user=target, rating=4)
        assert review.is_approved is True
        assert review.is_reported is False
