import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.analytics.models import AnalyticsEvent, DailyMetric, RevenueReport

User = get_user_model()


class AnalyticsModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone='+998901234567', full_name='Test User',
            password='testpass123', username='+998901234567'
        )

    def test_create_analytics_event(self):
        event = AnalyticsEvent.objects.create(
            event_type='page_view', path='/',
            ip_address='127.0.0.1'
        )
        self.assertEqual(event.event_type, 'page_view')
        self.assertIsNotNone(event.created_at)

    def test_daily_metric(self):
        from datetime import date
        metric = DailyMetric.objects.create(
            date=date.today(), new_users=10,
            total_orders=25, completed_orders=20,
            total_revenue=1000000
        )
        self.assertEqual(metric.new_users, 10)
        self.assertEqual(metric.completed_orders, 20)

    def test_revenue_report(self):
        from datetime import date
        report = RevenueReport.objects.create(
            period='daily', start_date=date.today(),
            end_date=date.today(), gross_revenue=500000,
            net_revenue=450000, commission_earned=50000
        )
        self.assertEqual(report.gross_revenue, 500000)
        self.assertEqual(report.period, 'daily')


class AnalyticsAPITests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            phone='+998901234568', full_name='Admin',
            password='admin123', username='+998901234568'
        )

    def test_dashboard_endpoint(self):
        self.client.force_login(self.admin)
        response = self.client.get('/api/v1/analytics/dashboard/')
        self.assertEqual(response.status_code, 200)

    def test_summary_endpoint(self):
        self.client.force_login(self.admin)
        response = self.client.get('/api/v1/analytics/summary/')
        self.assertEqual(response.status_code, 200)
