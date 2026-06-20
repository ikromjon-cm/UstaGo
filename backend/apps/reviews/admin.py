from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Review, ReviewImage


class ReviewImageInline(admin.TabularInline):
    model = ReviewImage
    extra = 1
    readonly_fields = ['created_at']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['reviewer', 'target_user', 'order', 'rating', 'quality', 'speed', 'is_reported', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_reported', 'is_approved', 'created_at']
    search_fields = ['reviewer__full_name', 'target_user__full_name', 'comment']
    readonly_fields = ['created_at']
    inlines = [ReviewImageInline]
    date_hierarchy = 'created_at'
    actions = ['approve_reviews', 'reject_reviews', 'report_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True, is_reported=False)
    approve_reviews.short_description = _("Approve selected reviews")

    def reject_reviews(self, request, queryset):
        queryset.update(is_approved=False)
    reject_reviews.short_description = _("Reject selected reviews")

    def report_reviews(self, request, queryset):
        queryset.update(is_reported=True)
    report_reviews.short_description = _("Report selected reviews")
