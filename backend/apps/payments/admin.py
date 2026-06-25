from django.contrib import admin
from .models import Payment, Payout


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'customer', 'master', 'amount', 'status', 'method', 'created_at']
    list_filter = ['status', 'method', 'created_at']
    search_fields = ['order__id', 'customer__phone', 'master__phone', 'transaction_id']
    date_hierarchy = 'created_at'


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'net_amount', 'status', 'method', 'created_at']
    list_filter = ['status', 'method']
    search_fields = ['user__phone', 'user__full_name']
