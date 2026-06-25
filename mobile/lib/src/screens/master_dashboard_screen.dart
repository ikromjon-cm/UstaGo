import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/order.dart';
import '../providers/master_provider.dart';
import '../services/order_service.dart';
import '../utils/theme.dart';

class MasterDashboardScreen extends StatefulWidget {
  const MasterDashboardScreen({super.key});

  @override
  State<MasterDashboardScreen> createState() => _MasterDashboardScreenState();
}

class _MasterDashboardScreenState extends State<MasterDashboardScreen> {
  String? _busyOrderId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MasterProvider>().loadDashboard();
    });
  }

  Future<void> _refresh() async {
    await context.read<MasterProvider>().loadDashboard();
  }

  Future<void> _handleStart(Order order) async {
    setState(() => _busyOrderId = order.id);
    try {
      await OrderService.startWork(order.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Work started successfully')),
      );
      await _refresh();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to start work: $e')),
      );
    } finally {
      if (mounted) setState(() => _busyOrderId = null);
    }
  }

  Future<void> _handleComplete(Order order) async {
    setState(() => _busyOrderId = order.id);
    try {
      await OrderService.completeWork(order.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Work marked as completed')),
      );
      await _refresh();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to complete work: $e')),
      );
    } finally {
      if (mounted) setState(() => _busyOrderId = null);
    }
  }

  Future<void> _showOfferSheet(Order order) async {
    final priceCtl = TextEditingController(
      text: (order.finalPrice > 0 ? order.finalPrice : order.budget) > 0
          ? (order.finalPrice > 0 ? order.finalPrice : order.budget)
              .toStringAsFixed(0)
          : '',
    );
    final descriptionCtl = TextEditingController();
    final durationCtl = TextEditingController(text: '60');
    var submitting = false;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            Future<void> submitOffer() async {
              final price = double.tryParse(priceCtl.text.trim());
              final duration = int.tryParse(durationCtl.text.trim());
              if (price == null || price <= 0 || duration == null || duration <= 0) {
                ScaffoldMessenger.of(sheetContext).showSnackBar(
                  const SnackBar(content: Text('Enter valid price and duration')),
                );
                return;
              }

              setSheetState(() => submitting = true);
              try {
                await OrderService.makeOffer(
                  order.id,
                  price: price,
                  estimatedDuration: duration,
                  description: descriptionCtl.text.trim(),
                );
                if (!mounted) return;
                Navigator.pop(sheetContext);
                ScaffoldMessenger.of(this.context).showSnackBar(
                  const SnackBar(content: Text('Offer sent successfully')),
                );
                await _refresh();
              } catch (e) {
                if (!mounted) return;
                ScaffoldMessenger.of(sheetContext).showSnackBar(
                  SnackBar(content: Text('Failed to send offer: $e')),
                );
              } finally {
                if (sheetContext.mounted) setSheetState(() => submitting = false);
              }
            }

            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Send offer for ${order.title}',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: priceCtl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Your price (UZS)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: durationCtl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Estimated duration (minutes)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: descriptionCtl,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: 'Message to customer',
                      hintText: 'Describe your plan or availability',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: submitting ? null : submitOffer,
                      child: submitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Send Offer'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );

    priceCtl.dispose();
    descriptionCtl.dispose();
    durationCtl.dispose();
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'accepted':
        return Colors.orange;
      case 'in_progress':
        return Colors.blue;
      case 'completed':
        return Colors.green;
      case 'pending':
      case 'looking_master':
      case 'offered':
        return AppTheme.primary;
      default:
        return Colors.grey;
    }
  }

  double _amount(Order order) => order.finalPrice > 0 ? order.finalPrice : order.budget;

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MasterProvider>();
    final profile = provider.profile;
    final activeOrders = provider.activeOrders
        .where((order) => order.status == 'accepted' || order.status == 'in_progress')
        .toList();
    final openOrders = provider.availableOrders.take(6).toList();
    final stats = provider.stats;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Master Dashboard'),
        actions: [
          Center(
            child: Text(
              provider.online ? 'Online' : 'Offline',
              style: TextStyle(
                color: provider.online ? AppTheme.success : Colors.grey.shade600,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Switch(
            value: provider.online,
            activeColor: AppTheme.success,
            onChanged: provider.loading ? null : (_) => context.read<MasterProvider>().toggleOnline(),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: provider.loading && profile == null
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                children: [
                  if (profile != null)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 28,
                            backgroundColor: AppTheme.primary.withValues(alpha: 0.12),
                            child: Text(
                              profile.fullName.isNotEmpty ? profile.fullName[0].toUpperCase() : 'M',
                              style: const TextStyle(
                                color: AppTheme.primary,
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  profile.fullName,
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  profile.categoryNames.isNotEmpty
                                      ? profile.categoryNames.join(', ')
                                      : 'Service professional',
                                  style: TextStyle(color: Colors.grey.shade600),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: (provider.online ? AppTheme.success : Colors.grey).withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              provider.online ? 'Available' : 'Offline',
                              style: TextStyle(
                                color: provider.online ? AppTheme.success : Colors.grey.shade700,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.amber.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
                      ),
                      child: const Text(
                        'Master profile could not be loaded. Pull to refresh and try again.',
                      ),
                    ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => Navigator.pushNamed(context, '/orders'),
                          icon: const Icon(Icons.assignment_outlined),
                          label: const Text('All Orders'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => Navigator.pushNamed(context, '/wallet'),
                          icon: const Icon(Icons.account_balance_wallet_outlined),
                          label: const Text('Wallet'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  GridView.count(
                    crossAxisCount: 2,
                    childAspectRatio: 1.45,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    children: [
                      _StatCard(
                        title: 'Open Orders',
                        value: '${stats['open_orders'] ?? 0}',
                        icon: Icons.campaign_outlined,
                        color: AppTheme.primary,
                      ),
                      _StatCard(
                        title: 'Active Jobs',
                        value: '${stats['active_orders'] ?? 0}',
                        icon: Icons.work_outline,
                        color: AppTheme.warning,
                      ),
                      _StatCard(
                        title: 'Rating',
                        value: ((stats['rating'] as num?) ?? 0).toStringAsFixed(1),
                        icon: Icons.star_outline,
                        color: AppTheme.success,
                      ),
                      _StatCard(
                        title: 'Earnings',
                        value: '${((stats['earnings'] as num?) ?? 0).toStringAsFixed(0)} UZS',
                        icon: Icons.account_balance_wallet_outlined,
                        color: AppTheme.danger,
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Assigned Jobs',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  if (activeOrders.isEmpty)
                    const _EmptyState(
                      icon: Icons.work_outline,
                      title: 'No active jobs yet',
                      subtitle: 'Accepted and in-progress jobs will appear here.',
                    )
                  else
                    ...activeOrders.map(
                      (order) => _OrderCard(
                        order: order,
                        amount: _amount(order),
                        statusColor: _statusColor(order.status),
                        busy: _busyOrderId == order.id,
                        primaryLabel: order.status == 'accepted' ? 'Start Work' : 'Complete Work',
                        onPrimaryTap: () => order.status == 'accepted'
                            ? _handleStart(order)
                            : _handleComplete(order),
                        onSecondaryTap: () => Navigator.pushNamed(context, '/order/${order.id}'),
                        secondaryLabel: 'View',
                      ),
                    ),
                  const SizedBox(height: 24),
                  const Text(
                    'New Orders Nearby',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  if (openOrders.isEmpty)
                    const _EmptyState(
                      icon: Icons.inbox_outlined,
                      title: 'No new orders right now',
                      subtitle: 'Pull to refresh for the latest nearby requests.',
                    )
                  else
                    ...openOrders.map(
                      (order) => _OrderCard(
                        order: order,
                        amount: _amount(order),
                        statusColor: _statusColor(order.status),
                        busy: false,
                        primaryLabel: 'Send Offer',
                        onPrimaryTap: () => _showOfferSheet(order),
                        onSecondaryTap: () => Navigator.pushNamed(context, '/order/${order.id}'),
                        secondaryLabel: 'Details',
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

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
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color),
          const SizedBox(height: 12),
          Text(
            value,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(title, style: TextStyle(color: Colors.grey.shade600)),
        ],
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;
  final double amount;
  final Color statusColor;
  final bool busy;
  final String primaryLabel;
  final String secondaryLabel;
  final VoidCallback onPrimaryTap;
  final VoidCallback onSecondaryTap;

  const _OrderCard({
    required this.order,
    required this.amount,
    required this.statusColor,
    required this.busy,
    required this.primaryLabel,
    required this.secondaryLabel,
    required this.onPrimaryTap,
    required this.onSecondaryTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  order.title,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  order.status.replaceAll('_', ' '),
                  style: TextStyle(color: statusColor, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            order.description.isEmpty ? 'No additional description provided.' : order.description,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(color: Colors.grey.shade700),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 16, color: Colors.grey),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  order.address,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: Colors.grey.shade700),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Text(
                '${amount.toStringAsFixed(0)} UZS',
                style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary),
              ),
              const SizedBox(width: 12),
              Text(
                order.urgency.replaceAll('_', ' '),
                style: TextStyle(color: Colors.grey.shade600),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onSecondaryTap,
                  child: Text(secondaryLabel),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: busy ? null : onPrimaryTap,
                  child: busy
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Text(primaryLabel),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 36, color: Colors.grey.shade400),
          const SizedBox(height: 12),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }
}
