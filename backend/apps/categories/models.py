import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from mptt.models import MPTTModel, TreeForeignKey
from versatileimagefield.fields import VersatileImageField


class Category(MPTTModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title_uz = models.CharField(max_length=255, verbose_name=_('Title (Uzbek)'))
    title_ru = models.CharField(max_length=255, blank=True, verbose_name=_('Title (Russian)'))
    title_en = models.CharField(max_length=255, blank=True, verbose_name=_('Title (English)'))
    description = models.TextField(blank=True)
    icon = VersatileImageField(upload_to='categories/icons/', blank=True, null=True)
    image = VersatileImageField(upload_to='categories/images/', blank=True, null=True)
    parent = TreeForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        related_name='children', verbose_name=_('Parent Category')
    )
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    commission_percent = models.DecimalField(max_digits=5, decimal_places=2, default=10.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class MPTTMeta:
        order_insertion_by = ['sort_order', 'title_uz']

    class Meta:
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')
        db_table = 'categories'
        ordering = ['sort_order']

    def __str__(self):
        return self.title_uz

    @property
    def title(self):
        return self.title_uz


class Service(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name='services'
    )
    title_uz = models.CharField(max_length=255)
    title_ru = models.CharField(max_length=255, blank=True)
    title_en = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    price_from = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    price_to = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    duration_minutes = models.PositiveIntegerField(default=60)
    icon = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'services'
        ordering = ['sort_order']

    def __str__(self):
        return self.title_uz
