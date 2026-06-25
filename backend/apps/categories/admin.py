from django.contrib import admin
from mptt.admin import MPTTModelAdmin, DraggableMPTTAdmin
from import_export.admin import ImportExportModelAdmin
from .models import Category, Service


@admin.register(Category)
class CategoryAdmin(DraggableMPTTAdmin, ImportExportModelAdmin):
    list_display = ['tree_actions', 'indented_title', 'is_active', 'is_featured', 'sort_order']
    list_filter = ['is_active', 'is_featured']
    search_fields = ['title_uz', 'title_ru', 'title_en']
    list_editable = ['sort_order']


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['title_uz', 'category', 'price_from', 'price_to', 'duration_minutes', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['title_uz', 'title_ru']
