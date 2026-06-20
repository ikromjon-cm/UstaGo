import 'package:flutter/material.dart';
import '../models/order.dart';

class OrderCard extends StatelessWidget {
  final Order order;
  const OrderCard({super.key, required this.order});

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
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => Navigator.pushNamed(context, '/order/${order.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(child: Text(order.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold))),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: _statusColor(order.status).withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                    child: Text(order.status.replaceAll('_', ' '), style: TextStyle(fontSize: 12, color: _statusColor(order.status))),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(order.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.grey)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Text('${order.budget.toStringAsFixed(0)} UZS', style: TextStyle(fontWeight: FontWeight.bold, color: Theme.of(context).primaryColor)),
                  const Spacer(),
                  Text(order.createdAt, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
