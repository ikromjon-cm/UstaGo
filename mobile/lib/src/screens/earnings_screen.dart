import 'package:flutter/material.dart';
import '../services/api_client.dart';
import '../utils/theme.dart';

class EarningsScreen extends StatefulWidget {
  const EarningsScreen({super.key});
  @override
  State<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends State<EarningsScreen> {
  Map<String, dynamic>? _wallet;
  List<dynamic> _transactions = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final walletData = await ApiClient.get('/wallets/balance/');
      final txData = await ApiClient.get('/wallets/transactions/');
      _wallet = walletData;
      _transactions = (txData['results'] as List?) ?? [];
    } catch (_) {}
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Daromadlar')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          children: [
                            const Text('Mavjud balans', style: TextStyle(color: Colors.grey)),
                            const SizedBox(height: 8),
                            Text('${_fmt(_wallet?['balance'] ?? 0)} UZS',
                              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Theme.of(context).primaryColor)),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                _miniStat('Kutilayotgan', '${_fmt(_wallet?['hold_balance'] ?? 0)} UZS'),
                                _miniStat('Jami daromad', '${_fmt(_wallet?['total_earned'] ?? 0)} UZS'),
                                _miniStat('Yechilgan', '${_fmt(_wallet?['total_withdrawn'] ?? 0)} UZS'),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Align(alignment: Alignment.centerLeft, child: Text('Tranzaksiyalar', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
                    const SizedBox(height: 12),
                    if (_transactions.isEmpty)
                      Card(child: Padding(padding: const EdgeInsets.all(24), child: const Text('Tranzaksiyalar yo\'q')))
                    else
                      ...(_transactions.map((tx) => ListTile(
                        leading: Container(
                          width: 40, height: 40,
                          decoration: BoxDecoration(
                            color: tx['type'] == 'deposit' ? AppTheme.success.withOpacity(0.1) : AppTheme.danger.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            tx['type'] == 'deposit' ? Icons.arrow_downward : Icons.arrow_upward,
                            color: tx['type'] == 'deposit' ? AppTheme.success : AppTheme.danger,
                          ),
                        ),
                        title: Text(tx['description'] ?? tx['type']),
                        subtitle: Text(tx['created_at'] ?? ''),
                        trailing: Text('${_fmt(tx['amount'])} UZS', style: TextStyle(fontWeight: FontWeight.bold)),
                      )),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _miniStat(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      ],
    );
  }

  String _fmt(dynamic v) {
    final n = double.tryParse(v.toString()) ?? 0;
    return n.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},');
  }
}
