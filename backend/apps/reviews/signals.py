import json
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Review
from apps.notifications.models import Notification


@receiver(post_save, sender=Review)
def handle_review_created(sender, instance, created, **kwargs):
    if not created:
        return
    order = instance.order
    order.is_rated = True
    order.save(update_fields=["is_rated"])

    title = "Yangi sharh"
    body = f"Buyurtma '{order.title}' uchun {instance.rating}/5 baho qo'yildi"

    Notification.objects.create(
        user=instance.target_user,
        type=Notification.Type.REVIEW,
        title=title,
        body=body,
        data={
            "order_id": str(order.id),
            "review_id": str(instance.id),
            "rating": instance.rating,
        },
    )

    channel_layer = get_channel_layer()
    group = f"notifications_{instance.target_user.id}"
    try:
        async_to_sync(channel_layer.group_send)(
            group,
            {
                "type": "notification_message",
                "id": str(instance.id),
                "title": title,
                "body": body,
                "data": {
                    "order_id": str(order.id),
                    "review_id": str(instance.id),
                    "rating": instance.rating,
                },
                "created_at": instance.created_at.isoformat(),
            },
        )
    except Exception:
        pass
