import json
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Order, OrderStatusLog
from apps.notifications.models import Notification


@receiver(post_save, sender=Order)
def notify_order_status_change(sender, instance, created, **kwargs):
    if created:
        return
    try:
        old = Order.objects.get(pk=instance.pk)
    except Order.DoesNotExist:
        return
    if old.status != instance.status:
        user = instance.customer
        master_user = instance.master.user if instance.master else None

        status_titles = {
            Order.Status.LOOKING_MASTER: "Usta qidirilmoqda",
            Order.Status.OFFERED: "Taklif keldi",
            Order.Status.ACCEPTED: "Usta qabul qildi",
            Order.Status.IN_PROGRESS: "Ish boshlangan",
            Order.Status.COMPLETED: "Ish tugallangan",
            Order.Status.CANCELLED: "Buyurtma bekor qilindi",
            Order.Status.DISPUTED: "Buyurtma bo'yicha nizo",
        }

        title = status_titles.get(instance.status, f"Status: {instance.status}")
        body = f"'{instance.title}' — {title}"

        for recipient in [user, master_user]:
            if not recipient:
                continue
            Notification.objects.create(
                user=recipient,
                type=Notification.Type.ORDER,
                title=title,
                body=body,
                data={"order_id": str(instance.id), "status": instance.status},
            )

        channel_layer = get_channel_layer()
        event = {
            "type": "notification_message",
            "id": str(instance.id),
            "title": title,
            "body": body,
            "data": {"order_id": str(instance.id), "status": instance.status},
            "created_at": instance.updated_at.isoformat() if instance.updated_at else "",
        }
        for recipient in [user, master_user]:
            if recipient:
                group = f"notifications_{recipient.id}"
                try:
                    async_to_sync(channel_layer.group_send)(group, event)
                except Exception:
                    pass

        order_group = f"order_{instance.id}"
        try:
            async_to_sync(channel_layer.group_send)(
                order_group,
                {
                    "type": "order_status_update",
                    "status": instance.status,
                    "message": title,
                },
            )
        except Exception:
            pass
