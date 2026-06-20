from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Payment, Payout


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'customer', 'master', 'amount', 'net_amount', 'status', 'method', 'created_at']
    list_filter = ['status', 'method', 'created_at']
    search_fields = ['order__id', 'customer__phone', 'master__phone', 'transaction_id']
    readonly_fields = ['created_at', 'updated_at', 'paid_at', 'refunded_at']
    date_hierarchy = 'created_at'
    list_per_page = 50
    actions = ['mark_as_completed', 'mark_as_failed', 'mark_as_refunded']

    def mark_as_completed(self, request, queryset):
        queryset.update(status=Payment.Status.COMPLETED, paid_at=admin.utils.timezone.now())
    mark_as_completed.short_description = _("Mark selected as completed")

    def mark_as_failed(self, request, queryset):
        queryset.update(status=Payment.Status.FAILED)
    mark_as_failed.short_description = _("Mark selected as failed")

    def mark_as_refunded(self, request, queryset):
        queryset.update(status=Payment.Status.REFUNDED, refunded_at=admin.utils.timezone.now())
    mark_as_refunded.short_description = _("Mark selected as refunded")


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'net_amount', 'status', 'method', 'created_at']
    list_filter = ['status', 'method', 'created_at']
    search_fields = ['user__phone', 'user__full_name', 'bank_account', 'card_number']
    readonly_fields = ['created_at', 'processed_at']
    date_hierarchy = 'created_at'
    actions = ['approve_payouts', 'complete_payouts', 'fail_payouts']

    def approve_payouts(self, request, queryset):
        queryset.update(status=Payout.Status.PROCESSING)
    approve_payouts.short_description = _("Approve selected payouts")

    def complete_payouts(self, request, queryset):
        queryset.update(status=Payout.Status.COMPLETED, processed_at=admin.utils.timezone.now())
    complete_payouts.short_description = _("Complete selected payouts")

    def fail_payouts(self, request, queryset):
        queryset.update(status=Payout.Status.FAILED)
    fail_payouts.short_description = _("Fail selected payouts")
