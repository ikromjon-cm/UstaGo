from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_tags
from .models import Category, Service
from .serializers import CategorySerializer, CategoryListSerializer, ServiceSerializer


@method_decorator(cache_page(300), name='dispatch')
@extend_tags(['Categories'])
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'list':
            return CategoryListSerializer
        return CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(is_active=True)

    @action(detail=True, methods=['get'])
    def services(self, request, pk=None):
        category = self.get_object()
        services = Service.objects.filter(category=category, is_active=True)
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        categories = Category.objects.filter(is_featured=True, is_active=True)
        serializer = CategoryListSerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def tree(self, request):
        categories = Category.objects.filter(parent__isnull=True, is_active=True)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Service.objects.filter(is_active=True)
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        return queryset
