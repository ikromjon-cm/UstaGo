import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.chat.models import ChatRoom, Message

User = get_user_model()


class ChatModelTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            phone='+998901234567', full_name='User One',
            password='testpass123', username='+998901234567'
        )
        self.user2 = User.objects.create_user(
            phone='+998901234568', full_name='User Two',
            password='testpass123', username='+998901234568'
        )

    def test_create_chat_room(self):
        room = ChatRoom.objects.create()
        room.participants.add(self.user1, self.user2)
        self.assertEqual(room.participants.count(), 2)
        self.assertTrue(room.is_active)

    def test_send_message(self):
        room = ChatRoom.objects.create()
        room.participants.add(self.user1, self.user2)
        msg = Message.objects.create(
            room=room, sender=self.user1,
            content='Salom, ish bormi?',
            message_type='text'
        )
        self.assertEqual(msg.content, 'Salom, ish bormi?')
        self.assertFalse(msg.is_read)

    def test_mark_as_read(self):
        room = ChatRoom.objects.create()
        room.participants.add(self.user1, self.user2)
        msg = Message.objects.create(
            room=room, sender=self.user1,
            content='Test message',
            message_type='text'
        )
        msg.is_read = True
        msg.save()
        self.assertTrue(Message.objects.get(id=msg.id).is_read)

    def test_unread_count(self):
        room = ChatRoom.objects.create()
        room.participants.add(self.user1, self.user2)
        Message.objects.create(room=room, sender=self.user1, content='Msg 1', message_type='text')
        Message.objects.create(room=room, sender=self.user1, content='Msg 2', message_type='text')
        unread = Message.objects.filter(room=room, is_read=False).count()
        self.assertEqual(unread, 2)


class ChatAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone='+998901234569', full_name='Chat User',
            password='testpass123', username='+998901234569'
        )

    def test_chat_rooms_endpoint(self):
        self.client.force_login(self.user)
        response = self.client.get('/api/v1/chat/rooms/')
        self.assertEqual(response.status_code, 200)
