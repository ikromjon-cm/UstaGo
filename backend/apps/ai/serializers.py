from rest_framework import serializers
from .models import AIAnalysis, FraudDetectionResult, AIRecommendation, AIChatLog


class AIAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAnalysis
        fields = '__all__'


class FraudDetectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FraudDetectionResult
        fields = '__all__'


class AIRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIRecommendation
        fields = '__all__'


class AIChatLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIChatLog
        fields = '__all__'
