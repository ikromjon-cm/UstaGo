import 'package:flutter/foundation.dart';

import '../models/master.dart';
import '../models/order.dart';
import '../services/api_client.dart';
import '../services/master_service.dart';
import '../services/order_service.dart';

class MasterProvider extends ChangeNotifier {
  List<Master> _nearbyMasters = [];
  List<Order> _availableOrders = [];
  List<Order> _activeOrders = [];
  Map<String, dynamic> _stats = {};
  Master? _profile;
  bool _loading = false;
  bool _online = false;

  List<Master> get nearbyMasters => _nearbyMasters;
  List<Order> get availableOrders => _availableOrders;
  List<Order> get activeOrders => _activeOrders;
  Map<String, dynamic> get stats => _stats;
  Master? get profile => _profile;
  bool get loading => _loading;
  bool get online => _online;

  void setOnline(bool value) {
    _online = value;
    notifyListeners();
  }

  Future<void> loadNearbyMasters({double? lat, double? lng, String? categoryId}) async {
    _loading = true;
    notifyListeners();
    try {
      _nearbyMasters = await MasterService.getMasters(
        categoryId: categoryId,
        lat: lat,
        lng: lng,
      );
    } catch (e) {
      debugPrint('Load masters error: $e');
    }
    _loading = false;
    notifyListeners();
  }

  Future<void> loadDashboard() async {
    _loading = true;
    notifyListeners();
    try {
      _profile = await MasterService.getMyProfile();
      _online = _profile?.isOnline ?? _online;

      final orders = await OrderService.getOrders();
      const openStatuses = ['pending', 'looking_master', 'offered'];
      const activeStatuses = ['accepted', 'in_progress', 'completed'];

      _availableOrders = orders.where((order) => openStatuses.contains(order.status)).toList();
      _activeOrders = orders.where((order) => activeStatuses.contains(order.status)).toList();

      final completedOrders =
          _activeOrders.where((order) => order.status == 'completed').toList();
      final earnings = completedOrders.fold<double>(0, (sum, order) {
        final amount = order.finalPrice > 0 ? order.finalPrice : order.budget;
        return sum + amount;
      });

      _stats = {
        'open_orders': _availableOrders.length,
        'active_orders': _activeOrders.where((order) => order.status != 'completed').length,
        'rating': _profile?.rating ?? 0.0,
        'completed_jobs': _profile?.completedJobs ?? completedOrders.length,
        'earnings': earnings,
      };
    } catch (e) {
      debugPrint('Load dashboard error: $e');
    }
    _loading = false;
    notifyListeners();
  }

  Future<void> toggleOnline() async {
    final nextValue = !_online;
    _online = nextValue;
    notifyListeners();
    try {
      await ApiClient.patch('/masters/update_status/', body: {
        'is_online': nextValue,
        'is_available': nextValue,
      });
    } catch (e) {
      _online = !nextValue;
      notifyListeners();
      debugPrint('Toggle online error: $e');
    }
  }
}
