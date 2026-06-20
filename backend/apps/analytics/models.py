import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


class AnalyticsEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.CharField(max_length=255, db_index=True)
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    path = models.CharField(max_length=500, blank=True)
    method = models.CharField(max_length=10, blank=True)
    data = models.JSONField(default=dict, blank=True)
    duration_ms = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'analytics_events'
        indexes = [
            models.Index(fields=['event_type', 'created_at']),
            models.Index(fields=['created_at']),
            models.Index(fields=['user']),
        ]


class DailyMetric(models.Model):
    date = models.DateField(unique=True)
    new_users = models.PositiveIntegerField(default=0)
    new_masters = models.PositiveIntegerField(default=0)
    total_orders = models.PositiveIntegerField(default=0)
    completed_orders = models.PositiveIntegerField(default=0)
    cancelled_orders = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    platform_commission = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    active_users = models.PositiveIntegerField(default=0)
    active_masters = models.PositiveIntegerField(default=0)
    avg_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    avg_response_time = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'daily_metrics'
        ordering = ['-date']


class RevenueReport(models.Model):
    period = models.CharField(max_length=20, choices=[
        ('daily', 'Daily'), ('weekly', 'Weekly'),
        ('monthly', 'Monthly'), ('yearly', 'Yearly'),
    ])
    start_date = models.DateField()
    end_date = models.DateField()
    gross_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    commission_earned = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_orders = models.PositiveIntegerField(default=0)
    total_users = models.PositiveIntegerField(default=0)
    total_masters = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'revenue_reports'
