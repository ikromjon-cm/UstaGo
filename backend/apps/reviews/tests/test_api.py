from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.categories.models import Category
from apps.orders.models import Order
from apps.reviews.models import Review

User = get_user_model()


class ReviewAPITests(TestCase):
    def setUp(self):
        self.reviewer = User.objects.create_user(phone='+998901234095', full_name='Reviewer', password='test123', username='reviewer_test')
        self.target = User.objects.create_user(phone='+998901234096', full_name='Target', password='test123', username='target_test', role='master')
        self.cat = Category.objects.create(title_uz='Test', title_ru='Тест', title_en='Test')
        self.order = Order.objects.create(
            customer=self.reviewer, category=self.cat, title='Test',
            budget=50000, address='Tashkent', latitude=41.3,
            longitude=69.24, status='completed',
            master=self.target.master_profile,
        )

    def test_create_review(self):
        self.client.force_login(self.reviewer)
        resp = self.client.post('/api/v1/reviews/', {
            'order_id': str(self.order.id),
            'rating': 5,
            'comment': 'Great!',
        }, format='json')
        self.assertIn(resp.status_code, [200, 201])

    def test_review_response(self):
        self.client.force_login(self.reviewer)
        resp = self.client.post('/api/v1/reviews/', {
            'order_id': str(self.order.id),
            'rating': 5,
            'comment': 'Great!',
        }, format='json')
        self.assertIn(resp.status_code, [200, 201], msg=f'Create review failed: {resp.status_code} {resp.content}')
        review_id = resp.json().get('id')
        self.assertIsNotNone(review_id, msg=f'Response has no id: {resp.json()}')
        self.client.force_login(self.target)
        resp = self.client.post(f'/api/v1/reviews/{review_id}/respond/', {'response': 'Thank you!'}, format='json')
        self.assertEqual(resp.status_code, 200, msg=f'Expected 200, got {resp.status_code}: {resp.content}')
        self.assertEqual(resp.json()['response'], 'Thank you!')

    def test_report_review(self):
        self.client.force_login(self.reviewer)
        resp = self.client.post('/api/v1/reviews/', {
            'order_id': str(self.order.id),
            'rating': 3,
            'comment': 'Okay',
        }, format='json')
        self.assertIn(resp.status_code, [200, 201], msg=f'Create review failed: {resp.status_code} {resp.content}')
        review_id = resp.json().get('id')
        self.assertIsNotNone(review_id, msg=f'Response has no id: {resp.json()}')
        resp = self.client.post(f'/api/v1/reviews/{review_id}/report/', {'reason': 'Spam'}, format='json')
        self.assertEqual(resp.status_code, 200, msg=f'Expected 200, got {resp.status_code}: {resp.content}')
        self.assertTrue(resp.json()['success'])
