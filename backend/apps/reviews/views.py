from django.utils.timezone import now
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from compat import extend_tags

from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer
from apps.orders.models import Order


@extend_tags(['Reviews'])
class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Review.objects.all()
        return Review.objects.filter(reviewer=user) | Review.objects.filter(target_user=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer

    def create(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({'error': 'order_id required'}, status=400)
        try:
            order = Order.objects.get(id=order_id, customer=request.user, status='completed')
        except Order.DoesNotExist:
            return Response({'error': 'Completed order not found'}, status=404)
        if hasattr(order, 'review'):
            return Response({'error': 'Already reviewed'}, status=400)
        serializer = self.get_serializer(data=request.data)
        serializer.context['order'] = order
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        order.is_rated = True
        order.save()
        resp_serializer = ReviewSerializer(review)
        return Response(resp_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        reviews = Review.objects.filter(target_user=request.user).order_by('-created_at')
        page = self.paginate_queryset(reviews)
        serializer = ReviewSerializer(page if page else reviews, many=True)
        if page:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def report(self, request, pk=None):
        review = self.get_object()
        reason = request.data.get('reason', '')
        review.is_reported = True
        review.report_reason = reason
        review.save()
        return Response({'success': True})

    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        review = self.get_object()
        if review.target_user != request.user:
            return Response({'error': 'Only the reviewed user can respond'}, status=403)
        response_text = request.data.get('response', '')
        review.response = response_text
        review.responded_at = now()
        review.save()
        return Response(ReviewSerializer(review).data)

    @action(detail=False, methods=['get'])
    def for_master(self, request):
        master_id = request.query_params.get('master_id')
        if not master_id:
            return Response({'error': 'master_id required'}, status=400)
        reviews = Review.objects.filter(
            target_user__master_profile__id=master_id,
            is_approved=True,
        ).order_by('-created_at')
        page = self.paginate_queryset(reviews)
        serializer = ReviewSerializer(page if page else reviews, many=True)
        if page:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)
