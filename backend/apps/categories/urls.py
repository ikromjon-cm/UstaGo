from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ServiceViewSet

router = DefaultRouter()
router.register(r'', CategoryViewSet, basename='categories')
router.register(r'services', ServiceViewSet, basename='services')

urlpatterns = router.urls
