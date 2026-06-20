from rest_framework import serializers
from .models import Review, ReviewImage
from apps.users.serializers import UserSerializer


class ReviewImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewImage
        fields = ['id', 'image', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_detail = UserSerializer(source='reviewer', read_only=True)
    images = ReviewImageSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['id', 'order', 'reviewer', 'target_user', 'is_reported', 'is_approved', 'created_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(child=serializers.ImageField(), required=False, write_only=True)

    class Meta:
        model = Review
        fields = ['rating', 'quality', 'speed', 'communication', 'professionalism', 'comment', 'images']

    def create(self, validated_data):
        images = validated_data.pop('images', [])
        order = self.context['order']
        review = Review.objects.create(
            order=order,
            reviewer=self.context['request'].user,
            target_user=order.master.user,
            **validated_data
        )
        for img in images:
            ReviewImage.objects.create(review=review, image=img)
        from .services import ReviewService
        ReviewService.update_master_rating(order.master)
        return review
