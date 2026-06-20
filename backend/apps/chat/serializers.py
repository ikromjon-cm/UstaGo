from rest_framework import serializers
from .models import ChatRoom, Message
from apps.users.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender_detail = UserSerializer(source='sender', read_only=True)

    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['id', 'room', 'sender', 'is_read', 'is_delivered', 'read_at', 'delivered_at', 'created_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['message_type', 'content', 'file', 'image', 'voice', 'latitude', 'longitude', 'reply_to']


class ChatRoomSerializer(serializers.ModelSerializer):
    participants_detail = UserSerializer(source='participants', many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return MessageSerializer(msg).data
        return None

    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()
