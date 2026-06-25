import 'package:flutter/material.dart';
import '../models/notification.dart';

class NotificationCard extends StatelessWidget {
  final AppNotification notification;
  const NotificationCard({super.key, required this.notification});

  IconData _typeIcon(String type) {
    switch (type) {
      case 'order': return Icons.shopping_bag;
      case 'payment': return Icons.payment;
      case 'chat': return Icons.chat;
      case 'promo': return Icons.local_offer;
      default: return Icons.notifications;
    }
  }

  void _onTap(BuildContext context) {
    final data = notification.data;
    switch (notification.type) {
      case 'order':
        final orderId = data['order_id'] ?? data['id'];
        if (orderId != null) Navigator.pushNamed(context, '/order/$orderId');
        break;
      case 'chat':
        final roomId = data['room_id'] ?? data['chat_room_id'];
        if (roomId != null) Navigator.pushNamed(context, '/chat/$roomId');
        break;
      case 'payment':
        final paymentId = data['payment_id'] ?? data['id'];
        if (paymentId != null) Navigator.pushNamed(context, '/dispute/$paymentId');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        onTap: () => _onTap(context),
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).primaryColor.withValues(alpha: 0.2),
          child: Icon(_typeIcon(notification.type), color: Theme.of(context).primaryColor),
        ),
        title: Text(notification.title, style: TextStyle(fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold)),
        subtitle: Text(notification.body, maxLines: 2, overflow: TextOverflow.ellipsis),
        trailing: Text(notification.createdAt, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ),
    );
  }
}
