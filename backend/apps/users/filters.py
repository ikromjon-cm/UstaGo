import django_filters
from .models import User, MasterProfile, Transaction


class UserFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='search_filter')
    role = django_filters.CharFilter(lookup_expr='iexact')
    status = django_filters.CharFilter(lookup_expr='iexact')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = User
        fields = ['role', 'status', 'is_phone_verified']

    def search_filter(self, queryset, name, value):
        return queryset.filter(full_name__icontains=value) | queryset.filter(phone__icontains=value)


class MasterProfileFilter(django_filters.FilterSet):
    min_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price_per_hour', lookup_expr='lte')
    category = django_filters.UUIDFilter(field_name='categories__id')
    is_online = django_filters.BooleanFilter()
    is_verified = django_filters.BooleanFilter()

    class Meta:
        model = MasterProfile
        fields = ['category', 'is_online', 'is_verified', 'is_available']


class TransactionFilter(django_filters.FilterSet):
    type = django_filters.CharFilter(lookup_expr='iexact')
    status = django_filters.CharFilter(lookup_expr='iexact')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Transaction
        fields = ['type', 'status']
