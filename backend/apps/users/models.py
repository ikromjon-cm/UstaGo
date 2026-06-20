import uuid
import pyotp
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.cache import cache
from phonenumber_field.modelfields import PhoneNumberField
from versatileimagefield.fields import VersatileImageField


class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = 'customer', _('Customer')
        MASTER = 'master', _('Master')
        COMPANY = 'company', _('Company')
        ADMIN = 'admin', _('Admin')
        SUPER_ADMIN = 'super_admin', _('Super Admin')

    class Status(models.TextChoices):
        ACTIVE = 'active', _('Active')
        INACTIVE = 'inactive', _('Inactive')
        BANNED = 'banned', _('Banned')
        DELETED = 'deleted', _('Deleted')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    phone = PhoneNumberField(unique=True, region='UZ', verbose_name=_('Phone Number'))
    avatar = VersatileImageField(
        upload_to='avatars/', blank=True, null=True,
        verbose_name=_('Avatar')
    )
    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.CUSTOMER,
        verbose_name=_('Role')
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE,
        verbose_name=_('Status')
    )
    full_name = models.CharField(max_length=255, verbose_name=_('Full Name'))
    bio = models.TextField(blank=True, verbose_name=_('Bio'))
    lang = models.CharField(
        max_length=10, default='uz',
        choices=[('uz', 'Uzbek'), ('ru', 'Russian'), ('en', 'English')],
        verbose_name=_('Language')
    )
    device_id = models.CharField(max_length=255, blank=True, verbose_name=_('Device ID'))
    device_type = models.CharField(max_length=50, blank=True, verbose_name=_('Device Type'))
    fcm_token = models.TextField(blank=True, verbose_name=_('FCM Token'))
    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_identity_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True, null=True)
    otp_secret = models.CharField(max_length=32, blank=True)
    last_active = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        db_table = 'users'
        indexes = [
            models.Index(fields=['phone']),
            models.Index(fields=['role']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['role', 'status']),
        ]

    def __str__(self):
        return f'{self.full_name} ({self.phone})'

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = str(self.phone)
        super().save(*args, **kwargs)

    def generate_otp(self):
        secret = pyotp.random_base32()
        self.otp_secret = secret
        self.save(update_fields=['otp_secret'])
        totp = pyotp.TOTP(secret, interval=300)
        otp = totp.now()
        cache.set(f'otp:{self.id}', otp, timeout=300)
        return otp

    def verify_otp(self, otp):
        cached_otp = cache.get(f'otp:{self.id}')
        if cached_otp and str(cached_otp) == str(otp):
            cache.delete(f'otp:{self.id}')
            self.is_phone_verified = True
            self.save(update_fields=['is_phone_verified'])
            return True
        if self.otp_secret:
            totp = pyotp.TOTP(self.otp_secret, interval=300)
            if totp.verify(otp):
                self.is_phone_verified = True
                self.save(update_fields=['is_phone_verified'])
                return True
        return False


class UserAddress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='addresses',
        verbose_name=_('User')
    )
    title = models.CharField(max_length=255, verbose_name=_('Title'))
    address = models.TextField(verbose_name=_('Address'))
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    apartment = models.CharField(max_length=100, blank=True)
    entrance = models.CharField(max_length=50, blank=True)
    floor = models.CharField(max_length=50, blank=True)
    door_code = models.CharField(max_length=50, blank=True)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('User Address')
        verbose_name_plural = _('User Addresses')
        db_table = 'user_addresses'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['latitude', 'longitude']),
        ]

    def __str__(self):
        return f'{self.title}: {self.address}'


class MasterProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='master_profile',
        verbose_name=_('User')
    )
    categories = models.ManyToManyField(
        'categories.Category', related_name='masters',
        verbose_name=_('Categories')
    )
    experience = models.PositiveIntegerField(default=0, verbose_name=_('Experience (years)'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    rating = models.DecimalField(
        max_digits=3, decimal_places=2, default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_('Rating')
    )
    rating_count = models.PositiveIntegerField(default=0)
    completed_jobs = models.PositiveIntegerField(default=0)
    cancelled_jobs = models.PositiveIntegerField(default=0)
    response_time = models.PositiveIntegerField(default=0, help_text=_('Average response time in minutes'))
    completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=100.0)
    is_online = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    is_face_verified = models.BooleanField(default=False)
    price_per_hour = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    min_order_price = models.DecimalField(max_digits=12, decimal_places=2, default=50000)
    max_distance = models.PositiveIntegerField(default=50, help_text=_('Maximum travel distance in km'))
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_updated_at = models.DateTimeField(null=True, blank=True)
    working_from = models.TimeField(default='08:00')
    working_to = models.TimeField(default='20:00')
    working_days = models.CharField(
        max_length=50, default='1,2,3,4,5,6',
        help_text=_('Comma separated days (0=Sunday, 1=Monday...)')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Master Profile')
        verbose_name_plural = _('Master Profiles')
        db_table = 'master_profiles'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['rating']),
            models.Index(fields=['is_available']),
            models.Index(fields=['is_online']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['completed_jobs']),
        ]

    def __str__(self):
        return f'Master: {self.user.full_name}'


class MasterDocument(models.Model):
    class DocType(models.TextChoices):
        PASSPORT = 'passport', _('Passport')
        ID_CARD = 'id_card', _('ID Card')
        CERTIFICATE = 'certificate', _('Certificate')
        LICENSE = 'license', _('License')
        DIPLOMA = 'diploma', _('Diploma')
        OTHER = 'other', _('Other')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    master = models.ForeignKey(
        MasterProfile, on_delete=models.CASCADE, related_name='documents'
    )
    doc_type = models.CharField(max_length=20, choices=DocType.choices)
    file = models.FileField(upload_to='documents/')
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='verified_documents'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'master_documents'


class MasterPortfolio(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    master = models.ForeignKey(
        MasterProfile, on_delete=models.CASCADE, related_name='portfolio_items'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image = VersatileImageField(upload_to='portfolio/')
    category = models.ForeignKey('categories.Category', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'master_portfolio'
        ordering = ['-created_at']


class MasterSchedule(models.Model):
    master = models.ForeignKey(
        MasterProfile, on_delete=models.CASCADE, related_name='schedule'
    )
    date = models.DateField()
    is_available = models.BooleanField(default=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)

    class Meta:
        db_table = 'master_schedules'
        unique_together = ['master', 'date']


class UserFavorite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='favorites'
    )
    master = models.ForeignKey(
        MasterProfile, on_delete=models.CASCADE, related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_favorites'
        unique_together = ['user', 'master']
        ordering = ['-created_at']


class UserWallet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='wallet'
    )
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    hold_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_earned = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_withdrawn = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_wallets'


class Transaction(models.Model):
    class Type(models.TextChoices):
        DEPOSIT = 'deposit', _('Deposit')
        WITHDRAWAL = 'withdrawal', _('Withdrawal')
        PAYMENT = 'payment', _('Payment')
        REFUND = 'refund', _('Refund')
        COMMISSION = 'commission', _('Commission')
        BONUS = 'bonus', _('Bonus')

    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        PROCESSING = 'processing', _('Processing')
        COMPLETED = 'completed', _('Completed')
        FAILED = 'failed', _('Failed')
        CANCELLED = 'cancelled', _('Cancelled')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(
        UserWallet, on_delete=models.CASCADE, related_name='transactions'
    )
    type = models.CharField(max_length=20, choices=Type.choices)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    commission = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=15, decimal_places=2)
    description = models.TextField(blank=True)
    reference_id = models.CharField(max_length=255, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['wallet']),
            models.Index(fields=['type']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
