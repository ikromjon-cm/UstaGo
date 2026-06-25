from django.contrib import admin
from .models import Review, ReviewImage


class ReviewImageInline(admin.TabularInline):
    model = ReviewImage
    extra = 1


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['reviewer', 'target_user', 'order', 'rating', 'is_reported', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_reported', 'is_approved', 'created_at']
    search_fields = ['reviewer__full_name', 'target_user__full_name', 'comment']
    inlines = [ReviewImageInline]
    actions = ['approve_reviews', 'reject_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "Approve selected reviews"

    def reject_reviews(self, request, queryset):
        queryset.update(is_approved=False)
    reject_reviews.short_description = "Reject selected reviews"
