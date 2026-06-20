import 'package:flutter/foundation.dart';
import '../models/notification.dart';
import '../services/api_client.dart';

class NotificationProvider extends ChangeNotifier {
  final List<AppNotification> _notifications = [];
  int _unreadCount = 0;
  bool _loading = false;

  List<AppNotification> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get loading => _loading;

  Future<void> loadNotifications() async {
    _loading = true;
    notifyListeners();
    try {
      final data = await ApiClient.get('/notifications/');
      final results = data['results'] as List<dynamic>? ?? data as List<dynamic>? ?? [];
      _notifications.clear();
      for (final json in results) {
        final n = AppNotification.fromJson(json as Map<String, dynamic>);
        _notifications.add(n);
        if (!n.isRead) _unreadCount++;
      }
    } catch (_) {}
    _loading = false;
    notifyListeners();
  }

  void addNotification(AppNotification notification) {
    _notifications.insert(0, notification);
    if (!notification.isRead) _unreadCount++;
    notifyListeners();
  }

  void markAsRead(String id) {
    final idx = _notifications.indexWhere((n) => n.id == id);
    if (idx != -1) {
      _unreadCount--;
      notifyListeners();
    }
  }

  void clear() {
    _notifications.clear();
    _unreadCount = 0;
    notifyListeners();
  }
}
