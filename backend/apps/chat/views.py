from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from drf_spectacular.utils import extend_tags

from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer, MessageCreateSerializer


@extend_tags(['Chat'])
class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatRoom.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants').order_by('-updated_at')

    def perform_create(self, serializer):
        room = serializer.save()
        room.participants.add(self.request.user)
        other_user_id = self.request.data.get('participant_id')
        if other_user_id:
            from apps.users.models import User
            try:
                other = User.objects.get(id=other_user_id)
                room.participants.add(other)
            except User.DoesNotExist:
                pass

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        room = self.get_object()
        messages = Message.objects.filter(room=room).order_by('created_at')
        before = request.query_params.get('before')
        limit = int(request.query_params.get('limit', 50))
        if before:
            messages = messages.filter(created_at__lt=before)
        messages = messages[:limit]
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        room = self.get_object()
        serializer = MessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save(room=room, sender=request.user)
        room.updated_at = message.created_at
        room.save(update_fields=['updated_at'])
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        room = self.get_object()
        Message.objects.filter(
            room=room
        ).exclude(sender=request.user).update(is_read=True)
        return Response({'success': True})

    @action(detail=True, methods=['get'])
    def unread_count(self, request, pk=None):
        room = self.get_object()
        count = Message.objects.filter(room=room, is_read=False).exclude(sender=request.user).count()
        return Response({'count': count})

    @action(detail=False, methods=['get'])
    def get_or_create(self, request):
        other_user_id = request.query_params.get('user_id')
        order_id = request.query_params.get('order_id')
        if not other_user_id:
            return Response({'error': 'user_id required'}, status=400)
        room = ChatRoom.objects.filter(
            participants=request.user
        ).filter(
            participants__id=other_user_id
        )
        if order_id:
            room = room.filter(order_id=order_id)
        room = room.first()
        if room:
            serializer = self.get_serializer(room)
            return Response(serializer.data)
        room = ChatRoom.objects.create(order_id=order_id)
        room.participants.add(request.user)
        from apps.users.models import User
        try:
            other = User.objects.get(id=other_user_id)
            room.participants.add(other)
        except User.DoesNotExist:
            pass
        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
