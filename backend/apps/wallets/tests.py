from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from apps.users.models import Transaction

User = get_user_model()


class WalletAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(phone='+998901234090', full_name='Test', password='test123', username='wallet_test_user')
        self.client.force_login(self.user)

    def test_get_balance(self):
        wallet = self.user.wallet
        wallet.balance = 100000
        wallet.save()
        resp = self.client.get('/api/v1/auth/wallets/balance/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['balance'], '100000.00')

    def test_get_balance_unauthenticated(self):
        self.client.logout()
        resp = self.client.get('/api/v1/auth/wallets/balance/')
        self.assertEqual(resp.status_code, 401)

    def test_get_transactions(self):
        wallet = self.user.wallet
        Transaction.objects.create(wallet=wallet, amount=50000, net_amount=50000, type='deposit', status='completed', description='Test')
        resp = self.client.get('/api/v1/auth/wallets/transactions/')
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(len(resp.json()['results']), 1)

    def test_get_transactions_empty(self):
        resp = self.client.get('/api/v1/auth/wallets/transactions/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 0)
