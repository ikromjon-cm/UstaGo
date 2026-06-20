import json
import os
from django.conf import settings
from .models import Notification


class NotificationService:
    _firebase_initialized = False

    @classmethod
    def _init_firebase(cls):
        if cls._firebase_initialized:
            return
        try:
            import firebase_admin
            if not firebase_admin._apps:
                cred_path = os.environ.get('FIREBASE_CREDENTIALS', '')
                if cred_path and os.path.exists(cred_path):
                    cred = firebase_admin.credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                else:
                    firebase_admin.initialize_app()
            cls._firebase_initialized = True
        except Exception:
            cls._firebase_initialized = True

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
                NotificationService._init_firebase()
                from firebase_admin import messaging
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
        bot_token = settings.env('TELEGRAM_BOT_TOKEN', default='')
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
