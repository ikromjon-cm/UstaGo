from celery import shared_task
from django.db.models import Q
from .models import Order, OrderStatusLog
from apps.notifications.services import NotificationService


@shared_task
def process_order_after_creation(order_id):
    from .models import Order
    from apps.users.models import MasterProfile
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return
    if order.category:
        nearby_masters = MasterProfile.objects.filter(
            categories=order.category,
            is_available=True,
            is_online=True,
            user__status='active',
        ).select_related('user')[:20]
        if nearby_masters:
            order.status = Order.Status.LOOKING_MASTER
            order.save()
            OrderStatusLog.objects.create(
                order=order, from_status='pending', to_status='looking_master'
            )
            for master in nearby_masters:
                NotificationService.send_push(
                    user=master.user,
                    title='New Order Available',
                    body=f'{order.title} - Budget: {order.budget} UZS',
                    data={'order_id': str(order.id), 'type': 'new_order'},
                )


@shared_task
def expire_old_offers():
    from datetime import timedelta
    from django.utils import timezone
    offers = OrderOffer.objects.filter(
        status='pending',
        created_at__lt=timezone.now() - timedelta(hours=24)
    )
    offers.update(status='expired')


@shared_task
def cancel_unpaid_orders():
    from datetime import timedelta
    from django.utils import timezone
    orders = Order.objects.filter(
        status='pending',
        created_at__lt=timezone.now() - timedelta(days=7)
    )
    for order in orders:
        order.status = Order.Status.CANCELLED
        order.cancel_reason = 'Auto-cancelled: no response'
        order.save()
