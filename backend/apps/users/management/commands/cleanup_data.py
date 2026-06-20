from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Order, OrderOffer
from apps.notifications.models import Notification


class Command(BaseCommand):
    help = 'Cleanup old expired data'

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=30, help='Days threshold')

    def handle(self, *args, **options):
        days = options['days']
        threshold = timezone.now() - timedelta(days=days)

        orders = Order.objects.filter(
            status__in=['cancelled', 'completed'],
            updated_at__lt=threshold
        )
        order_count = orders.count()
        orders.delete()

        notifications = Notification.objects.filter(created_at__lt=threshold)
        notif_count = notifications.count()
        notifications.delete()

        self.stdout.write(self.style.SUCCESS(
            f'Cleaned up {order_count} old orders and {notif_count} notifications'
        ))
