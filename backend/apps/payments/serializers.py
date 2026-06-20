from rest_framework import serializers
from .models import Payment, Payout


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = [
            'id', 'order', 'customer', 'status', 'commission_amount',
            'net_amount', 'paid_at', 'refunded_at', 'created_at',
        ]


class PaymentCreateSerializer(serializers.Serializer):
    method = serializers.ChoiceField(choices=['payme', 'click', 'uzum', 'visa', 'mastercard', 'wallet'])
    card_number = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)


class PayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payout
        fields = '__all__'
        read_only_fields = ['id', 'user', 'status', 'processed_at', 'created_at']


class PaymentVerifySerializer(serializers.Serializer):
    transaction_id = serializers.CharField()
    status = serializers.CharField()
