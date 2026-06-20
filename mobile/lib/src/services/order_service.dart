import 'api_client.dart';
import '../models/order.dart';

class OrderService {
  static Future<List<Order>> getOrders({String? status}) async {
    final params = <String, String>{};
    if (status != null) params['status'] = status;
    final data = await ApiClient.get('/orders/', params: params);
    final results = data['results'] as List? ?? [];
    return results.map((e) => Order.fromJson(e)).toList();
  }

  static Future<Order> getOrder(String id) async {
    final data = await ApiClient.get('/orders/$id/');
    return Order.fromJson(data);
  }

  static Future<Order> createOrder(Map<String, dynamic> body) async {
    final data = await ApiClient.post('/orders/', body: body);
    return Order.fromJson(data);
  }

  static Future<void> cancelOrder(String id) async {
    await ApiClient.post('/orders/$id/cancel/');
  }

  static Future<void> acceptOffer(String orderId, String offerId) async {
    await ApiClient.post('/orders/$orderId/accept_offer/', body: {'offer_id': offerId});
  }

  static Future<void> confirmCompletion(String id) async {
    await ApiClient.post('/orders/$id/confirm_completion/');
  }

  static Future<void> completeWork(String id) async {
    await ApiClient.post('/orders/$id/complete_work/');
  }

  static Future<void> startWork(String id) async {
    await ApiClient.post('/orders/$id/start_work/');
  }
}
