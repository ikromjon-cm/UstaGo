from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from rangefilter.filters import DateRangeFilter
from .models import Order, OrderImage, OrderVideo, OrderVoice, OrderOffer, OrderStatusLog


class OrderImageInline(admin.TabularInline):
    model = OrderImage
    extra = 1


class OrderOfferInline(admin.TabularInline):
    model = OrderOffer
    extra = 0
    readonly_fields = ['created_at']


class OrderStatusLogInline(admin.TabularInline):
    model = OrderStatusLog
    readonly_fields = ['from_status', 'to_status', 'changed_by', 'note', 'created_at']
    extra = 0
    can_delete = False

    def has_add_permission(self, request, obj):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['title', 'customer', 'master', 'status', 'urgency', 'budget', 'final_price', 'is_paid', 'is_rated', 'created_at']
    list_filter = ['status', 'urgency', 'is_paid', 'is_rated', 'created_at']
    search_fields = ['title', 'description', 'customer__phone', 'customer__full_name', 'master__user__phone', 'address']
    inlines = [OrderImageInline, OrderOfferInline, OrderStatusLogInline]
    readonly_fields = ['created_at', 'updated_at', 'started_at', 'completed_at', 'cancelled_at']
    date_hierarchy = 'created_at'
    list_per_page = 50
    fieldsets = (
        (None, {'fields': ('title', 'description', 'status', 'urgency')}),
        (_('Customer & Master'), {'fields': ('customer', 'master', 'category', 'service')}),
        (_('Pricing'), {'fields': ('budget', 'final_price', 'commission', 'is_paid')}),
        (_('Location'), {'fields': ('latitude', 'longitude', 'address', 'apartment')}),
        (_('Schedule'), {'fields': ('preferred_date', 'preferred_time')}),
        (_('AI'), {'fields': ('ai_category', 'ai_price_estimate_min', 'ai_price_estimate_max')}),
        (_('Timestamps'), {'fields': ('started_at', 'completed_at', 'cancelled_at', 'created_at', 'updated_at')}),
    )
    actions = ['mark_as_paid', 'mark_as_completed', 'cancel_orders']

    def mark_as_paid(self, request, queryset):
        queryset.update(is_paid=True)
    mark_as_paid.short_description = _("Mark selected orders as paid")

    def mark_as_completed(self, request, queryset):
        queryset.update(status=Order.Status.COMPLETED, completed_at=admin.utils.timezone.now())
    mark_as_completed.short_description = _("Mark selected orders as completed")

    def cancel_orders(self, request, queryset):
        queryset.update(status=Order.Status.CANCELLED, cancelled_at=admin.utils.timezone.now())
    cancel_orders.short_description = _("Cancel selected orders")


@admin.register(OrderImage)
class OrderImageAdmin(admin.ModelAdmin):
    list_display = ['order', 'is_before', 'created_at']
    list_filter = ['is_before']
    search_fields = ['order__title', 'order__id']
    readonly_fields = ['created_at']


@admin.register(OrderVideo)
class OrderVideoAdmin(admin.ModelAdmin):
    list_display = ['order', 'created_at']
    search_fields = ['order__title', 'order__id']
    readonly_fields = ['created_at']


@admin.register(OrderVoice)
class OrderVoiceAdmin(admin.ModelAdmin):
    list_display = ['order', 'duration', 'created_at']
    list_filter = ['duration']
    search_fields = ['order__title', 'order__id']
    readonly_fields = ['created_at']


@admin.register(OrderOffer)
class OrderOfferAdmin(admin.ModelAdmin):
    list_display = ['order', 'master', 'price', 'estimated_duration', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order__title', 'master__user__full_name']
    readonly_fields = ['created_at']
    actions = ['accept_offers', 'reject_offers']

    def accept_offers(self, request, queryset):
        queryset.update(status=OrderOffer.Status.ACCEPTED)
    accept_offers.short_description = _("Accept selected offers")

    def reject_offers(self, request, queryset):
        queryset.update(status=OrderOffer.Status.REJECTED)
    reject_offers.short_description = _("Reject selected offers")


@admin.register(OrderStatusLog)
class OrderStatusLogAdmin(admin.ModelAdmin):
    list_display = ['order', 'from_status', 'to_status', 'changed_by', 'created_at']
    list_filter = ['from_status', 'to_status', 'created_at']
    search_fields = ['order__title', 'order__id', 'note']
    readonly_fields = ['created_at']

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
