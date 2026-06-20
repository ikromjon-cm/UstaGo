import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import ChatRoom, Message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        is_member = await self.is_room_member()
        if not is_member:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_online',
                'user_id': str(self.user.id),
                'full_name': self.user.full_name,
                'is_online': True,
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_offline',
                'user_id': str(self.user.id),
            }
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get('type')

        if msg_type == 'message':
            message = await self.save_message(data)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message_id': str(message.id),
                    'sender_id': str(self.user.id),
                    'sender_name': self.user.full_name,
                    'sender_avatar': self.user.avatar.url if self.user.avatar else None,
                    'message_type': message.message_type,
                    'content': message.content,
                    'file': message.file.url if message.file else None,
                    'image': message.image.url if message.image else None,
                    'created_at': message.created_at.isoformat(),
                }
            )
        elif msg_type == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'user_id': str(self.user.id),
                    'full_name': self.user.full_name,
                    'is_typing': data.get('is_typing', True),
                }
            )
        elif msg_type == 'read':
            await self.mark_read(data.get('message_id'))
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_read',
                    'message_id': data.get('message_id'),
                    'user_id': str(self.user.id),
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message_id': event['message_id'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'sender_avatar': event['sender_avatar'],
            'message_type': event['message_type'],
            'content': event['content'],
            'file': event['file'],
            'image': event['image'],
            'created_at': event['created_at'],
        }))

    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user_id': event['user_id'],
            'full_name': event['full_name'],
            'is_typing': event['is_typing'],
        }))

    async def message_read(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_read',
            'message_id': event['message_id'],
            'user_id': event['user_id'],
        }))

    async def user_online(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_online',
            'user_id': event['user_id'],
            'full_name': event['full_name'],
        }))

    async def user_offline(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_offline',
            'user_id': event['user_id'],
        }))

    @database_sync_to_async
    def is_room_member(self):
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            return room.participants.filter(id=self.user.id).exists()
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, data):
        room = ChatRoom.objects.get(id=self.room_id)
        message = Message.objects.create(
            room=room,
            sender=self.user,
            message_type=data.get('message_type', 'text'),
            content=data.get('content', ''),
        )
        room.updated_at = timezone.now()
        room.save(update_fields=['updated_at'])
        return message

    @database_sync_to_async
    def mark_read(self, message_id):
        try:
            message = Message.objects.get(id=message_id, room_id=self.room_id)
            if message.sender != self.user:
                message.is_read = True
                message.read_at = timezone.now()
                message.save(update_fields=['is_read', 'read_at'])
        except Message.DoesNotExist:
            pass
