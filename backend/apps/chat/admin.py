from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import ChatRoom, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ['sender', 'message_type', 'content', 'created_at']
    can_delete = False

    def has_add_permission(self, request, obj):
        return False


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'is_active', 'participants_count', 'created_at', 'updated_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['id', 'participants__full_name', 'participants__phone']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['participants']
    inlines = [MessageInline]
    date_hierarchy = 'created_at'

    def participants_count(self, obj):
        return obj.participants.count()
    participants_count.short_description = _('Participants')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'room', 'message_type', 'content_preview', 'is_read', 'is_delivered', 'created_at']
    list_filter = ['message_type', 'is_read', 'is_delivered', 'created_at']
    search_fields = ['content', 'sender__full_name', 'sender__phone']
    readonly_fields = ['created_at', 'read_at', 'delivered_at']

    def content_preview(self, obj):
        return obj.content[:75] + '...' if len(obj.content) > 75 else obj.content
    content_preview.short_description = _('Content')
