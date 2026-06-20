import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


class ChatRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = models.ManyToManyField(
        'users.User', related_name='chat_rooms',
        verbose_name=_('Participants')
    )
    order = models.ForeignKey(
        'orders.Order', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='chat_rooms', verbose_name=_('Order')
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Chat Room')
        verbose_name_plural = _('Chat Rooms')
        db_table = 'chat_rooms'
        ordering = ['-updated_at']

    def __str__(self):
        return f'Chat Room {self.id}'


class Message(models.Model):
    class MessageType(models.TextChoices):
        TEXT = 'text', _('Text')
        IMAGE = 'image', _('Image')
        VIDEO = 'video', _('Video')
        FILE = 'file', _('File')
        VOICE = 'voice', _('Voice')
        LOCATION = 'location', _('Location')
        SYSTEM = 'system', _('System')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(
        ChatRoom, on_delete=models.CASCADE, related_name='messages'
    )
    sender = models.ForeignKey(
        'users.User', on_delete=models.CASCADE, related_name='sent_messages'
    )
    message_type = models.CharField(
        max_length=20, choices=MessageType.choices, default=MessageType.TEXT
    )
    content = models.TextField(blank=True, verbose_name=_('Content'))
    file = models.FileField(upload_to='chat/files/', blank=True, null=True)
    image = models.ImageField(upload_to='chat/images/', blank=True, null=True)
    voice = models.FileField(upload_to='chat/voices/', blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    is_delivered = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    reply_to = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='replies'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Message')
        verbose_name_plural = _('Messages')
        db_table = 'messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
            models.Index(fields=['sender']),
            models.Index(fields=['is_read']),
        ]

    def __str__(self):
        return f'{self.sender.full_name}: {self.content[:50]}'
