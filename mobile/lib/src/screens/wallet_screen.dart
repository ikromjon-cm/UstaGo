import 'package:flutter/material.dart';

import '../models/wallet.dart';
import '../services/wallet_service.dart';
import '../utils/theme.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  WalletOverview? _overview;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final overview = await WalletService.getOverview();
      if (!mounted) return;
      setState(() {
        _overview = overview;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load wallet: $e')),
      );
    }
  }

  String _formatMoney(double value) => '${value.toStringAsFixed(0)} UZS';

  String _formatDate(String value) {
    if (value.isEmpty) return '—';
    final parsed = DateTime.tryParse(value);
    if (parsed == null) return value;
    return '${parsed.day.toString().padLeft(2, '0')}.${parsed.month.toString().padLeft(2, '0')}.${parsed.year}';
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'completed':
        return Colors.green;
      case 'processing':
      case 'pending':
        return Colors.orange;
      case 'failed':
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _transactionTitle(WalletTransaction transaction) {
    if (transaction.description.isNotEmpty) return transaction.description;
    switch (transaction.type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'payment':
        return 'Service payment';
      case 'refund':
        return 'Refund';
      case 'commission':
        return 'Platform commission';
      case 'bonus':
        return 'Bonus';
      default:
        return 'Transaction';
    }
  }

  @override
  Widget build(BuildContext context) {
    final overview = _overview;
    final wallet = overview?.wallet;
    final transactions = overview?.transactions ?? const <WalletTransaction>[];

    return Scaffold(
      appBar: AppBar(title: const Text('Wallet')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppTheme.primary, Color(0xFF1D4ED8)],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.account_balance_wallet, color: Colors.white70, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Available Balance',
                              style: TextStyle(color: Colors.white70, fontSize: 13),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _formatMoney(wallet?.balance ?? 0),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 30,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Track escrow, payouts, and transaction history in one place.',
                          style: TextStyle(color: Colors.white.withValues(alpha: 0.85)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _MetricCard(
                          title: 'On Hold',
                          value: _formatMoney(wallet?.holdBalance ?? 0),
                          icon: Icons.lock_outline,
                          color: Colors.orange,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _MetricCard(
                          title: 'Total Earned',
                          value: _formatMoney(wallet?.totalEarned ?? 0),
                          icon: Icons.trending_up,
                          color: Colors.green,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _MetricCard(
                    title: 'Total Withdrawn',
                    value: _formatMoney(wallet?.totalWithdrawn ?? 0),
                    icon: Icons.outbox_outlined,
                    color: AppTheme.primary,
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Transaction History',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      if (transactions.isNotEmpty)
                        Text(
                          '${transactions.length} entries',
                          style: TextStyle(color: Colors.grey.shade600),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (transactions.isEmpty)
                    const _EmptyWalletState()
                  else
                    ...transactions.map(
                      (transaction) => Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: (transaction.isCredit ? Colors.green : Colors.red)
                                .withValues(alpha: 0.12),
                            child: Icon(
                              transaction.isCredit
                                  ? Icons.arrow_downward
                                  : Icons.arrow_upward,
                              color: transaction.isCredit ? Colors.green : Colors.red,
                              size: 18,
                            ),
                          ),
                          title: Text(
                            _transactionTitle(transaction),
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              Text(_formatDate(transaction.createdAt)),
                              if (transaction.paymentMethod.isNotEmpty)
                                Text('Method: ${transaction.paymentMethod}'),
                            ],
                          ),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '${transaction.isCredit ? '+' : '-'}${_formatMoney(transaction.amount)}',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: transaction.isCredit ? Colors.green : Colors.red,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: _statusColor(transaction.status).withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(
                                  transaction.status,
                                  style: TextStyle(
                                    color: _statusColor(transaction.status),
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(title, style: TextStyle(color: Colors.grey.shade600)),
        ],
      ),
    );
  }
}

class _EmptyWalletState extends StatelessWidget {
  const _EmptyWalletState();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Icon(Icons.receipt_long, size: 42, color: Colors.grey.shade400),
          const SizedBox(height: 12),
          const Text(
            'No transactions yet',
            style: TextStyle(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Text(
            'Completed payments, refunds, and withdrawals will appear here.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }
}
