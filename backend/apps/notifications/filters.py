import django_filters
from .models import Notification


class NotificationFilter(django_filters.FilterSet):
    type = django_filters.CharFilter(lookup_expr='iexact')
    is_read = django_filters.BooleanFilter()
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Notification
        fields = ['type', 'is_read']
