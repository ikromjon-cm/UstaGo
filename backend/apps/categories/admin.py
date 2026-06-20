from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from mptt.admin import DraggableMPTTAdmin
from import_export.admin import ImportExportModelAdmin
from .models import Category, Service


@admin.register(Category)
class CategoryAdmin(DraggableMPTTAdmin, ImportExportModelAdmin):
    list_display = ['tree_actions', 'indented_title', 'is_active', 'is_featured', 'sort_order', 'commission_percent']
    list_filter = ['is_active', 'is_featured']
    search_fields = ['title_uz', 'title_ru', 'title_en']
    list_editable = ['sort_order']
    readonly_fields = ['created_at', 'updated_at']
    actions = ['activate_categories', 'deactivate_categories']

    def activate_categories(self, request, queryset):
        queryset.update(is_active=True)
    activate_categories.short_description = _("Activate selected categories")

    def deactivate_categories(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_categories.short_description = _("Deactivate selected categories")


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['title_uz', 'category', 'price_from', 'price_to', 'duration_minutes', 'sort_order', 'is_active']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['title_uz', 'title_ru', 'title_en']
    list_editable = ['sort_order']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    list_per_page = 50
    actions = ['activate_services', 'deactivate_services']

    def activate_services(self, request, queryset):
        queryset.update(is_active=True)
    activate_services.short_description = _("Activate selected services")

    def deactivate_services(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_services.short_description = _("Deactivate selected services")
