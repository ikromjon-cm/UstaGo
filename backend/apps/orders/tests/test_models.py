import pytest
from django.contrib.auth import get_user_model
from apps.orders.models import Order, OrderOffer
from apps.categories.models import Category

User = get_user_model()


@pytest.mark.django_db
class TestOrderModel:
    def test_create_order(self):
        user = User.objects.create_user(
            phone='+998901234576',
            full_name='Customer',
            password='testpass123',
            role='customer'
        )
        cat = Category.objects.create(
            title_uz='Santexnik',
            title_ru='Сантехник',
            title_en='Plumber'
        )
        order = Order.objects.create(
            customer=user,
            category=cat,
            title='Fix leaking pipe',
            description='Kitchen sink is leaking',
            budget=150000,
            address='Tashkent, Chilonzor',
            latitude=41.2995,
            longitude=69.2401,
        )
        assert order.status == 'pending'
        assert order.title == 'Fix leaking pipe'
        assert order.is_paid is False
        assert Order.objects.count() == 1

    def test_order_status_transitions(self):
        user = User.objects.create_user(
            phone='+998901234577',
            full_name='Customer 2',
            password='testpass123',
            role='customer'
        )
        cat = Category.objects.create(
            title_uz='Elektrik',
            title_ru='Электрик',
            title_en='Electrician'
        )
        order = Order.objects.create(
            customer=user, category=cat,
            title='Fix socket', budget=80000,
            address='Tashkent', latitude=41.3, longitude=69.24
        )
        assert order.can_cancel() is True
        order.status = 'in_progress'
        order.save()
        assert order.can_cancel() is True
        order.status = 'completed'
        order.save()
        assert order.can_cancel() is False


@pytest.mark.django_db
class TestOrderOfferModel:
    def test_create_offer(self):
        customer = User.objects.create_user(
            phone='+998901234578',
            full_name='Customer 3',
            password='testpass123',
            role='customer'
        )
        master = User.objects.create_user(
            phone='+998901234579',
            full_name='Master 1',
            password='testpass123',
            role='master'
        )
        cat = Category.objects.create(
            title_uz='Santexnik',
            title_ru='Сантехник',
            title_en='Plumber'
        )
        order = Order.objects.create(
            customer=customer, category=cat,
            title='Fix pipe', budget=100000,
            address='Tashkent', latitude=41.3, longitude=69.24
        )
        offer = OrderOffer.objects.create(
            order=order,
            master=master,
            price=90000,
            estimated_duration=2,
        )
        assert offer.status == 'pending'
        assert offer.price == 90000
