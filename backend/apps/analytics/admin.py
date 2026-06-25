from django.contrib import admin
from .models import DailyMetric, RevenueReport, AnalyticsEvent


@admin.register(DailyMetric)
class DailyMetricAdmin(admin.ModelAdmin):
    list_display = ['date', 'new_users', 'new_masters', 'total_orders', 'completed_orders', 'total_revenue']
    list_filter = ['date']
    date_hierarchy = 'date'


@admin.register(RevenueReport)
class RevenueReportAdmin(admin.ModelAdmin):
    list_display = ['period', 'start_date', 'end_date', 'gross_revenue', 'net_revenue', 'commission_earned']
    list_filter = ['period']


@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'user', 'method', 'path', 'duration_ms', 'created_at']
    list_filter = ['event_type', 'method', 'created_at']
    date_hierarchy = 'created_at'
