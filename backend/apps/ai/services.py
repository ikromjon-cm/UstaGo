import json
import re
import logging
from django.conf import settings
from .models import AIAnalysis, FraudDetectionResult, AIRecommendation, AIChatLog
from .openai_service import OpenAIService
from apps.categories.models import Category
from apps.users.models import MasterProfile

logger = logging.getLogger(__name__)


class AIService:
    @staticmethod
    def analyze_request(text):
        category, confidence = None, 0.0

        openai_result = OpenAIService.categorize(text)
        if openai_result:
            category_name = openai_result.get("category", "")
            confidence = openai_result.get("confidence", 0.0)
            if category_name:
                cat = Category.objects.filter(is_active=True, title_uz__icontains=category_name).first()
                if not cat:
                    cat = Category.objects.filter(is_active=True).filter(
                        title_ru__icontains=category_name
                    ).first()
                if cat:
                    category = cat

        if not category:
            category, confidence = AIService._keyword_detect_category(text)

        ai_price = None
        if category:
            ai_price = OpenAIService.estimate_price(category.title_uz, text)

        if ai_price:
            price_min, price_max = ai_price.get("price_min", 0), ai_price.get("price_max", 0)
        else:
            price_min, price_max = AIService._keyword_estimate_price(category, text)

        nearby_count = 0
        if category:
            nearby_count = MasterProfile.objects.filter(
                categories=category, is_available=True
            ).count()

        analysis = AIAnalysis.objects.create(
            input_text=text,
            detected_category=str(category) if category else '',
            price_estimate_min=price_min,
            price_estimate_max=price_max,
            confidence_score=confidence,
            suggested_masters_count=nearby_count,
        )

        return {
            'category': str(category) if category else 'Unknown',
            'category_id': str(category.id) if category else None,
            'price_estimate': {
                'min': float(price_min) if price_min else 0,
                'max': float(price_max) if price_max else 0,
            },
            'confidence': float(confidence),
            'nearby_masters': nearby_count,
            'analysis_id': str(analysis.id),
        }

    @staticmethod
    def detect_category(text):
        return AIService._keyword_detect_category(text)

    @staticmethod
    def estimate_price(category, text):
        return AIService._keyword_estimate_price(category, text)

    @staticmethod
    def _keyword_detect_category(text):
        text_lower = text.lower()
        categories = Category.objects.filter(is_active=True)
        best_match = None
        best_score = 0

        keyword_map = {
            'santexnik|truba|quvur|kran|suvoq|suv|tushish': 'Santexnik',
            'elektrik|tok|svet|lampa|rozetka|elektr': 'Elektrik',
            'svarchik|payvand|temir|metal': 'Svarchik',
            'quruvchi|qurilish|g\'isht|beton|devor': 'Quruvchi',
            'konditsioner|sovutish|konditsioner': 'Konditsioner',
            'mebel|divan|stol|stul|shkaf|jivoy': 'Mebel ustasi',
            'tozalash|tazalash|yig\'ishtirish|clean': 'Tozalash',
            'gardener|bog\'bon|bog\b|daraxt': 'Bog\'bon',
            'kompyuter|computer|noutbuk|pc': 'Kompyuter ta\'mirlash',
            'internet|wi-fi|wifi|router': 'Internet',
            'tv|televizor|led': 'TV ta\'mirlash',
            'kir yuvish|mashina|kir': 'Kir yuvish mashinasi',
            'muzlatkich|muzlatish|refrigerator': 'Muzlatkich ta\'mirlash',
        }

        for pattern, cat_name in keyword_map.items():
            if re.search(pattern, text_lower):
                for cat in categories:
                    if cat_name.lower() in cat.title_uz.lower():
                        score = 0.9
                        if score > best_score:
                            best_score = score
                            best_match = cat

        if not best_match and categories.exists():
            best_match = categories.first()
            best_score = 0.5

        return best_match, best_score

    @staticmethod
    def _keyword_estimate_price(category, text):
        if not category:
            return 50000, 200000
        base_price = 100000
        ranges = {
            'Santexnik': (80000, 300000),
            'Elektrik': (70000, 250000),
            'Svarchik': (100000, 500000),
            'Quruvchi': (150000, 1000000),
            'Konditsioner': (120000, 400000),
            'Mebel ustasi': (100000, 500000),
            'Tozalash': (50000, 200000),
        }
        cat_name = category.title_uz
        if cat_name in ranges:
            return ranges[cat_name]
        return (base_price // 2, base_price * 2)

    @staticmethod
    def estimate_price_for_text(text, category=None):
        if not category:
            cat, _ = AIService._keyword_detect_category(text)
            category = cat
        ai_price = OpenAIService.estimate_price(category.title_uz if category else '', text) if settings.OPENAI_API_KEY else None
        if ai_price:
            return ai_price.get('price_min', 0), ai_price.get('price_max', 0)
        return AIService._keyword_estimate_price(category, text)

    @staticmethod
    def detect_fraud(target_type, target_id, data=None):
        score = 0
        reasons = []
        if target_type == 'user':
            from apps.users.models import User
            try:
                user = User.objects.get(id=target_id)
                if user.role == 'master':
                    if not user.is_phone_verified:
                        score += 30
                        reasons.append('Phone not verified')
                    profile = MasterProfile.objects.filter(user=user).first()
                    if profile and not profile.is_verified:
                        score += 20
                        reasons.append('Profile not verified')
                        if profile.completed_jobs == 0 and profile.documents.count() == 0:
                            score += 20
                            reasons.append('No completed jobs or documents')
                if user.created_at:
                    from django.utils import timezone
                    age = (timezone.now() - user.created_at).days
                    if age < 1:
                        score += 15
                        reasons.append('Account less than 1 day old')
            except User.DoesNotExist:
                score = 100
                reasons.append('User not found')

        result = FraudDetectionResult.objects.create(
            target_type=target_type,
            target_id=str(target_id),
            score=min(score, 100),
            is_fraudulent=score >= 50,
            reasons=reasons,
        )
        return result

    @staticmethod
    def get_recommendations(user, limit=10):
        from apps.orders.models import Order
        from django.db.models import Q

        user_orders = Order.objects.filter(customer=user).values_list('category_id', flat=True)
        preferred_categories = list(set(user_orders))

        masters = MasterProfile.objects.filter(
            is_available=True, user__status='active'
        ).select_related('user')

        if preferred_categories:
            masters = masters.filter(categories__id__in=preferred_categories)

        masters = masters.order_by('-rating', '-completed_jobs', 'response_time')[:limit]

        recommendations = []
        for i, master in enumerate(masters):
            score = max(0, min(100, float(master.rating) * 20 - i * 5))
            AIRecommendation.objects.create(
                user=user,
                recommended_master=master,
                score=round(score, 2),
            )
            recommendations.append({
                'master_id': str(master.id),
                'name': master.user.full_name,
                'rating': float(master.rating),
                'completed_jobs': master.completed_jobs,
                'score': round(score, 2),
            })
        return recommendations

    @staticmethod
    def chat_response(user, message, session_id):
        from datetime import datetime
        text = message.lower()
        intent = 'general'
        response = ''

        openai_response = OpenAIService.chat(message, user.full_name)
        if openai_response:
            response = openai_response
            intent = 'ai'
        elif 'salom' in text or 'assalom' in text or 'hello' in text or 'hi' in text:
            intent = 'greeting'
            response = f'Assalomu alaykum! {user.full_name}. UstaGo AI yordamchisiga xush kelibsiz. Qanday xizmat kerak?'
        elif 'santexnik' in text or 'truba' in text or 'quvur' in text:
            intent = 'category_inquiry'
            response = 'Santexnik xizmati topildi. O\'rtacha narx: 80,000 - 300,000 so\'m. Buyurtma berasizmi?'
        elif 'elektrik' in text or 'tok' in text:
            intent = 'category_inquiry'
            response = 'Elektr xizmati topildi. O\'rtacha narx: 70,000 - 250,000 so\'m. Buyurtma berasizmi?'
        elif 'narx' in text or 'necha pul' in text or 'qancha' in text:
            intent = 'price_inquiry'
            response = 'Narx xizmat turiga bog\'liq. Iltimos, qanday xizmat kerakligini yozing.'
        elif 'buyurtma' in text or 'ber' in text:
            intent = 'order_creation'
            response = 'Buyurtma berish uchun iltimos, qanday xizmat kerakligini, manzil va byudjetni yozing.'
        elif 'rahmat' in text or 'thanks' in text:
            intent = 'thanks'
            response = 'Arzimaydi! Yana savolingiz bo\'lsa, murojaat qiling.'
        else:
            analysis = AIService.analyze_request(message)
            if analysis['category'] != 'Unknown':
                response = f"Men sizning so'rovingizni tahlil qildim. Kategoriya: {analysis['category']}. Taxminiy narx: {analysis['price_estimate']['min']:,} - {analysis['price_estimate']['max']:,} so'm. Yaqin atrofda {analysis['nearby_masters']} ta usta bor."
                intent = 'analysis'
            else:
                response = 'Tushunmadim. Iltimos, qanday xizmat kerakligini aniqroq yozing.'

        AIChatLog.objects.create(
            user=user,
            session_id=session_id,
            message=message,
            response=response,
            intent=intent,
            confidence=0.8,
        )
        return {'response': response, 'intent': intent}
