import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from versatileimagefield.fields import VersatileImageField


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        LOOKING_MASTER = 'looking_master', _('Looking for Master')
        OFFERED = 'offered', _('Offer Received')
        ACCEPTED = 'accepted', _('Accepted')
        IN_PROGRESS = 'in_progress', _('In Progress')
        COMPLETED = 'completed', _('Completed')
        CANCELLED = 'cancelled', _('Cancelled')
        DISPUTED = 'disputed', _('Disputed')

    class Urgency(models.TextChoices):
        LOW = 'low', _('Low')
        NORMAL = 'normal', _('Normal')
        HIGH = 'high', _('High')
        EMERGENCY = 'emergency', _('Emergency')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(
        'users.User', on_delete=models.CASCADE, related_name='orders_as_customer',
        verbose_name=_('Customer')
    )
    master = models.ForeignKey(
        'users.MasterProfile', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='orders', verbose_name=_('Master')
    )
    category = models.ForeignKey(
        'categories.Category', on_delete=models.SET_NULL, null=True,
        related_name='orders', verbose_name=_('Category')
    )
    service = models.ForeignKey(
        'categories.Service', on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name=_('Service')
    )
    title = models.CharField(max_length=255, verbose_name=_('Title'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING,
        verbose_name=_('Status')
    )
    urgency = models.CharField(
        max_length=20, choices=Urgency.choices, default=Urgency.NORMAL,
        verbose_name=_('Urgency')
    )
    budget = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        verbose_name=_('Budget')
    )
    final_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        verbose_name=_('Final Price')
    )
    commission = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name=_('Platform Commission')
    )
    latitude = models.DecimalField(max_digits=9, decimal_places=6, verbose_name=_('Latitude'))
    longitude = models.DecimalField(max_digits=9, decimal_places=6, verbose_name=_('Longitude'))
    address = models.TextField(verbose_name=_('Address'))
    apartment = models.CharField(max_length=100, blank=True)
    preferred_date = models.DateField(null=True, blank=True)
    preferred_time = models.TimeField(null=True, blank=True)
    ai_category = models.CharField(max_length=255, blank=True)
    ai_price_estimate_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    ai_price_estimate_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancel_reason = models.TextField(blank=True)
    is_paid = models.BooleanField(default=False)
    is_rated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Order')
        verbose_name_plural = _('Orders')
        db_table = 'orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['master', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f'Order {self.id} - {self.title}'


class OrderImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='images'
    )
    image = VersatileImageField(upload_to='orders/images/')
    is_before = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_images'


class OrderVideo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='videos'
    )
    video = models.FileField(upload_to='orders/videos/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_videos'


class OrderVoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='voice_notes'
    )
    audio = models.FileField(upload_to='orders/voices/')
    duration = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_voices'


class OrderOffer(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        ACCEPTED = 'accepted', _('Accepted')
        REJECTED = 'rejected', _('Rejected')
        EXPIRED = 'expired', _('Expired')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='offers'
    )
    master = models.ForeignKey(
        'users.MasterProfile', on_delete=models.CASCADE, related_name='offers'
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)
    estimated_duration = models.PositiveIntegerField(help_text=_('Estimated duration in minutes'))
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_offers'
        unique_together = ['order', 'master']


class OrderStatusLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='status_logs'
    )
    from_status = models.CharField(max_length=20)
    to_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True
    )
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_status_logs'
        ordering = ['created_at']
