from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from compat import extend_tags

from .services import AIService
from .models import AIAnalysis, FraudDetectionResult, AIRecommendation, AIChatLog
from .serializers import (
    AIAnalysisSerializer, FraudDetectionSerializer,
    AIRecommendationSerializer, AIChatLogSerializer,
)


@extend_tags(['AI'])
class AIViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def analyze(self, request):
        text = request.data.get('text', '')
        if not text:
            return Response({'error': 'text is required'}, status=400)
        result = AIService.analyze_request(text)
        return Response(result)

    @action(detail=False, methods=['post'])
    def estimate_price(self, request):
        text = request.data.get('text', '')
        category_id = request.data.get('category_id')
        if not text and not category_id:
            return Response({'error': 'text or category_id required'}, status=400)
        from apps.categories.models import Category
        category = None
        if category_id:
            try:
                category = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                pass
        if not category:
            cat_result, _ = AIService.detect_category(text)
            category = cat_result
        price_min, price_max = AIService.estimate_price(category, text)
        return Response({
            'price_min': float(price_min),
            'price_max': float(price_max),
            'currency': 'UZS',
        })

    @action(detail=False, methods=['post'])
    def detect_fraud(self, request):
        target_type = request.data.get('target_type', '')
        target_id = request.data.get('target_id', '')
        if not target_type or not target_id:
            return Response({'error': 'target_type and target_id required'}, status=400)
        result = AIService.detect_fraud(target_type, target_id)
        return Response({
            'score': float(result.score),
            'is_fraudulent': result.is_fraudulent,
            'reasons': result.reasons,
        })

    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        limit = int(request.query_params.get('limit', 10))
        recommendations = AIService.get_recommendations(request.user, limit)
        return Response(recommendations)

    @action(detail=False, methods=['post'])
    def chat(self, request):
        message = request.data.get('message', '')
        session_id = request.data.get('session_id', 'default')
        if not message:
            return Response({'error': 'message required'}, status=400)
        result = AIService.chat_response(request.user, message, session_id)
        return Response(result)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        analyses = AIAnalysis.objects.filter(
            input_text__isnull=False
        ).order_by('-created_at')[:50]
        serializer = AIAnalysisSerializer(analyses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def fraud_results(self, request):
        results = FraudDetectionResult.objects.all().order_by('-created_at')[:50]
        serializer = FraudDetectionSerializer(results, many=True)
        return Response(serializer.data)
