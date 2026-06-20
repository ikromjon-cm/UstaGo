from django.db.models import Avg
from .models import Review
from apps.users.models import MasterProfile


class ReviewService:
    @staticmethod
    def update_master_rating(master_profile):
        stats = Review.objects.filter(
            target_user=master_profile.user,
            is_approved=True,
        ).aggregate(
            avg_rating=Avg('rating'),
            avg_quality=Avg('quality'),
            avg_speed=Avg('speed'),
            avg_communication=Avg('communication'),
            avg_professionalism=Avg('professionalism'),
        )
        rating = stats['avg_rating'] or 0
        master_profile.rating = round(rating, 2)
        master_profile.rating_count = Review.objects.filter(
            target_user=master_profile.user,
            is_approved=True,
        ).count()
        master_profile.save(update_fields=['rating', 'rating_count'])
