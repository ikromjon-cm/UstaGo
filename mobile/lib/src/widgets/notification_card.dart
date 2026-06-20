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

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).primaryColor.withOpacity(0.2),
          child: Icon(_typeIcon(notification.type), color: Theme.of(context).primaryColor),
        ),
        title: Text(notification.title, style: TextStyle(fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold)),
        subtitle: Text(notification.body, maxLines: 2, overflow: TextOverflow.ellipsis),
        trailing: Text(notification.createdAt, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ),
    );
  }
}
