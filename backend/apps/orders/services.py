from django.db import transaction
from django.utils import timezone
from django.conf import settings
from .models import Order, OrderOffer, OrderStatusLog
from apps.payments.models import Payment
from apps.notifications.services import NotificationService


class OrderService:
    @staticmethod
    @transaction.atomic
    def create_offer(order, master, price, description='', estimated_duration=60):
        if order.status not in [Order.Status.PENDING, Order.Status.LOOKING_MASTER]:
            raise ValueError('Order is not accepting offers')
        offer, created = OrderOffer.objects.get_or_create(
            order=order,
            master=master,
            defaults={
                'price': price,
                'description': description,
                'estimated_duration': estimated_duration,
            }
        )
        if not created:
            offer.price = price
            offer.description = description
            offer.estimated_duration = estimated_duration
            offer.status = OrderOffer.Status.PENDING
            offer.save()
        if order.status == Order.Status.PENDING:
            order.status = Order.Status.LOOKING_MASTER
            order.save()
        NotificationService.send_push(
            user=order.customer,
            title='New Offer',
            body=f'You received an offer for {price} UZS',
            data={'order_id': str(order.id), 'type': 'new_offer'},
        )
        return offer

    @staticmethod
    @transaction.atomic
    def accept_offer(order, offer_id):
        try:
            offer = OrderOffer.objects.get(id=offer_id, order=order)
        except OrderOffer.DoesNotExist:
            raise ValueError('Offer not found')
        OrderOffer.objects.filter(order=order).exclude(id=offer_id).update(status=OrderOffer.Status.REJECTED)
        offer.status = OrderOffer.Status.ACCEPTED
        offer.save()
        order.master = offer.master
        order.final_price = offer.price
        order.status = Order.Status.ACCEPTED
        order.save()
        OrderStatusLog.objects.create(
            order=order,
            from_status='offered',
            to_status='accepted',
            changed_by=order.customer,
        )
        Payment.objects.create(
            order=order,
            customer=order.customer,
            master=order.master.user,
            amount=order.final_price,
            commission_percent=settings.CONSTANCE_CONFIG['PLATFORM_COMMISSION'][0],
        )
        NotificationService.send_push(
            user=offer.master.user,
            title='Offer Accepted',
            body=f'Your offer for {order.title} was accepted',
            data={'order_id': str(order.id), 'type': 'offer_accepted'},
        )
        return order

    @staticmethod
    @transaction.atomic
    def start_work(order):
        if order.status != Order.Status.ACCEPTED:
            raise ValueError('Order must be accepted first')
        order.status = Order.Status.IN_PROGRESS
        order.started_at = timezone.now()
        order.save()
        OrderStatusLog.objects.create(
            order=order,
            from_status='accepted',
            to_status='in_progress',
        )
        NotificationService.send_push(
            user=order.customer,
            title='Work Started',
            body=f'{order.master.user.full_name} started working on your order',
            data={'order_id': str(order.id), 'type': 'work_started'},
        )
        return order

    @staticmethod
    @transaction.atomic
    def complete_work(order):
        if order.status != Order.Status.IN_PROGRESS:
            raise ValueError('Order must be in progress')
        order.status = Order.Status.COMPLETED
        order.completed_at = timezone.now()
        order.save()
        OrderStatusLog.objects.create(
            order=order,
            from_status='in_progress',
            to_status='completed',
        )
        Payment.objects.filter(order=order).update(status='completed')
        from apps.users.services import WalletService
        wallet = WalletService.get_balance(order.master.user)
        commission_amount = float(order.final_price) * (order.commission / 100)
        net_amount = float(order.final_price) - commission_amount
        WalletService.add_funds(
            order.master.user, net_amount, 'escrow',
            reference=str(order.id)
        )
        WalletService.release_funds(order.customer, float(order.final_price))
        NotificationService.send_push(
            user=order.customer,
            title='Order Completed',
            body='Please confirm completion and leave a review',
            data={'order_id': str(order.id), 'type': 'order_completed'},
        )
        return order

    @staticmethod
    @transaction.atomic
    def confirm_completion(order):
        order.is_paid = True
        order.save()
        return order

    @staticmethod
    @transaction.atomic
    def cancel_order(order, user, reason=''):
        allowed = False
        if user == order.customer and order.status in ['pending', 'looking_master', 'offered', 'accepted']:
            allowed = True
        elif hasattr(user, 'master_profile') and order.master and order.master.user == user:
            if order.status in ['accepted', 'in_progress']:
                allowed = True
        elif user.is_staff:
            allowed = True
        if not allowed:
            raise ValueError('Cannot cancel order in current state')
        old_status = order.status
        order.status = Order.Status.CANCELLED
        order.cancelled_at = timezone.now()
        order.cancel_reason = reason
        order.save()
        OrderStatusLog.objects.create(
            order=order,
            from_status=old_status,
            to_status='cancelled',
            changed_by=user,
            note=reason,
        )
        if order.master:
            order.master.cancelled_jobs += 1
            order.master.save()
        NotificationService.send_push(
            user=order.customer if user != order.customer else (order.master.user if order.master else None),
            title='Order Cancelled',
            body=f'Order {order.title} was cancelled',
            data={'order_id': str(order.id), 'type': 'order_cancelled'},
        )
        return order
