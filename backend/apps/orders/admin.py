from django.contrib import admin
from rangefilter.filters import DateRangeFilter
from .models import Order, OrderImage, OrderOffer, OrderStatusLog


class OrderImageInline(admin.TabularInline):
    model = OrderImage
    extra = 1


class OrderOfferInline(admin.TabularInline):
    model = OrderOffer
    extra = 0
    readonly_fields = ['created_at']


class OrderStatusLogInline(admin.TabularInline):
    model = OrderStatusLog
    readonly_fields = ['created_at']
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['title', 'customer', 'master', 'status', 'budget', 'final_price', 'is_paid', 'created_at']
    list_filter = ['status', 'urgency', 'is_paid', 'created_at']
    search_fields = ['title', 'description', 'customer__phone', 'customer__full_name', 'address']
    inlines = [OrderImageInline, OrderOfferInline, OrderStatusLogInline]
    readonly_fields = ['created_at', 'updated_at', 'started_at', 'completed_at']
    date_hierarchy = 'created_at'
    fieldsets = (
        (None, {'fields': ('title', 'description', 'status', 'urgency')}),
        ('Customer & Master', {'fields': ('customer', 'master', 'category', 'service')}),
        ('Pricing', {'fields': ('budget', 'final_price', 'commission', 'is_paid')}),
        ('Location', {'fields': ('latitude', 'longitude', 'address', 'apartment')}),
        ('Schedule', {'fields': ('preferred_date', 'preferred_time')}),
        ('AI', {'fields': ('ai_category', 'ai_price_estimate_min', 'ai_price_estimate_max')}),
        ('Timestamps', {'fields': ('started_at', 'completed_at', 'cancelled_at', 'created_at', 'updated_at')}),
    )


@admin.register(OrderOffer)
class OrderOfferAdmin(admin.ModelAdmin):
    list_display = ['order', 'master', 'price', 'estimated_duration', 'status', 'created_at']
    list_filter = ['status']
