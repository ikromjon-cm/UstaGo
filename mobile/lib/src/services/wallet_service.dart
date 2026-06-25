import '../models/wallet.dart';
import 'api_client.dart';

class WalletService {
  static Future<WalletRecord> getWallet() async {
    final data = await ApiClient.get('/wallets/balance/');
    return WalletRecord.fromJson(data as Map<String, dynamic>);
  }

  static Future<List<WalletTransaction>> getTransactions() async {
    final data = await ApiClient.get('/wallets/transactions/');
    final results = data is Map<String, dynamic>
        ? (data['results'] as List? ?? <dynamic>[])
        : (data as List? ?? <dynamic>[]);
    return results
        .map((item) => WalletTransaction.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  static Future<WalletOverview> getOverview() async {
    final results = await Future.wait<dynamic>([
      getWallet(),
      getTransactions(),
    ]);

    return WalletOverview(
      wallet: results[0] as WalletRecord,
      transactions: results[1] as List<WalletTransaction>,
    );
  }
}
