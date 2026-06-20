import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

from apps.chat.routing import websocket_urlpatterns as chat_websocket
from apps.orders.routing import websocket_urlpatterns as order_websocket
from apps.notifications.routing import websocket_urlpatterns as notification_websocket

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                chat_websocket + order_websocket + notification_websocket
            )
        )
    ),
})
