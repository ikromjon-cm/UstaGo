from django.db.models import Count, Q
from .models import Category, Service


class CategoryService:
    @staticmethod
    def get_tree(active_only=True):
        qs = Category.objects.all()
        if active_only:
            qs = qs.filter(is_active=True)
        return qs

    @staticmethod
    def get_featured_categories():
        return Category.objects.filter(is_featured=True, is_active=True).annotate(
            service_count=Count('services', filter=Q(services__is_active=True))
        ).order_by('sort_order')

    @staticmethod
    def get_services(category_id=None, master_id=None):
        qs = Service.objects.filter(is_active=True)
        if category_id:
            qs = qs.filter(category_id=category_id)
        if master_id:
            qs = qs.filter(masters__id=master_id)
        return qs.select_related('category')
