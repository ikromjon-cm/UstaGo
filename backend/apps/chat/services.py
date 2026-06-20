from django.db.models import Q, Max
from .models import ChatRoom, Message
from apps.notifications.services import NotificationService


class ChatService:
    @staticmethod
    def get_or_create_room(participant_ids, order=None):
        rooms = ChatRoom.objects.annotate(
            max_participants=Max('participants')
        ).filter(participants__in=participant_ids).distinct()
        for room in rooms:
            if set(room.participants.values_list('id', flat=True)) == set(participant_ids):
                return room, False
        room = ChatRoom.objects.create(order=order)
        room.participants.add(*participant_ids)
        return room, True

    @staticmethod
    def send_message(room, sender, content, message_type='text', file=None, image=None):
        msg = Message.objects.create(
            room=room, sender=sender,
            content=content, message_type=message_type,
            file=file, image=image
        )
        for participant in room.participants.exclude(id=sender.id):
            NotificationService.send_push(
                user=participant,
                type='chat',
                title='New message',
                body=content[:100],
                data={'room_id': str(room.id), 'message_id': str(msg.id)}
            )
        return msg

    @staticmethod
    def mark_as_read(room, user):
        Message.objects.filter(room=room, sender__in=room.participants.exclude(id=user.id), is_read=False).update(is_read=True)
