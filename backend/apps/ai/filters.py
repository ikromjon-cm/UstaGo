import django_filters
from .models import AIAnalysis, FraudDetectionResult, AIChatLog


class AIAnalysisFilter(django_filters.FilterSet):
    min_confidence = django_filters.NumberFilter(field_name='confidence_score', lookup_expr='gte')
    max_confidence = django_filters.NumberFilter(field_name='confidence_score', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = AIAnalysis
        fields = ['min_confidence', 'max_confidence']


class FraudDetectionResultFilter(django_filters.FilterSet):
    target_type = django_filters.CharFilter(lookup_expr='iexact')
    is_fraudulent = django_filters.BooleanFilter()
    min_score = django_filters.NumberFilter(field_name='score', lookup_expr='gte')

    class Meta:
        model = FraudDetectionResult
        fields = ['target_type', 'is_fraudulent']


class AIChatLogFilter(django_filters.FilterSet):
    intent = django_filters.CharFilter(lookup_expr='iexact')
    session_id = django_filters.CharFilter(lookup_expr='iexact')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = AIChatLog
        fields = ['intent', 'session_id']
