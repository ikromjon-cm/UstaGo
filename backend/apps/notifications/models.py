import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):
    class Type(models.TextChoices):
        ORDER = 'order', _('Order')
        PAYMENT = 'payment', _('Payment')
        CHAT = 'chat', _('Chat')
        PROMO = 'promo', _('Promotion')
        SYSTEM = 'system', _('System')
        REVIEW = 'review', _('Review')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'users.User', on_delete=models.CASCADE, related_name='notifications'
    )
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.SYSTEM)
    title = models.CharField(max_length=255, verbose_name=_('Title'))
    body = models.TextField(verbose_name=_('Body'))
    data = models.JSONField(default=dict, blank=True)
    image = models.ImageField(upload_to='notifications/', blank=True, null=True)
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['created_at']),
            models.Index(fields=['type']),
        ]

    def __str__(self):
        return f'{self.type}: {self.title}'


class NotificationTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=100, unique=True)
    title_uz = models.CharField(max_length=255)
    title_ru = models.CharField(max_length=255, blank=True)
    title_en = models.CharField(max_length=255, blank=True)
    body_uz = models.TextField()
    body_ru = models.TextField(blank=True)
    body_en = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=Notification.Type.choices)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'notification_templates'
