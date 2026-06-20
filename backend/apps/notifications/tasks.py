from celery import shared_task
from .models import Notification, NotificationTemplate
from django.template import Engine
from django.utils import timezone
from datetime import timedelta


@shared_task
def send_bulk_notifications(user_ids, type, title, body, data=None):
    from .models import Notification
    from django.contrib.auth import get_user_model
    User = get_user_model()
    users = User.objects.filter(id__in=user_ids, is_active=True)
    notifications = [
        Notification(user=user, type=type, title=title, body=body, data=data or {})
        for user in users
    ]
    Notification.objects.bulk_create(notifications)
    return f"Created {len(notifications)} notifications"


@shared_task
def cleanup_old_notifications(days=30):
    threshold = timezone.now() - timedelta(days=days)
    count, _ = Notification.objects.filter(created_at__lt=threshold).delete()
    return f"Cleaned up {count} old notifications"
