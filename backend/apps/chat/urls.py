from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatRoomViewSet

router = DefaultRouter()
router.register(r'rooms', ChatRoomViewSet, basename='rooms')

urlpatterns = router.urls
