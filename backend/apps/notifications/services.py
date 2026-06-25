import json
from django.conf import settings
from .models import Notification


class NotificationService:
    @staticmethod
    def send_push(user, title, body, data=None, ntype='system'):
        notification = Notification.objects.create(
            user=user,
            type=ntype,
            title=title,
            body=body,
            data=data or {},
        )
        if user.fcm_token:
            try:
                from firebase_admin import messaging, initialize_app, credentials
                if not messaging:
                    pass
                message = messaging.Message(
                    notification=messaging.Notification(
                        title=title,
                        body=body,
                    ),
                    data={k: str(v) for k, v in (data or {}).items()},
                    token=user.fcm_token,
                )
                messaging.send(message)
            except Exception:
                pass
        return notification

    @staticmethod
    def send_bulk(users, title, body, data=None, ntype='system'):
        notifications = []
        for user in users:
            n = NotificationService.send_push(user, title, body, data, ntype)
            notifications.append(n)
        return notifications

    @staticmethod
    def send_sms(phone, message):
        if settings.ESKIZ_TOKEN:
            import requests
            try:
                requests.post(
                    'https://notify.eskiz.uz/api/message/sms/send',
                    data={
                        'mobile_phone': phone,
                        'message': message,
                        'from': '4546',
                    },
                    headers={'Authorization': f'Bearer {settings.ESKIZ_TOKEN}'},
                    timeout=10,
                )
            except Exception:
                pass

    @staticmethod
    def send_telegram(chat_id, message):
        bot_token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '')
        if bot_token:
            import requests
            try:
                requests.post(
                    f'https://api.telegram.org/bot{bot_token}/sendMessage',
                    json={'chat_id': chat_id, 'text': message},
                    timeout=10,
                )
            except Exception:
                pass
