from django.contrib import admin
from .models import AIAnalysis, FraudDetectionResult, AIRecommendation, AIChatLog


@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = ['detected_category', 'confidence_score', 'suggested_masters_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['input_text', 'detected_category']
    date_hierarchy = 'created_at'


@admin.register(FraudDetectionResult)
class FraudDetectionResultAdmin(admin.ModelAdmin):
    list_display = ['target_type', 'target_id', 'score', 'is_fraudulent', 'created_at']
    list_filter = ['target_type', 'is_fraudulent', 'created_at']


@admin.register(AIRecommendation)
class AIRecommendationAdmin(admin.ModelAdmin):
    list_display = ['user', 'recommended_master', 'score', 'is_clicked', 'created_at']


@admin.register(AIChatLog)
class AIChatLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'intent', 'confidence', 'created_at']
    list_filter = ['intent', 'created_at']
    search_fields = ['message', 'response']
