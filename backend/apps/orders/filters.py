import django_filters
from .models import Order, OrderOffer


class OrderFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(lookup_expr='iexact')
    category = django_filters.UUIDFilter(field_name='category__id')
    urgency = django_filters.CharFilter(lookup_expr='iexact')
    min_budget = django_filters.NumberFilter(field_name='budget', lookup_expr='gte')
    max_budget = django_filters.NumberFilter(field_name='budget', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    is_paid = django_filters.BooleanFilter()
    is_rated = django_filters.BooleanFilter()

    class Meta:
        model = Order
        fields = ['status', 'category', 'urgency', 'is_paid', 'is_rated']


class OrderOfferFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(lookup_expr='iexact')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')

    class Meta:
        model = OrderOffer
        fields = ['status']
