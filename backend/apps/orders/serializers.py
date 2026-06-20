from rest_framework import serializers
from .models import Order, OrderImage, OrderVideo, OrderVoice, OrderOffer, OrderStatusLog
from apps.users.serializers import UserSerializer, MasterProfileListSerializer


class OrderImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderImage
        fields = ['id', 'image', 'is_before', 'created_at']


class OrderVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderVideo
        fields = ['id', 'video', 'created_at']


class OrderVoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderVoice
        fields = ['id', 'audio', 'duration', 'created_at']


class OrderOfferSerializer(serializers.ModelSerializer):
    master_detail = MasterProfileListSerializer(source='master', read_only=True)

    class Meta:
        model = OrderOffer
        fields = '__all__'
        read_only_fields = ['id', 'order', 'status', 'created_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(child=serializers.ImageField(), required=False, write_only=True)
    videos = serializers.ListField(child=serializers.FileField(), required=False, write_only=True)

    class Meta:
        model = Order
        fields = [
            'title', 'description', 'category', 'service', 'urgency',
            'budget', 'latitude', 'longitude', 'address', 'apartment',
            'preferred_date', 'preferred_time', 'images', 'videos',
        ]

    def create(self, validated_data):
        images = validated_data.pop('images', [])
        videos = validated_data.pop('videos', [])
        validated_data['customer'] = self.context['request'].user
        validated_data['status'] = Order.Status.PENDING
        order = Order.objects.create(**validated_data)
        for img in images:
            OrderImage.objects.create(order=order, image=img)
        for vid in videos:
            OrderVideo.objects.create(order=order, video=vid)
        from .tasks import process_order_after_creation
        process_order_after_creation.delay(str(order.id))
        return order


class OrderSerializer(serializers.ModelSerializer):
    customer_detail = UserSerializer(source='customer', read_only=True)
    master_detail = MasterProfileListSerializer(source='master', read_only=True)
    images = OrderImageSerializer(many=True, read_only=True)
    videos = OrderVideoSerializer(many=True, read_only=True)
    voice_notes = OrderVoiceSerializer(many=True, read_only=True)
    offers = OrderOfferSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = [
            'id', 'customer', 'status', 'commission', 'ai_category',
            'ai_price_estimate_min', 'ai_price_estimate_max',
            'started_at', 'completed_at', 'created_at', 'updated_at',
        ]


class OrderStatusLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusLog
        fields = '__all__'
