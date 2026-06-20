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
    readonly_fields = ['created_at', 'updated_at', 'deleted_at', 'last_active', 'otp_secret', 'two_factor_secret']
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
    actions = ['activate_users', 'deactivate_users', 'ban_users']

    def activate_users(self, request, queryset):
        queryset.update(status=User.Status.ACTIVE)
    activate_users.short_description = _("Activate selected users")

    def deactivate_users(self, request, queryset):
        queryset.update(status=User.Status.INACTIVE)
    deactivate_users.short_description = _("Deactivate selected users")

    def ban_users(self, request, queryset):
        queryset.update(status=User.Status.BANNED)
    ban_users.short_description = _("Ban selected users")


@admin.register(MasterProfile)
class MasterProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'rating', 'rating_count', 'completed_jobs', 'is_online', 'is_verified', 'price_per_hour']
    list_filter = ['is_online', 'is_available', 'is_verified', 'is_face_verified', 'created_at']
    search_fields = ['user__full_name', 'user__phone', 'description']
    readonly_fields = ['rating', 'rating_count', 'completed_jobs', 'cancelled_jobs', 'created_at', 'updated_at', 'response_time', 'completion_rate']
    filter_horizontal = ['categories']
    actions = ['verify_masters', 'unverify_masters']

    def verify_masters(self, request, queryset):
        queryset.update(is_verified=True)
    verify_masters.short_description = _("Verify selected masters")

    def unverify_masters(self, request, queryset):
        queryset.update(is_verified=False)
    unverify_masters.short_description = _("Unverify selected masters")


@admin.register(UserAddress)
class UserAddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'address', 'is_default', 'is_active', 'created_at']
    list_filter = ['is_default', 'is_active']
    search_fields = ['user__full_name', 'user__phone', 'title', 'address']
    readonly_fields = ['created_at']


@admin.register(UserWallet)
class UserWalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'balance', 'hold_balance', 'total_earned', 'total_withdrawn', 'created_at']
    search_fields = ['user__phone', 'user__full_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(MasterSchedule)
class MasterScheduleAdmin(admin.ModelAdmin):
    list_display = ['master', 'date', 'is_available', 'start_time', 'end_time']
    list_filter = ['is_available', 'date']
    search_fields = ['master__user__full_name', 'master__user__phone']
    date_hierarchy = 'date'


@admin.register(MasterDocument)
class MasterDocumentAdmin(admin.ModelAdmin):
    list_display = ['master', 'doc_type', 'is_verified', 'verified_by', 'created_at']
    list_filter = ['doc_type', 'is_verified']
    search_fields = ['master__user__full_name', 'master__user__phone']
    readonly_fields = ['created_at', 'verified_at', 'verified_by']
    actions = ['approve_documents', 'reject_documents']

    def approve_documents(self, request, queryset):
        queryset.update(is_verified=True, verified_by=request.user, verified_at=admin.utils.timezone.now())
    approve_documents.short_description = _("Approve selected documents")

    def reject_documents(self, request, queryset):
        queryset.update(is_verified=False)
    reject_documents.short_description = _("Reject selected documents")


@admin.register(MasterPortfolio)
class MasterPortfolioAdmin(admin.ModelAdmin):
    list_display = ['master', 'title', 'category', 'created_at']
    list_filter = ['created_at', 'category']
    search_fields = ['master__user__full_name', 'title']
    readonly_fields = ['created_at']


@admin.register(UserFavorite)
class UserFavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'master', 'created_at']
    search_fields = ['user__full_name', 'master__user__full_name']
    readonly_fields = ['created_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['wallet', 'type', 'amount', 'net_amount', 'commission', 'status', 'created_at']
    list_filter = ['type', 'status', 'created_at']
    search_fields = ['reference_id', 'description', 'wallet__user__phone']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    actions = ['mark_as_completed', 'mark_as_failed']

    def mark_as_completed(self, request, queryset):
        queryset.update(status=Transaction.Status.COMPLETED)
    mark_as_completed.short_description = _("Mark selected as completed")

    def mark_as_failed(self, request, queryset):
        queryset.update(status=Transaction.Status.FAILED)
    mark_as_failed.short_description = _("Mark selected as failed")
