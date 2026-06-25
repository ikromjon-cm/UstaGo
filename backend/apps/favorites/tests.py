from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.users.models import MasterProfile, UserFavorite

User = get_user_model()


class FavoriteAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(phone='+998901234092', full_name='Test', password='test123', username='fav_test')
        self.master_user = User.objects.create_user(phone='+998901234093', full_name='Master', password='test123', username='fav_master', role='master')
        self.client.force_login(self.user)

    def test_toggle_favorite_add(self):
        master = MasterProfile.objects.get(user=self.master_user)
        resp = self.client.post('/api/v1/auth/favorites/toggle/', {'master': master.id})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()['favorited'])
        self.assertEqual(UserFavorite.objects.count(), 1)

    def test_toggle_favorite_remove(self):
        master = MasterProfile.objects.get(user=self.master_user)
        UserFavorite.objects.create(user=self.user, master=master)
        resp = self.client.post('/api/v1/auth/favorites/toggle/', {'master': master.id})
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.json()['favorited'])
        self.assertEqual(UserFavorite.objects.count(), 0)

    def test_list_favorites(self):
        master = MasterProfile.objects.get(user=self.master_user)
        UserFavorite.objects.create(user=self.user, master=master)
        resp = self.client.get('/api/v1/auth/favorites/')
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(len(resp.json()['results']), 1)
