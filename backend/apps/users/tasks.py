from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from .models import User


@shared_task
def cleanup_expired_otps(expiry_minutes=5):
    threshold = timezone.now() - timedelta(minutes=expiry_minutes)
    expired = User.objects.filter(
        created_at__lt=threshold,
        is_phone_verified=False,
        is_active=False,
    )
    count = expired.count()
    expired.delete()
    return f"Cleaned up {count} expired OTP users"


@shared_task
def deactivate_inactive_users(days=90):
    threshold = timezone.now() - timedelta(days=days)
    users = User.objects.filter(
        last_login__lt=threshold, is_active=True, is_superuser=False
    )
    count = users.update(is_active=False)
    return f"Deactivated {count} inactive users"


@shared_task
def sync_master_ratings():
    from django.db.models import Avg, Count

    from apps.reviews.models import Review

    from .models import MasterProfile

    masters = MasterProfile.objects.all()
    for master in masters:
        agg = Review.objects.filter(
            target_user=master.user, is_approved=True
        ).aggregate(avg_rating=Avg("rating"), count=Count("id"))
        master.rating = agg["avg_rating"] or 0.0
        master.rating_count = agg["count"] or 0
        master.save(update_fields=["rating", "rating_count"])
    return f"Synced ratings for {masters.count()} masters"
