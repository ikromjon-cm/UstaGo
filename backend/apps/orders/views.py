from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_tags

from .models import Order, OrderOffer, OrderStatusLog
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderOfferSerializer, OrderStatusLogSerializer,
)
from .services import OrderService
from config.permissions import IsCustomer, IsMaster


@extend_tags(['Orders'])
class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'urgency', 'is_paid']
    search_fields = ['title', 'description', 'address']
    ordering_fields = ['created_at', 'budget', 'preferred_date']

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'customer':
            return Order.objects.filter(customer=user).prefetch_related(
                'images', 'videos', 'offers__master__user'
            ).select_related('category', 'master__user')
        elif user.role == 'master':
            return Order.objects.filter(
                master__user=user
            ) | Order.objects.filter(
                status__in=['pending', 'looking_master', 'offered']
            ).prefetch_related('images', 'videos').select_related('customer', 'category')
        return Order.objects.all().prefetch_related('images', 'videos')

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsMaster])
    def make_offer(self, request, pk=None):
        order = self.get_object()
        serializer = OrderOfferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offer = OrderService.create_offer(
            order=order,
            master=request.user.master_profile,
            price=serializer.validated_data['price'],
            description=serializer.validated_data.get('description', ''),
            estimated_duration=serializer.validated_data.get('estimated_duration', 60),
        )
        return Response(OrderOfferSerializer(offer).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def accept_offer(self, request, pk=None):
        offer_id = request.data.get('offer_id')
        if not offer_id:
            return Response({'error': 'offer_id required'}, status=400)
        order = OrderService.accept_offer(order=self.get_object(), offer_id=offer_id)
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsMaster])
    def start_work(self, request, pk=None):
        order = OrderService.start_work(self.get_object())
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsMaster])
    def complete_work(self, request, pk=None):
        order = OrderService.complete_work(self.get_object())
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        reason = request.data.get('reason', '')
        order = OrderService.cancel_order(self.get_object(), request.user, reason)
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'])
    def confirm_completion(self, request, pk=None):
        order = OrderService.confirm_completion(self.get_object())
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['get'])
    def status_history(self, request, pk=None):
        logs = OrderStatusLog.objects.filter(order=self.get_object())
        serializer = OrderStatusLogSerializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def track(self, request, pk=None):
        order = self.get_object()
        return Response({
            'id': order.id,
            'status': order.status,
            'status_display': order.get_status_display(),
            'master_location': {
                'lat': float(order.master.latitude) if order.master and order.master.latitude else None,
                'lng': float(order.master.longitude) if order.master and order.master.longitude else None,
            } if order.master else None,
            'customer_location': {
                'lat': float(order.latitude),
                'lng': float(order.longitude),
            },
            'started_at': order.started_at,
            'completed_at': order.completed_at,
        })

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        if request.user.role == 'customer':
            orders = Order.objects.filter(customer=request.user)
        elif request.user.role == 'master':
            orders = Order.objects.filter(master__user=request.user)
        else:
            orders = Order.objects.all()
        orders = orders.order_by('-created_at')
        page = self.paginate_queryset(orders)
        serializer = OrderSerializer(page if page else orders, many=True)
        if page:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def active(self, request):
        active_statuses = ['accepted', 'in_progress', 'offered']
        if request.user.role == 'customer':
            orders = Order.objects.filter(customer=request.user, status__in=active_statuses)
        elif request.user.role == 'master':
            orders = Order.objects.filter(master__user=request.user, status__in=active_statuses)
        else:
            orders = Order.objects.filter(status__in=active_statuses)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
