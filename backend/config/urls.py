from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenBlacklistView
from rest_framework import permissions
from two_factor.urls import urlpatterns as tf_urls

from apps.payments.webhooks import payme_webhook, click_webhook, uzum_webhook

from config.views import (
    health_check, api_root, metrics_view,
    backup_database, restore_database,
)

api_patterns = [
    path('', api_root, name='api-root'),
    path('auth/', include('apps.users.urls')),
    path('categories/', include('apps.categories.urls')),
    path('orders/', include('apps.orders.urls')),
    path('payments/', include('apps.payments.urls')),
    path('reviews/', include('apps.reviews.urls')),
    path('chat/', include('apps.chat.urls')),
    path('notifications/', include('apps.notifications.urls')),
    path('analytics/', include('apps.analytics.urls')),
    path('ai/', include('apps.ai.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include(tf_urls)),
    path('api/v1/', include(api_patterns)),
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/v1/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/v1/health/', health_check, name='health-check'),
    path('api/v1/metrics/', metrics_view, name='metrics'),
    path('api/v1/backup/', backup_database, name='backup-database'),
    path('api/v1/backup/restore/', restore_database, name='restore-database'),
    path('api/v1/auth/', include('rest_framework.urls')),
    path('api/v1/auth/blacklist/', TokenBlacklistView.as_view(), name='token-blacklist'),
    path('api/v1/payments/webhook/payme/', payme_webhook, name='payme-webhook'),
    path('api/v1/payments/webhook/click/', click_webhook, name='click-webhook'),
    path('api/v1/payments/webhook/uzum/', uzum_webhook, name='uzum-webhook'),
    path('health/', include('health_check.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns += [path('__debug__/', include(debug_toolbar.urls))]

admin.site.site_header = 'UstaGo Administration'
admin.site.site_title = 'UstaGo Admin'
admin.site.index_title = 'Welcome to UstaGo Admin Panel'
admin.site.enable_nav_sidebar = True
