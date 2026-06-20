import 'package:flutter/material.dart';
import '../services/order_service.dart';
import '../models/order.dart';

class OrderDetailScreen extends StatefulWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});
  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  Order? _order;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final order = await OrderService.getOrder(widget.orderId);
      setState(() { _order = order; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'completed': return Colors.green;
      case 'in_progress': return Colors.blue;
      case 'cancelled': return Colors.red;
      case 'pending': return Colors.orange;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_order == null) return const Scaffold(body: Center(child: Text('Order not found')));
    final o = _order!;
    return Scaffold(
      appBar: AppBar(title: Text(o.title)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Chip(label: Text(o.status.replaceAll('_', ' ')), backgroundColor: _statusColor(o.status).withOpacity(0.2)),
              const Spacer(),
              Text('${o.budget.toStringAsFixed(0)} UZS', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ]),
            const SizedBox(height: 16),
            Text(o.description, style: const TextStyle(fontSize: 15)),
            const SizedBox(height: 16),
            Text('📍 ${o.address}', style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 8),
            Text('📅 ${o.createdAt}', style: const TextStyle(color: Colors.grey)),
            const Spacer(),
            if (o.status == 'pending' || o.status == 'looking_master')
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => OrderService.cancelOrder(o.id),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red, padding: const EdgeInsets.symmetric(vertical: 16)),
                  child: const Text('Cancel Order', style: TextStyle(color: Colors.white)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
