import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from compat import VersatileImageField


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(
        'orders.Order', on_delete=models.CASCADE, related_name='review'
    )
    reviewer = models.ForeignKey(
        'users.User', on_delete=models.CASCADE, related_name='reviews_given'
    )
    target_user = models.ForeignKey(
        'users.User', on_delete=models.CASCADE, related_name='reviews_received'
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_('Rating')
    )
    quality = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=5, verbose_name=_('Quality')
    )
    speed = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=5, verbose_name=_('Speed')
    )
    communication = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=5, verbose_name=_('Communication')
    )
    professionalism = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=5, verbose_name=_('Professionalism')
    )
    comment = models.TextField(blank=True, verbose_name=_('Comment'))
    response = models.TextField(blank=True, verbose_name=_('Response'))
    responded_at = models.DateTimeField(null=True, blank=True)
    is_reported = models.BooleanField(default=False)
    report_reason = models.TextField(blank=True)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Review')
        verbose_name_plural = _('Reviews')
        db_table = 'reviews'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['target_user']),
            models.Index(fields=['rating']),
            models.Index(fields=['reviewer']),
        ]

    def __str__(self):
        return f'Review by {self.reviewer.full_name}: {self.rating}/5'


class ReviewImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    review = models.ForeignKey(
        Review, on_delete=models.CASCADE, related_name='images'
    )
    image = VersatileImageField(upload_to='reviews/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'review_images'
