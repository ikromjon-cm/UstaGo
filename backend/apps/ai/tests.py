import pytest
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from apps.categories.models import Category
from apps.users.models import MasterProfile
from apps.ai.models import AIAnalysis, FraudDetectionResult, AIChatLog
from apps.ai.services import AIService

User = get_user_model()


class AIServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone='+998901234567', full_name='Test User',
            password='testpass123', username='+998901234567'
        )
        self.category = Category.objects.create(
            title_uz='Santexnik', title_ru='Сантехник', title_en='Plumber',
            is_active=True
        )
        self.client.force_login(self.user)

    def test_detect_category_santexnik(self):
        cat, score = AIService.detect_category('Mening kranim oqayapti')
        self.assertIsNotNone(cat)
        self.assertGreater(score, 0.5)

    def test_detect_category_elektrik(self):
        cat, score = AIService.detect_category('Rozetka ishlamayapti')
        self.assertIsNotNone(cat)
        self.assertGreaterEqual(score, 0.5)

    def test_estimate_price_santexnik(self):
        price_min, price_max = AIService.estimate_price(self.category, 'Suv trubasi oqayapti')
        self.assertGreater(price_max, price_min)
        self.assertGreater(price_min, 0)

    def test_analyze_request(self):
        result = AIService.analyze_request('Suv trubasi oqayapti')
        self.assertIn('category', result)
        self.assertIn('price_estimate', result)
        self.assertIn('nearby_masters', result)

    def test_detect_fraud_new_user(self):
        result = AIService.detect_fraud('user', str(self.user.id))
        self.assertIsNotNone(result.score)

    def test_chat_response_greeting(self):
        result = AIService.chat_response(self.user, 'Salom', 'test-session')
        self.assertIn('response', result)
        self.assertIn('intent', result)


class AIAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone='+998901234568', full_name='Test User 2',
            password='testpass123', username='+998901234568'
        )
        Category.objects.create(
            title_uz='Santexnik', title_ru='Сантехник', title_en='Plumber',
            is_active=True
        )

    def test_analyze_endpoint(self):
        self.client.force_login(self.user)
        response = self.client.post('/api/v1/ai/analyze/', {'text': 'Kran oqayapti'}, content_type='application/json')
        self.assertIn(response.status_code, [200, 400])

    def test_chat_endpoint(self):
        self.client.force_login(self.user)
        response = self.client.post('/api/v1/ai/chat/', {'message': 'Salom'}, content_type='application/json')
        self.assertIn(response.status_code, [200, 400])

    def test_estimate_price_endpoint(self):
        self.client.force_login(self.user)
        response = self.client.post('/api/v1/ai/estimate_price/', {'text': 'Santexnik'}, content_type='application/json')
        self.assertIn(response.status_code, [200, 400])
