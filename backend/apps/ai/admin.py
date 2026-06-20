from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import AIAnalysis, FraudDetectionResult, AIRecommendation, AIChatLog


@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'detected_category', 'detected_subcategory', 'confidence_score', 'price_estimate_min', 'price_estimate_max', 'suggested_masters_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['input_text', 'detected_category', 'detected_subcategory']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(FraudDetectionResult)
class FraudDetectionResultAdmin(admin.ModelAdmin):
    list_display = ['target_type', 'target_id', 'score', 'is_fraudulent', 'reviewed_by', 'created_at']
    list_filter = ['target_type', 'is_fraudulent', 'created_at']
    search_fields = ['target_id', 'reasons', 'details']
    readonly_fields = ['created_at', 'reviewed_at']
    actions = ['mark_as_fraudulent', 'mark_as_legitimate']

    def mark_as_fraudulent(self, request, queryset):
        queryset.update(is_fraudulent=True, reviewed_by=request.user, reviewed_at=admin.utils.timezone.now())
    mark_as_fraudulent.short_description = _("Mark selected as fraudulent")

    def mark_as_legitimate(self, request, queryset):
        queryset.update(is_fraudulent=False, reviewed_by=request.user, reviewed_at=admin.utils.timezone.now())
    mark_as_legitimate.short_description = _("Mark selected as legitimate")


@admin.register(AIRecommendation)
class AIRecommendationAdmin(admin.ModelAdmin):
    list_display = ['user', 'recommended_master', 'score', 'is_clicked', 'created_at']
    list_filter = ['is_clicked', 'created_at']
    search_fields = ['user__full_name', 'user__phone', 'recommended_master__user__full_name']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(AIChatLog)
class AIChatLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'intent', 'confidence', 'message_preview', 'created_at']
    list_filter = ['intent', 'created_at']
    search_fields = ['message', 'response', 'user__full_name', 'user__phone', 'session_id']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'

    def message_preview(self, obj):
        return obj.message[:75] + '...' if len(obj.message) > 75 else obj.message
    message_preview.short_description = _('Message')
