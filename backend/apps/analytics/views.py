from datetime import datetime, timedelta
from django.db.models import Count, Sum, Avg
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_tags

from apps.users.models import User, MasterProfile, Transaction
from apps.orders.models import Order
from apps.payments.models import Payment
from .models import DailyMetric


@extend_tags(['Analytics'])
class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        end_of_month = (start_of_month + timedelta(days=32)).replace(day=1)

        total_users = User.objects.count()
        total_masters = MasterProfile.objects.count()
        total_orders = Order.objects.count()
        total_revenue = Payment.objects.filter(status='completed').aggregate(
            total=Sum('amount')
        )['total'] or 0

        today_orders = Order.objects.filter(created_at__date=today).count()
        today_revenue = Payment.objects.filter(
            status='completed', paid_at__date=today
        ).aggregate(total=Sum('amount'))['total'] or 0

        monthly_orders = Order.objects.filter(
            created_at__date__gte=start_of_month,
            created_at__date__lt=end_of_month,
        ).count()

        monthly_revenue = Payment.objects.filter(
            status='completed',
            paid_at__date__gte=start_of_month,
            paid_at__date__lt=end_of_month,
        ).aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            'total_users': total_users,
            'total_masters': total_masters,
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'today': {
                'orders': today_orders,
                'revenue': float(today_revenue),
            },
            'this_month': {
                'orders': monthly_orders,
                'revenue': float(monthly_revenue),
            },
        })

    @action(detail=False, methods=['get'])
    def user_growth(self, request):
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days)
        data = (
            User.objects.filter(created_at__date__gte=start_date)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        return Response([
            {'date': d['date'].isoformat(), 'count': d['count']} for d in data
        ])

    @action(detail=False, methods=['get'])
    def revenue_chart(self, request):
        months = int(request.query_params.get('months', 12))
        start_date = timezone.now().date() - timedelta(days=months * 30)
        data = (
            Payment.objects.filter(
                status='completed', paid_at__date__gte=start_date
            )
            .annotate(month=TruncMonth('paid_at'))
            .values('month')
            .annotate(
                revenue=Sum('amount'),
                commission=Sum('commission_amount'),
                orders=Count('id', distinct=True),
            )
            .order_by('month')
        )
        return Response([
            {
                'month': d['month'].isoformat() if d['month'] else None,
                'revenue': float(d['revenue'] or 0),
                'commission': float(d['commission'] or 0),
                'orders': d['orders'],
            }
            for d in data
        ])

    @action(detail=False, methods=['get'])
    def top_categories(self, request):
        from apps.orders.models import Order
        data = (
            Order.objects.filter(category__isnull=False)
            .values('category__title_uz')
            .annotate(
                count=Count('id'),
                revenue=Sum('final_price'),
            )
            .order_by('-count')[:10]
        )
        return Response([
            {
                'category': d['category__title_uz'],
                'orders': d['count'],
                'revenue': float(d['revenue'] or 0),
            }
            for d in data
        ])

    @action(detail=False, methods=['get'])
    def master_stats(self, request):
        days = int(request.query_params.get('days', 7))
        start_date = timezone.now() - timedelta(days=days)
        top_masters = (
            MasterProfile.objects.filter(
                orders__created_at__gte=start_date
            )
            .annotate(
                order_count=Count('orders'),
                total_earned=Sum('orders__final_price'),
            )
            .order_by('-order_count')[:10]
        )
        return Response([
            {
                'master_id': str(m.id),
                'name': m.user.full_name,
                'orders': m.order_count,
                'earnings': float(m.total_earned or 0),
                'rating': float(m.rating),
            }
            for m in top_masters
        ])

    @action(detail=False, methods=['get'])
    def summary(self, request):
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        def period_stats(start_date):
            users = User.objects.filter(created_at__date__gte=start_date).count()
            orders = Order.objects.filter(created_at__date__gte=start_date).count()
            revenue = Payment.objects.filter(status='completed', paid_at__date__gte=start_date).aggregate(
                total=Sum('amount')
            )['total'] or 0
            return {'users': users, 'orders': orders, 'revenue': float(revenue)}

        return Response({
            'today': period_stats(today),
            'this_week': period_stats(week_ago),
            'this_month': period_stats(month_ago),
            'all_time': {
                'users': User.objects.count(),
                'masters': MasterProfile.objects.count(),
                'orders': Order.objects.count(),
                'revenue': float(Payment.objects.filter(status='completed').aggregate(
                    total=Sum('amount')
                )['total'] or 0),
            },
        })
