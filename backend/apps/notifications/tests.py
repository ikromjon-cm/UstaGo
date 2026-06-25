import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.notifications.models import Notification, NotificationTemplate

User = get_user_model()


class NotificationModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone='+998901234567', full_name='Test User',
            password='testpass123', username='+998901234567'
        )

    def test_create_notification(self):
        notif = Notification.objects.create(
            user=self.user, type='system',
            title='Test', body='Test body'
        )
        self.assertEqual(str(notif), 'system: Test')
        self.assertFalse(notif.is_read)

    def test_mark_as_read(self):
        notif = Notification.objects.create(
            user=self.user, type='order',
            title='Order Update', body='Your order is complete'
        )
        notif.is_read = True
        notif.save()
        self.assertTrue(Notification.objects.get(id=notif.id).is_read)

    def test_notification_template(self):
        template = NotificationTemplate.objects.create(
            key='order_confirmed', type='order',
            title_uz='Buyurtma tasdiqlandi',
            body_uz='Buyurtmangiz #{id} tasdiqlandi',
            is_active=True
        )
        self.assertEqual(template.title_uz, 'Buyurtma tasdiqlandi')
        self.assertTrue(template.is_active)

    def test_unread_count(self):
        Notification.objects.create(user=self.user, type='system', title='N1', body='B1')
        Notification.objects.create(user=self.user, type='system', title='N2', body='B2')
        unread = Notification.objects.filter(user=self.user, is_read=False).count()
        self.assertEqual(unread, 2)


class NotificationAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone='+998901234568', full_name='Notif User',
            password='testpass123', username='+998901234568'
        )

    def test_notifications_endpoint(self):
        self.client.force_login(self.user)
        response = self.client.get('/api/v1/notifications/')
        self.assertEqual(response.status_code, 200)

    def test_mark_all_read(self):
        self.client.force_login(self.user)
        Notification.objects.create(user=self.user, type='system', title='T', body='B')
        response = self.client.post('/api/v1/notifications/mark_all_read/')
        self.assertEqual(response.status_code, 200)
