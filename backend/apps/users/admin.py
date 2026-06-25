from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from rangefilter.filters import DateRangeFilter, DateTimeRangeFilter
from import_export.admin import ImportExportModelAdmin
from .models import User, UserAddress, MasterProfile, MasterSchedule, MasterDocument, MasterPortfolio, UserFavorite, UserWallet, Transaction


@admin.register(User)
class UserAdmin(BaseUserAdmin, ImportExportModelAdmin):
    list_display = ['phone', 'full_name', 'role', 'status', 'is_phone_verified', 'created_at']
    list_filter = ['role', 'status', 'is_phone_verified', 'created_at', 'lang']
    search_fields = ['phone', 'full_name', 'email']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    list_per_page = 50
    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        (_('Personal info'), {'fields': ('full_name', 'avatar', 'bio', 'email', 'lang')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Verification'), {
            'fields': ('is_phone_verified', 'is_email_verified', 'is_identity_verified'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined', 'last_active')}),
    )


@admin.register(MasterProfile)
class MasterProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'rating', 'completed_jobs', 'is_online', 'is_verified', 'price_per_hour']
    list_filter = ['is_online', 'is_available', 'is_verified', 'created_at']
    search_fields = ['user__full_name', 'user__phone']
    filter_horizontal = ['categories']


@admin.register(UserAddress)
class UserAddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'address', 'is_default']
    list_filter = ['is_default']


@admin.register(UserWallet)
class UserWalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'balance', 'hold_balance', 'total_earned', 'total_withdrawn']
    search_fields = ['user__phone', 'user__full_name']


@admin.register(MasterSchedule)
class MasterScheduleAdmin(admin.ModelAdmin):
    list_display = ['master', 'date', 'is_available', 'start_time', 'end_time']
    list_filter = ['is_available', 'date']


@admin.register(MasterDocument)
class MasterDocumentAdmin(admin.ModelAdmin):
    list_display = ['master', 'doc_type', 'is_verified', 'created_at']
    list_filter = ['doc_type', 'is_verified']


@admin.register(MasterPortfolio)
class MasterPortfolioAdmin(admin.ModelAdmin):
    list_display = ['master', 'title', 'created_at']
    list_filter = ['created_at']


@admin.register(UserFavorite)
class UserFavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'master', 'created_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['wallet', 'type', 'amount', 'net_amount', 'status', 'created_at']
    list_filter = ['type', 'status', 'created_at']
    search_fields = ['reference_id', 'description']
    date_hierarchy = 'created_at'
