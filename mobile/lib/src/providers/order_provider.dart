import 'package:flutter/foundation.dart';
import '../models/order.dart';
import '../services/order_service.dart';

class OrderProvider extends ChangeNotifier {
  List<Order> _orders = [];
  bool _loading = false;
  String? _error;

  List<Order> get orders => _orders;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> loadOrders({String? status}) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _orders = await OrderService.getOrders(status: status);
    } catch (e) {
      _error = e.toString();
    }
    _loading = false;
    notifyListeners();
  }

  Future<void> createOrder(Map<String, dynamic> body) async {
    try {
      await OrderService.createOrder(body);
      await loadOrders();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }
}
