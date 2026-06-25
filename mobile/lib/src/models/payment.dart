class PaymentRecord {
  final String id;
  final String orderId;
  final double amount;
  final double commissionAmount;
  final double netAmount;
  final String status;
  final String method;
  final String paymentUrl;
  final String createdAt;

  PaymentRecord({
    required this.id,
    required this.orderId,
    required this.amount,
    required this.commissionAmount,
    required this.netAmount,
    required this.status,
    required this.method,
    required this.paymentUrl,
    required this.createdAt,
  });

  factory PaymentRecord.fromJson(Map<String, dynamic> json) => PaymentRecord(
        id: json['id'] as String,
        orderId: json['order'] as String,
        amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0,
        commissionAmount: double.tryParse(json['commission_amount']?.toString() ?? '0') ?? 0,
        netAmount: double.tryParse(json['net_amount']?.toString() ?? '0') ?? 0,
        status: (json['status'] ?? 'pending') as String,
        method: (json['method'] ?? 'wallet') as String,
        paymentUrl: (json['payment_url'] ?? '') as String,
        createdAt: (json['created_at'] ?? '') as String,
      );
}
