import 'package:flutter/foundation.dart';
import '../models/master.dart';
import '../models/order.dart';
import '../services/master_service.dart';
import '../services/order_service.dart';
import '../services/api_client.dart';

class MasterProvider extends ChangeNotifier {
  List<Master> _nearbyMasters = [];
  List<Order> _recentOrders = [];
  Map<String, dynamic> _stats = {};
  bool _loading = false;
  bool _online = true;

  List<Master> get nearbyMasters => _nearbyMasters;
  List<Order> get recentOrders => _recentOrders;
  Map<String, dynamic> get stats => _stats;
  bool get loading => _loading;
  bool get online => _online;

  void setOnline(bool v) { _online = v; notifyListeners(); }

  Future<void> loadNearbyMasters({double? lat, double? lng, String? categoryId}) async {
    _loading = true;
    notifyListeners();
    try {
      _nearbyMasters = await MasterService.getMasters(lat: lat, lng: lng);
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
      final data = await ApiClient.get('/analytics/master_stats/');
      _stats = data;
      _recentOrders = await OrderService.getOrders();
    } catch (e) {
      debugPrint('Load dashboard error: $e');
    }
    _loading = false;
    notifyListeners();
  }

  Future<void> toggleOnline() async {
    _online = !_online;
    notifyListeners();
    try {
      await ApiClient.patch('/users/me/', body: {'is_online': _online});
    } catch (e) {
      _online = !_online;
      notifyListeners();
    }
  }
}
