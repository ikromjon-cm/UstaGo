from compat import extend_tags
from config.permissions import IsCustomer, IsMaster
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Payment, Payout
from .serializers import PaymentCreateSerializer, PaymentSerializer, PayoutSerializer
from .services import PaymentService


@extend_tags(["Payments"])
class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            queryset = Payment.objects.all()
        else:
            queryset = Payment.objects.filter(customer=user) | Payment.objects.filter(
                master=user
            )

        order_id = self.request.query_params.get("order")
        if order_id:
            queryset = queryset.filter(order_id=order_id)

        return queryset.distinct().order_by("-created_at")

    @action(detail=True, methods=["post"])
    def pay(self, request, pk=None):
        payment = self.get_object()
        serializer = PaymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = PaymentService.create_payment(
            payment.order,
            method=serializer.validated_data["method"],
            payment=payment,
        )
        return Response(PaymentSerializer(payment).data)

    @action(detail=True, methods=["post"])
    def release(self, request, pk=None):
        payment = PaymentService.release_payment(pk)
        if not payment:
            return Response({"error": "Payment not found"}, status=404)
        return Response(PaymentSerializer(payment).data)

    @action(detail=True, methods=["post"])
    def refund(self, request, pk=None):
        payment = PaymentService.refund_payment(pk)
        if not payment:
            return Response({"error": "Payment not found"}, status=404)
        return Response(PaymentSerializer(payment).data)

    @action(detail=True, methods=["post"])
    def dispute(self, request, pk=None):
        reason = request.data.get("reason", "No reason provided")
        payment = PaymentService.dispute_payment(pk, reason)
        if not payment:
            return Response({"error": "Payment not found"}, status=404)
        return Response(PaymentSerializer(payment).data)

    @action(detail=False, methods=["post"])
    def webhook(self, request):
        method = request.data.get("method")
        transaction_id = request.data.get("transaction_id")
        status = request.data.get("status")
        payment_id = request.data.get("payment_id")
        if not all([method, transaction_id, status, payment_id]):
            return Response({"error": "Missing fields"}, status=400)
        payment = PaymentService.verify_payment(payment_id, transaction_id, status)
        if not payment:
            return Response({"error": "Payment not found"}, status=404)
        return Response({"success": True})


class PayoutViewSet(viewsets.ModelViewSet):
    serializer_class = PayoutSerializer
    permission_classes = [IsMaster]

    def get_queryset(self):
        return Payout.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        from apps.users.services import WalletService

        amount = serializer.validated_data.get("amount")
        method = serializer.validated_data.get("method", "bank")
        wallet = WalletService.withdraw(self.request.user, amount, method)
        serializer.save(user=self.request.user, status="pending")
