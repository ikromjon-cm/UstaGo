from rest_framework import serializers
from .models import DailyMetric, RevenueReport, AnalyticsEvent


class DailyMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyMetric
        fields = '__all__'


class RevenueReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenueReport
        fields = '__all__'


class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsEvent
        fields = '__all__'
