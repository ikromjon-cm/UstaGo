from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Notification, NotificationTemplate


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'title', 'body_preview', 'is_read', 'is_sent', 'created_at']
    list_filter = ['type', 'is_read', 'is_sent', 'created_at']
    search_fields = ['title', 'body', 'user__phone', 'user__full_name']
    readonly_fields = ['created_at', 'read_at']
    date_hierarchy = 'created_at'
    list_per_page = 50
    actions = ['mark_as_read', 'mark_as_unread', 'mark_as_sent']

    def body_preview(self, obj):
        return obj.body[:75] + '...' if len(obj.body) > 75 else obj.body
    body_preview.short_description = _('Body')

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True, read_at=admin.utils.timezone.now())
    mark_as_read.short_description = _("Mark selected as read")

    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False, read_at=None)
    mark_as_unread.short_description = _("Mark selected as unread")

    def mark_as_sent(self, request, queryset):
        queryset.update(is_sent=True)
    mark_as_sent.short_description = _("Mark selected as sent")


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['key', 'type', 'is_active', 'title_uz', 'title_ru', 'title_en']
    list_filter = ['type', 'is_active']
    search_fields = ['key', 'title_uz', 'title_ru', 'title_en', 'body_uz', 'body_ru', 'body_en']
    list_editable = ['is_active']
    fieldsets = (
        (None, {'fields': ('key', 'type', 'is_active')}),
        (_('Uzbek'), {'fields': ('title_uz', 'body_uz')}),
        (_('Russian'), {'fields': ('title_ru', 'body_ru')}),
        (_('English'), {'fields': ('title_en', 'body_en')}),
    )
