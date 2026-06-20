from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Payment


@shared_task
def release_held_payments():
    threshold = timezone.now() - timedelta(hours=24)
    payments = Payment.objects.filter(
        status='held',
        created_at__lt=threshold
    )
    count = payments.count()
    for payment in payments:
        payment.status = 'completed'
        payment.save(update_fields=['status'])
    return f"Released {count} held payments"


@shared_task
def cancel_expired_payments(hours=2):
    threshold = timezone.now() - timedelta(hours=hours)
    expired = Payment.objects.filter(
        status='pending',
        created_at__lt=threshold
    )
    count = expired.count()
    expired.update(status='failed')
    return f"Cancelled {count} expired payments"
