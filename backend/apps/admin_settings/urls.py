from django.urls import path
from .views import platform_settings

urlpatterns = [
    path('', platform_settings),
]
