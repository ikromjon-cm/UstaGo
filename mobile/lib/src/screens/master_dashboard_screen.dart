import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/master_provider.dart';
import '../providers/auth_provider.dart';
import '../utils/theme.dart';
import '../models/order.dart';

class MasterDashboardScreen extends StatefulWidget {
  const MasterDashboardScreen({super.key});

  @override
  State<MasterDashboardScreen> createState() => _MasterDashboardScreenState();
}

class _MasterDashboardScreenState extends State<MasterDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MasterProvider>().loadDashboard();
    });
  }

  @override
  Widget build(BuildContext context) {
    final masterProv = context.watch<MasterProvider>();
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          Switch(
            value: masterProv.online,
            activeColor: AppTheme.success,
            onChanged: (v) => masterProv.toggleOnline(),
          ),
          const SizedBox(width: 8),
          Text(masterProv.online ? 'Online' : 'Offline', style: const TextStyle(fontSize: 13)),
          const SizedBox(width: 12),
        ],
      ),
      body: masterProv.loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(child: _StatCard(
                        title: 'Daromad',
                        value: '${_fmt(masterProv.stats['total_earnings'] ?? 0)} UZS',
                        icon: Icons.account_balance_wallet_outlined,
                        color: AppTheme.success,
                      )),
                      const SizedBox(width: 12),
                      Expanded(child: _StatCard(
                        title: 'Buyurtmalar',
                        value: '${masterProv.stats['total_orders'] ?? 0}',
                        icon: Icons.shopping_bag_outlined,
                        color: AppTheme.primary,
                      )),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _StatCard(
                        title: 'Reyting',
                        value: (masterProv.stats['avg_rating'] ?? 0).toStringAsFixed(1),
                        icon: Icons.star_outline,
                        color: AppTheme.warning,
                      )),
                      const SizedBox(width: 12),
                      Expanded(child: _StatCard(
                        title: 'Ishlar',
                        value: '${masterProv.stats['completed_orders'] ?? 0}',
                        icon: Icons.work_outline,
                        color: AppTheme.danger,
                      )),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Text('Yangi buyurtmalar', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  if (masterProv.recentOrders.isEmpty)
                    const Card(child: Padding(padding: EdgeInsets.all(24), child: Text('Hozircha buyurtma yo\'q')))
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: masterProv.recentOrders.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (_, i) {
                        final order = masterProv.recentOrders[i];
                        return Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 48, height: 48,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF2563EB).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(Icons.plumbing, color: AppTheme.primary),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(order.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                                    const SizedBox(height: 4),
                                    Text('${order.address} • ${order.budget} UZS', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                                  ],
                                ),
                              ),
                              ElevatedButton(
                                onPressed: () => Navigator.pushNamed(context, '/order-detail', arguments: order.id),
                                style: ElevatedButton.styleFrom(
                                  minimumSize: const Size(80, 36),
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                ),
                                child: const Text('Taklif'),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                ],
              ),
            ),
    );
  }

  String _fmt(dynamic v) {
    final n = double.tryParse(v.toString()) ?? 0;
    return n.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},');
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({required this.title, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(title, style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
        ],
      ),
    );
  }
}
