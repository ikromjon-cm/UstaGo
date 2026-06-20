import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


class AIAnalysis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        'orders.Order', on_delete=models.CASCADE, null=True, blank=True,
        related_name='ai_analyses'
    )
    input_text = models.TextField()
    detected_category = models.CharField(max_length=255, blank=True)
    detected_subcategory = models.CharField(max_length=255, blank=True)
    price_estimate_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    price_estimate_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    estimated_duration = models.CharField(max_length=100, blank=True)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    suggested_masters_count = models.PositiveIntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_analyses'
        ordering = ['-created_at']


class FraudDetectionResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    target_type = models.CharField(max_length=50, choices=[
        ('user', 'User'), ('order', 'Order'), ('review', 'Review'),
        ('payment', 'Payment'),
    ])
    target_id = models.CharField(max_length=255)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_fraudulent = models.BooleanField(default=False)
    reasons = models.JSONField(default=list, blank=True)
    details = models.JSONField(default=dict, blank=True)
    reviewed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fraud_detection_results'


class AIRecommendation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='ai_recommendations')
    recommended_master = models.ForeignKey('users.MasterProfile', on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    reason = models.TextField(blank=True)
    is_clicked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_recommendations'


class AIChatLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=255)
    message = models.TextField()
    response = models.TextField()
    intent = models.CharField(max_length=255, blank=True)
    confidence = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_chat_logs'
