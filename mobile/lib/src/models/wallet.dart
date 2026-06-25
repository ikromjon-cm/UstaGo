class WalletRecord {
  final String id;
  final double balance;
  final double holdBalance;
  final double totalEarned;
  final double totalWithdrawn;

  const WalletRecord({
    required this.id,
    required this.balance,
    required this.holdBalance,
    required this.totalEarned,
    required this.totalWithdrawn,
  });

  factory WalletRecord.fromJson(Map<String, dynamic> json) => WalletRecord(
        id: (json['id'] ?? '') as String,
        balance: double.tryParse(json['balance']?.toString() ?? '0') ?? 0,
        holdBalance: double.tryParse(json['hold_balance']?.toString() ?? '0') ?? 0,
        totalEarned: double.tryParse(json['total_earned']?.toString() ?? '0') ?? 0,
        totalWithdrawn: double.tryParse(json['total_withdrawn']?.toString() ?? '0') ?? 0,
      );
}

class WalletTransaction {
  final String id;
  final String type;
  final String status;
  final double amount;
  final double commission;
  final double netAmount;
  final String description;
  final String paymentMethod;
  final String createdAt;

  const WalletTransaction({
    required this.id,
    required this.type,
    required this.status,
    required this.amount,
    required this.commission,
    required this.netAmount,
    required this.description,
    required this.paymentMethod,
    required this.createdAt,
  });

  factory WalletTransaction.fromJson(Map<String, dynamic> json) => WalletTransaction(
        id: (json['id'] ?? '') as String,
        type: (json['type'] ?? 'payment') as String,
        status: (json['status'] ?? 'pending') as String,
        amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0,
        commission: double.tryParse(json['commission']?.toString() ?? '0') ?? 0,
        netAmount: double.tryParse(json['net_amount']?.toString() ?? '0') ?? 0,
        description: (json['description'] ?? '') as String,
        paymentMethod: (json['payment_method'] ?? '') as String,
        createdAt: (json['created_at'] ?? '') as String,
      );

  bool get isCredit =>
      type == 'deposit' || type == 'refund' || type == 'bonus';
}

class WalletOverview {
  final WalletRecord wallet;
  final List<WalletTransaction> transactions;

  const WalletOverview({
    required this.wallet,
    required this.transactions,
  });
}
