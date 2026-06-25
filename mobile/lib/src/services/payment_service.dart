import '../models/payment.dart';
import 'api_client.dart';

class PaymentService {
  static Future<List<PaymentRecord>> getPayments({String? orderId}) async {
    final params = <String, String>{};
    if (orderId != null && orderId.isNotEmpty) {
      params['order'] = orderId;
    }

    final data = await ApiClient.get(
      '/payments/',
      params: params.isEmpty ? null : params,
    );
    final results = data is Map<String, dynamic>
        ? (data['results'] as List? ?? <dynamic>[])
        : (data as List? ?? <dynamic>[]);
    return results
        .map((item) => PaymentRecord.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  static Future<PaymentRecord?> getPaymentForOrder(String orderId) async {
    final payments = await getPayments(orderId: orderId);
    if (payments.isEmpty) return null;
    return payments.first;
  }

  static Future<PaymentRecord> pay(String paymentId, String method) async {
    final data = await ApiClient.post('/payments/$paymentId/pay/', body: {
      'method': method,
    });
    return PaymentRecord.fromJson(data as Map<String, dynamic>);
  }

  static Future<PaymentRecord> dispute(String paymentId, String reason) async {
    final data = await ApiClient.post('/payments/$paymentId/dispute/', body: {
      'reason': reason,
    });
    return PaymentRecord.fromJson(data as Map<String, dynamic>);
  }
}
