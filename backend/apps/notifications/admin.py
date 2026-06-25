from django.contrib import admin
from .models import Notification, NotificationTemplate


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'title', 'is_read', 'is_sent', 'created_at']
    list_filter = ['type', 'is_read', 'is_sent', 'created_at']
    search_fields = ['title', 'body', 'user__phone']


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['key', 'type', 'is_active']
    list_filter = ['type', 'is_active']
    search_fields = ['key', 'title_uz']
