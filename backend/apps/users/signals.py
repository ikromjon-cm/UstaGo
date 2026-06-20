from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import User, MasterProfile, UserWallet, Transaction
from apps.reviews.models import Review
from apps.orders.models import Order


@receiver(post_save, sender=User)
def create_user_wallet(sender, instance, created, **kwargs):
    if created:
        UserWallet.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def create_master_profile(sender, instance, created, **kwargs):
    if created and instance.role == User.Role.MASTER:
        MasterProfile.objects.get_or_create(user=instance)


@receiver(post_save, sender=Review)
def update_master_rating(sender, instance, created, **kwargs):
    if not created:
        return
    from django.db.models import Avg, Count
    master = MasterProfile.objects.filter(user=instance.target_user).first()
    if not master:
        return
    agg = Review.objects.filter(
        target_user=instance.target_user,
        is_approved=True
    ).aggregate(
        avg_rating=Avg('rating'),
        count=Count('id')
    )
    master.rating = agg['avg_rating'] or master.rating
    master.rating_count = agg['count'] or master.rating_count
    master.save(update_fields=['rating', 'rating_count'])


@receiver(pre_save, sender=Order)
def update_master_stats(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = Order.objects.get(pk=instance.pk)
        except Order.DoesNotExist:
            return
        if old.status != instance.status and instance.master:
            master_profile = instance.master.master_profile
            if instance.status == Order.Status.COMPLETED:
                master_profile.completed_jobs += 1
            elif instance.status == Order.Status.CANCELLED:
                master_profile.cancelled_jobs += 1
            master_profile.save(update_fields=['completed_jobs', 'cancelled_jobs'])
