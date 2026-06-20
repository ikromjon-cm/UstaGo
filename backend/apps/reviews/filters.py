import django_filters
from .models import Review


class ReviewFilter(django_filters.FilterSet):
    min_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    max_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='lte')
    is_approved = django_filters.BooleanFilter()
    is_reported = django_filters.BooleanFilter()
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    target_user = django_filters.UUIDFilter()
    reviewer = django_filters.UUIDFilter()

    class Meta:
        model = Review
        fields = ['min_rating', 'max_rating', 'is_approved', 'is_reported', 'target_user', 'reviewer']
