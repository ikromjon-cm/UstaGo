import django_filters
from .models import Payment, Payout


class PaymentFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(lookup_expr='iexact')
    method = django_filters.CharFilter(lookup_expr='iexact')
    min_amount = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    max_amount = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    paid_after = django_filters.DateTimeFilter(field_name='paid_at', lookup_expr='gte')
    paid_before = django_filters.DateTimeFilter(field_name='paid_at', lookup_expr='lte')

    class Meta:
        model = Payment
        fields = ['status', 'method']


class PayoutFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(lookup_expr='iexact')
    method = django_filters.CharFilter(lookup_expr='iexact')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Payout
        fields = ['status', 'method']
