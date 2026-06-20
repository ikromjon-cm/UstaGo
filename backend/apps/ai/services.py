import json
import re
import logging
from django.conf import settings
from django.core.cache import cache
from .models import AIAnalysis, FraudDetectionResult, AIRecommendation, AIChatLog
from apps.categories.models import Category, Service
from apps.users.models import MasterProfile, User

logger = logging.getLogger(__name__)

_openai_client = None

def _get_openai_client():
    global _openai_client
    if _openai_client is None and settings.OPENAI_API_KEY:
        try:
            from openai import OpenAI
            _openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        except Exception as e:
            logger.warning(f"OpenAI client init failed: {e}")
            _openai_client = False
    elif _openai_client is False:
        return None
    return _openai_client

class AIService:
    @staticmethod
    def _call_openai(messages, model="gpt-4o-mini", temperature=0.3, max_tokens=500):
        client = _get_openai_client()
        if not client:
            return None
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI call failed: {e}")
            return None

    @staticmethod
    def analyze_request(text):
        category, confidence = AIService.detect_category(text)
        price_min, price_max = AIService.estimate_price(category, text)
        duration = AIService._estimate_duration(text, category)

        nearby_count = 0
        if category:
            nearby_count = MasterProfile.objects.filter(
                categories=category, is_available=True
            ).count()

        analysis = AIAnalysis.objects.create(
            input_text=text,
            detected_category=str(category) if category else '',
            detected_subcategory='',
            price_estimate_min=price_min,
            price_estimate_max=price_max,
            estimated_duration=duration,
            confidence_score=confidence,
            suggested_masters_count=nearby_count,
        )

        return {
            'category': str(category) if category else 'Unknown',
            'category_id': str(category.id) if category else None,
            'category_title': category.title_uz if category else 'Noma\'lum',
            'price_estimate': {
                'min': float(price_min) if price_min else 0,
                'max': float(price_max) if price_max else 0,
                'currency': 'UZS',
            },
            'estimated_duration': duration,
            'confidence': float(confidence),
            'nearby_masters': nearby_count,
            'analysis_id': str(analysis.id),
        }

    @staticmethod
    def detect_category(text):
        categories = Category.objects.filter(is_active=True)
        if not categories.exists():
            return None, 0

        best_match = None
        best_score = 0

        cache_key = f"ai_category:{hash(text)}"
        cached = cache.get(cache_key)
        if cached:
            return cached, 0.95

        ai_result = AIService._call_openai([
            {"role": "system", "content": (
                "You are a service category classifier for UstaGo - a marketplace for home services in Uzbekistan. "
                f"Available categories: {', '.join([f'{c.title_uz} ({c.title_en or c.title_ru})' for c in categories])}. "
                "Respond with ONLY the category ID (UUID) that best matches the user's request. "
                "If nothing matches, respond with 'unknown'."
            )},
            {"role": "user", "content": text},
        ], temperature=0.1, max_tokens=100)

        if ai_result and ai_result != 'unknown':
            try:
                match = categories.filter(id=ai_result.strip()).first()
                if match:
                    best_match = match
                    best_score = 0.95
                    cache.set(cache_key, match, timeout=3600)
            except Exception:
                pass

        if not best_match:
            text_lower = text.lower()
            keyword_map = {
                'santexnik|truba|quvur|kran|suv oq|unitaz|vanna|dush|kanalizatsiya': 'Santexnik',
                'elektrik|tok|svet|lampa|rozetka|elektr|provod|avtomat|schyotchik': 'Elektrik',
                'svarchik|payvand|temir|metal|svarka|profil': 'Svarchik',
                'quruvchi|qurilish|g\'isht|beton|devor|pold|ship|tamirlash|remont': 'Quruvchi',
                'konditsioner|sovutish|konditsioner|split|konditsioner ta\'mirlash': 'Konditsioner',
                'mebel|divan|stol|stul|shkaf|jivoy|mebel yig\'ish|oshxona': 'Mebel ustasi',
                'tozalash|tazalash|yig\'ishtirish|clean|toza|farrosh|umumiy tozalash': 'Tozalash',
                'bog\'bon|bog\b|daraxt|gul|ko\'chat|bog\' ishlari': 'Bog\'bon',
                'kompyuter|computer|noutbuk|pc|monitor|printer|kompyuter ta\'mirlash': 'Kompyuter ta\'mirlash',
                'internet|wi-fi|wifi|router|internet o\'rnatish|lan': 'Internet',
                'tv|televizor|led|televizor ta\'mirlash': 'TV ta\'mirlash',
                'kir yuvish|kir mashina|kir yuvish mashinasi': 'Kir yuvish mashinasi',
                'muzlatkich|muzlatish|refrigerator|sovitkich': 'Muzlatkich ta\'mirlash',
                'yuk ko\'tarish|yukchi|loader|yuk tashish|ko\'chirish': 'Yuk tashish',
                'haydovchi|driver|mashina haydash|yetkazib berish': 'Haydovchi',
                'qo\'riqchi|security|qorovul|xavfsizlik': 'Xavfsizlik',
                'kamera|videokuzatuv|cctv|videokamera': 'CCTV o\'rnatish',
            }

            for pattern, cat_name in keyword_map.items():
                if re.search(pattern, text_lower):
                    for cat in categories:
                        if cat_name.lower() in cat.title_uz.lower():
                            score = 0.85
                            if score > best_score:
                                best_score = score
                                best_match = cat

        if not best_match and categories.exists():
            best_match = categories.first()
            best_score = 0.5

        return best_match, best_score

    @staticmethod
    def estimate_price(category, text=''):
        if not category:
            return 50000, 200000

        ranges = {
            'Santexnik': (80000, 300000),
            'Elektrik': (70000, 250000),
            'Svarchik': (100000, 500000),
            'Quruvchi': (150000, 1000000),
            'Konditsioner': (120000, 400000),
            'Mebel ustasi': (100000, 500000),
            'Tozalash': (50000, 200000),
            'Bog\'bon': (70000, 250000),
            'Kompyuter ta\'mirlash': (50000, 300000),
            'Internet': (50000, 200000),
            'TV ta\'mirlash': (60000, 250000),
            'Kir yuvish mashinasi': (80000, 300000),
            'Muzlatkich ta\'mirlash': (100000, 400000),
            'Yuk tashish': (50000, 200000),
            'Haydovchi': (50000, 150000),
            'Xavfsizlik': (70000, 200000),
            'CCTV o\'rnatish': (100000, 500000),
        }

        cat_name = category.title_uz
        if cat_name in ranges:
            return ranges[cat_name]
        return 50000, 200000

    @staticmethod
    def _estimate_duration(text, category):
        if not category:
            return '1-2 soat'
        durations = {
            'Santexnik': '1-3 soat',
            'Elektrik': '1-2 soat',
            'Svarchik': '2-4 soat',
            'Quruvchi': '1-3 kun',
            'Konditsioner': '1-3 soat',
            'Mebel ustasi': '2-5 soat',
            'Tozalash': '1-4 soat',
        }
        return durations.get(category.title_uz, '1-2 soat')

    @staticmethod
    def detect_fraud(target_type, target_id, data=None):
        score = 0
        reasons = []

        if target_type == 'user':
            try:
                user = User.objects.get(id=target_id)
                if not user.is_phone_verified:
                    score += 30
                    reasons.append('Telefon tasdiqlanmagan')
                if user.role == 'master':
                    profile = MasterProfile.objects.filter(user=user).first()
                    if profile:
                        if not profile.is_verified:
                            score += 20
                            reasons.append('Profil tasdiqlanmagan')
                        if profile.completed_jobs == 0 and not profile.documents.exists():
                            score += 20
                            reasons.append('Tugallangan ish va hujjatlar yo\'q')
                        if profile.completed_jobs > 100 and profile.rating < 2:
                            score += 25
                            reasons.append('Ko\'p ish bajarilgan, lekin past reyting')
                from django.utils import timezone
                age = (timezone.now() - user.created_at).days
                if age < 1 and user.role == 'master':
                    score += 15
                    reasons.append('Hisob 1 kundan kam')
                if age < 7 and user.completed_jobs > 50:
                    score += 40
                    reasons.append('7 kunda 50+ ish mumkin emas')
            except User.DoesNotExist:
                score = 100
                reasons.append('Foydalanuvchi topilmadi')

        elif target_type == 'review':
            from apps.reviews.models import Review
            try:
                review = Review.objects.get(id=target_id)
                if review.rating == 1 and not review.comment:
                    score += 40
                    reasons.append('1 yulduz, sharhsiz')
                reviews_from_user = Review.objects.filter(reviewer=review.reviewer)
                if reviews_from_user.filter(rating=5).count() == reviews_from_user.count() and reviews_from_user.count() > 5:
                    score += 30
                    reasons.append('Faqat 5 yulduzli sharhlar')
            except Review.DoesNotExist:
                score = 100
                reasons.append('Sharh topilmadi')

        elif target_type == 'payment':
            score += 10
            reasons.append('Standart tekshiruv')

        ai_boost = AIService._call_openai([
            {"role": "system", "content": (
                "You are a fraud detection AI for UstaGo marketplace. "
                f"Current fraud score: {score}/100. Reasons: {reasons}. "
                "Rate from 0-100 how likely this is fraudulent based on the data. "
                "Respond with ONLY a number between 0-100."
            )},
            {"role": "user", "content": json.dumps(data or {'target_type': target_type, 'target_id': target_id})},
        ], temperature=0.1, max_tokens=10)

        if ai_boost:
            try:
                ai_score = int(float(ai_boost.strip()))
                score = max(score, ai_score)
            except (ValueError, TypeError):
                pass

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

        user_orders = Order.objects.filter(customer=user).values_list('category_id', flat=True)
        preferred_categories = list(set(filter(None, user_orders)))

        masters = MasterProfile.objects.filter(
            is_available=True, user__status='active'
        ).select_related('user')

        if preferred_categories:
            masters = masters.filter(categories__id__in=preferred_categories)

        masters = masters.order_by('-rating', '-completed_jobs', 'response_time')[:limit * 2]

        recommendations = []
        for i, master in enumerate(masters[:limit]):
            score = max(0, min(100, float(master.rating) * 20 - i * 5))
            master_name = master.user.full_name if master.user else ''
            AIRecommendation.objects.create(
                user=user,
                recommended_master=master,
                score=round(score, 2),
            )
            recommendations.append({
                'master_id': str(master.id),
                'name': master_name,
                'rating': float(master.rating),
                'completed_jobs': master.completed_jobs,
                'price_per_hour': float(master.price_per_hour),
                'is_verified': master.is_verified,
                'score': round(score, 2),
            })
        return recommendations

    @staticmethod
    def chat_response(user, message, session_id):
        text = message.lower()
        intent = 'general'

        system_prompt = (
            "You are UstaGo AI Assistant - a helpful service marketplace assistant for Uzbekistan. "
            "You help users find masters (plumbers, electricians, welders, builders, etc.), "
            "estimate prices, and navigate the UstaGo platform. "
            "Be concise, friendly, and helpful. Respond in the same language as the user (Uzbek, Russian, or English). "
            "If the user wants to create an order, guide them to describe their problem. "
            "Keep responses under 100 words."
        )

        ai_response = AIService._call_openai([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ], model="gpt-4o-mini", temperature=0.7, max_tokens=300)

        if ai_response:
            intent = 'ai_response'
            response = ai_response
        else:
            if any(g in text for g in ['salom', 'assalom', 'hello', 'hi', 'hey']):
                intent = 'greeting'
                response = f'Assalomu alaykum! {user.full_name}. UstaGo AI yordamchisiga xush kelibsiz. Qanday xizmat kerak?'
            elif any(p in text for p in ['narx', 'necha pul', 'qancha', 'price', 'cost']):
                intent = 'price_inquiry'
                response = 'Narx xizmat turiga bog\'liq. Iltimos, qanday xizmat kerakligini yozing, men taxminiy narxni aytib beraman.'
            elif any(b in text for b in ['buyurtma', 'ber', 'zakaz', 'order']):
                intent = 'order_creation'
                response = 'Buyurtma berish uchun iltimos, qanday xizmat kerakligini, manzil va byudjetni yozing.'
            elif any(r in text for r in ['rahmat', 'thanks', 'thank', 'ok']) and 'buyurtma' not in text:
                intent = 'thanks'
                response = 'Arzimaydi! Yana savolingiz bo\'lsa, murojaat qiling. UstaGo bilan sifatli xizmat topish oson!'
            else:
                analysis = AIService.analyze_request(message)
                if analysis['category'] != 'Unknown' and analysis['category'] != 'Noma\'lum':
                    intent = 'analysis'
                    response = (
                        f"Men sizning so'rovingizni tahlil qildim.\n"
                        f"🏷 Kategoriya: {analysis['category_title']}\n"
                        f"💰 Taxminiy narx: {analysis['price_estimate']['min']:,.0f} - {analysis['price_estimate']['max']:,.0f} so'm\n"
                        f"⏱ Davomiylik: {analysis['estimated_duration']}\n"
                        f"🔧 Yaqin atrofda {analysis['nearby_masters']} ta usta bor.\n\n"
                        "Buyurtma berish uchun 'Buyurtma berish' tugmasini bosing."
                    )
                else:
                    response = 'Kechirasiz, tushunmadim. Iltimos, qanday xizmat kerakligini aniqroq yozing. Masalan: "Santexnik kerak" yoki "Konditsioner ta\'mirlash"'

        AIChatLog.objects.create(
            user=user,
            session_id=session_id,
            message=message,
            response=response,
            intent=intent,
            confidence=0.85 if ai_response else 0.7,
        )
        return {'response': response, 'intent': intent}
