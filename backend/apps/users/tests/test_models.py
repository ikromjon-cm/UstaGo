import pytest
from django.contrib.auth import get_user_model
from apps.users.models import MasterProfile, UserWallet, UserAddress

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    def test_create_customer(self):
        user = User.objects.create_user(
            phone='+998901234567',
            full_name='Test User',
            password='testpass123',
            role='customer'
        )
        assert user.phone == '+998901234567'
        assert user.full_name == 'Test User'
        assert user.role == 'customer'
        assert user.is_phone_verified is False
        assert user.is_active is True

    def test_create_master_creates_profile(self):
        user = User.objects.create_user(
            phone='+998901234568',
            full_name='Master User',
            password='testpass123',
            role='master'
        )
        assert hasattr(user, 'master_profile')
        assert user.master_profile.is_available is True

    def test_create_user_creates_wallet(self):
        user = User.objects.create_user(
            phone='+998901234569',
            full_name='Wallet User',
            password='testpass123'
        )
        assert hasattr(user, 'wallet')
        assert user.wallet.balance == 0

    def test_user_str(self):
        user = User.objects.create_user(
            phone='+998901234570',
            full_name='Str Test',
            password='testpass123'
        )
        assert str(user) == 'Str Test (+998901234570)'

    def test_generate_and_verify_otp(self):
        user = User.objects.create_user(
            phone='+998901234571',
            full_name='OTP Test',
            password='testpass123'
        )
        otp = user.generate_otp()
        assert otp is not None
        assert user.verify_otp(otp) is True
        assert user.is_phone_verified is True


@pytest.mark.django_db
class TestMasterProfileModel:
    def test_master_profile_creation(self):
        user = User.objects.create_user(
            phone='+998901234572',
            full_name='Master Profile',
            password='testpass123',
            role='master'
        )
        profile = user.master_profile
        assert profile.completed_jobs == 0
        assert profile.rating == 0.0
        assert profile.is_online is False
        assert profile.is_verified is False

    def test_master_str(self):
        user = User.objects.create_user(
            phone='+998901234573',
            full_name='Master Str',
            password='testpass123',
            role='master'
        )
        assert str(user.master_profile) == 'Master: Master Str'


@pytest.mark.django_db
class TestUserAddressModel:
    def test_create_address(self):
        user = User.objects.create_user(
            phone='+998901234574',
            full_name='Address Test',
            password='testpass123'
        )
        address = UserAddress.objects.create(
            user=user,
            title='Home',
            address='Tashkent, Chilonzor',
            latitude=41.2995,
            longitude=69.2401,
        )
        assert str(address) == 'Home: Tashkent, Chilonzor'
        assert address.is_default is False


@pytest.mark.django_db
class TestUserWalletModel:
    def test_wallet_operations(self):
        user = User.objects.create_user(
            phone='+998901234575',
            full_name='Wallet Test',
            password='testpass123'
        )
        assert user.wallet.balance == 0
        assert user.wallet.hold_balance == 0


from django.test import TestCase
from django.db import IntegrityError


class UserModelAdditionalTests(TestCase):
    def test_master_profile_created_on_role_master(self):
        user = User.objects.create_user(
            phone='+998901234040', full_name='Master New',
            password='test123', username='+998901234040',
            role='master'
        )
        self.assertTrue(hasattr(user, 'master_profile'))
        self.assertIsNotNone(user.master_profile)
        self.assertEqual(user.master_profile.completed_jobs, 0)

    def test_user_phone_unique(self):
        User.objects.create_user(
            phone='+998901234041', full_name='First',
            password='test123', username='+998901234041'
        )
        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                phone='+998901234041', full_name='Second',
                password='test123', username='+998901234042'
            )
