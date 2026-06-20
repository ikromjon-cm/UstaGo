from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import DailyMetric, RevenueReport, AnalyticsEvent


@admin.register(DailyMetric)
class DailyMetricAdmin(admin.ModelAdmin):
    list_display = ['date', 'new_users', 'new_masters', 'total_orders', 'completed_orders', 'cancelled_orders', 'total_revenue', 'platform_commission', 'active_users', 'active_masters']
    list_filter = ['date']
    search_fields = ['date']
    readonly_fields = ['created_at']
    date_hierarchy = 'date'
    actions = ['export_selected']

    def export_selected(self, request, queryset):
        return admin.utils.timezone.now()
    export_selected.short_description = _("Export selected metrics")


@admin.register(RevenueReport)
class RevenueReportAdmin(admin.ModelAdmin):
    list_display = ['period', 'start_date', 'end_date', 'gross_revenue', 'net_revenue', 'commission_earned', 'total_orders', 'total_users', 'total_masters']
    list_filter = ['period', 'start_date', 'end_date']
    search_fields = ['period']
    readonly_fields = ['created_at']
    date_hierarchy = 'start_date'


@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'user', 'method', 'path', 'duration_ms', 'created_at']
    list_filter = ['event_type', 'method', 'created_at']
    search_fields = ['event_type', 'path', 'user__phone', 'user__full_name', 'session_id']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    list_per_page = 100

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
