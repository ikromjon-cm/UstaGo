import 'package:flutter/material.dart';
import '../services/api_client.dart';
import '../utils/theme.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class PaymentScreen extends StatefulWidget {
  final String orderId;
  const PaymentScreen({super.key, required this.orderId});
  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  Map<String, dynamic>? _order;
  String? _selectedMethod;
  bool _processing = false;

  final _methods = [
    {'id': 'payme', 'label': 'Payme', 'icon': Icons.phone_android, 'color': const Color(0xFF22C55E)},
    {'id': 'click', 'label': 'Click', 'icon': Icons.account_balance, 'color': const Color(0xFF2563EB)},
    {'id': 'uzum', 'label': 'Uzum Bank', 'icon': Icons.account_balance, 'color': const Color(0xFF7C3AED)},
    {'id': 'cash', 'label': 'Naqd pul', 'icon': Icons.money, 'color': const Color(0xFFF59E0B)},
    {'id': 'card', 'label': 'Visa / Mastercard', 'icon': Icons.credit_card, 'color': const Color(0xFFEF4444)},
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await ApiClient.get('/orders/${widget.orderId}/');
      setState(() => _order = data);
    } catch (_) {}
  }

  Future<void> _pay() async {
    if (_selectedMethod == null) return;
    setState(() => _processing = true);
    try {
      await ApiClient.post('/payments/${widget.orderId}/pay/', body: {'method': _selectedMethod});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("To'lov muvaffaqiyatli!")));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Xatolik: $e")));
      }
    } finally {
      if (mounted) setState(() => _processing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final amount = _order != null ? (_order!['final_price'] ?? _order!['budget'] ?? 0).toString() : '0';
    return Scaffold(
      appBar: AppBar(title: const Text("To'lov")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Text(_order?['title'] ?? 'Buyurtma', style: const TextStyle(color: Colors.grey)),
                    const SizedBox(height: 8),
                    Text('$amount UZS', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text("To'lov usulini tanlang", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.separated(
                itemCount: _methods.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (_, i) {
                  final m = _methods[i];
                  final selected = _selectedMethod == m['id'];
                  return GestureDetector(
                    onTap: () => setState(() => _selectedMethod = m['id'] as String),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: selected ? AppTheme.primary : const Color(0xFFE2E8F0), width: selected ? 2 : 1),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 48, height: 48,
                            decoration: BoxDecoration(color: (m['color'] as Color).withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                            child: Icon(m['icon'] as IconData, color: m['color'] as Color),
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: Text(m['label'] as String, style: const TextStyle(fontWeight: FontWeight.w500))),
                          if (selected) const Icon(Icons.check_circle, color: AppTheme.primary),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: (_selectedMethod == null || _processing) ? null : _pay,
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, padding: const EdgeInsets.symmetric(vertical: 16)),
                child: _processing
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text("To'lash: $amount UZS", style: const TextStyle(color: Colors.white, fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
