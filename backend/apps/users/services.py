from django.db import transaction
from django.contrib.auth import authenticate
from django.core.cache import cache
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, UserAddress, MasterProfile, UserWallet, Transaction


class UserService:
    @staticmethod
    @transaction.atomic
    def register(phone, full_name, password, role='customer'):
        user = User.objects.create(
            phone=phone,
            full_name=full_name,
            role=role,
            username=phone,
        )
        user.set_password(password)
        user.save()
        UserWallet.objects.create(user=user)
        if role == 'master':
            MasterProfile.objects.create(user=user)
        otp = user.generate_otp()
        return user, otp

    @staticmethod
    def login(phone, password):
        user = authenticate(username=phone, password=password)
        if not user:
            try:
                user = User.objects.get(phone=phone)
            except User.DoesNotExist:
                return None, None
            user = authenticate(username=user.username, password=password)
            if not user:
                return None, None
        if user.status != User.Status.ACTIVE:
            return None, 'banned'
        refresh = RefreshToken.for_user(user)
        return user, {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }

    @staticmethod
    def send_otp(user):
        otp = user.generate_otp()
        from apps.notifications.services import NotificationService
        NotificationService.send_sms(user.phone, f'UstaGo: Tasdiqlash kodi {otp}')
        return otp

    @staticmethod
    def verify_otp(user, otp):
        return user.verify_otp(otp)

    @staticmethod
    @transaction.atomic
    def reset_password(phone, otp, password):
        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return None
        if not user.verify_otp(otp):
            return None
        user.set_password(password)
        user.save()
        return user

    @staticmethod
    def get_nearby_masters(lat, lng, radius_km=50, category_id=None):
        from django.db.models import Q
        masters = MasterProfile.objects.filter(
            is_available=True,
            is_online=True,
            status=User.Status.ACTIVE,
        ).select_related('user')
        if category_id:
            masters = masters.filter(categories__id=category_id)
        return masters

    @staticmethod
    def get_master_stats(master_id):
        from django.db.models import Sum
        from apps.orders.models import Order
        total_orders = Order.objects.filter(master_id=master_id).count()
        completed = Order.objects.filter(master_id=master_id, status='completed').count()
        cancelled = Order.objects.filter(master_id=master_id, status='cancelled').count()
        total_earnings = Transaction.objects.filter(
            wallet__user__master_profile__id=master_id,
            type='payment',
            status='completed',
        ).aggregate(total=Sum('net_amount'))['total'] or 0
        return {
            'total_orders': total_orders,
            'completed_orders': completed,
            'cancelled_orders': cancelled,
            'completion_rate': round((completed / total_orders * 100) if total_orders else 100, 2),
            'total_earnings': float(total_earnings),
        }


class WalletService:
    @staticmethod
    def get_balance(user):
        wallet, _ = UserWallet.objects.get_or_create(user=user)
        return wallet

    @staticmethod
    @transaction.atomic
    def add_funds(user, amount, method, reference=''):
        wallet, _ = UserWallet.objects.get_or_create(user=user)
        wallet.balance += amount
        wallet.total_earned += amount
        wallet.save()
        Transaction.objects.create(
            wallet=wallet,
            type='deposit',
            status='completed',
            amount=amount,
            net_amount=amount,
            payment_method=method,
            reference_id=reference,
        )
        return wallet

    @staticmethod
    @transaction.atomic
    def hold_funds(user, amount):
        wallet, _ = UserWallet.objects.get_or_create(user=user)
        if wallet.balance < amount:
            raise ValueError('Insufficient balance')
        wallet.balance -= amount
        wallet.hold_balance += amount
        wallet.save()
        return wallet

    @staticmethod
    @transaction.atomic
    def release_funds(user, amount):
        wallet, _ = UserWallet.objects.get_or_create(user=user)
        if wallet.hold_balance < amount:
            raise ValueError('Insufficient held balance')
        wallet.hold_balance -= amount
        wallet.save()
        return wallet

    @staticmethod
    @transaction.atomic
    def withdraw(user, amount, method):
        wallet, _ = UserWallet.objects.get_or_create(user=user)
        if wallet.balance < amount:
            raise ValueError('Insufficient balance')
        wallet.balance -= amount
        wallet.total_withdrawn += amount
        wallet.save()
        Transaction.objects.create(
            wallet=wallet,
            type='withdrawal',
            status='pending',
            amount=amount,
            net_amount=amount,
            payment_method=method,
        )
        return wallet
