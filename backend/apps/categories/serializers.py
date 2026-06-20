from rest_framework import serializers
from .models import Category, Service


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    service_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'title_uz', 'title_ru', 'title_en', 'title',
            'description', 'icon', 'image', 'parent', 'children',
            'sort_order', 'is_active', 'is_featured', 'service_count',
        ]

    def get_children(self, obj):
        children = obj.get_children()
        if children:
            return CategorySerializer(children, many=True).data
        return []

    def get_service_count(self, obj):
        return obj.services.count()


class CategoryListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'title_uz', 'title', 'icon', 'parent', 'sort_order', 'is_featured']


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'
