import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../models/order.dart';
import '../models/payment.dart';
import '../services/order_service.dart';
import '../services/payment_service.dart';

class OrderDetailScreen extends StatefulWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  Order? _order;
  PaymentRecord? _payment;
  bool _loading = true;
  bool _actionLoading = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final order = await OrderService.getOrder(widget.orderId);
      final payment = await PaymentService.getPaymentForOrder(widget.orderId);
      if (!mounted) return;
      setState(() {
        _order = order;
        _payment = payment;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Xatolik: $e')),
      );
    }
  }

  String _formatDateTime(String value) {
    if (value.isEmpty) return '—';
    final parsed = DateTime.tryParse(value);
    if (parsed == null) return value;
    return '${parsed.day.toString().padLeft(2, '0')}.${parsed.month.toString().padLeft(2, '0')}.${parsed.year} ${parsed.hour.toString().padLeft(2, '0')}:${parsed.minute.toString().padLeft(2, '0')}';
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'held':
        return Colors.green;
      case 'in_progress':
      case 'processing':
        return Colors.blue;
      case 'cancelled':
      case 'failed':
      case 'disputed':
        return Colors.red;
      case 'pending':
      case 'accepted':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.black54),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  Future<void> _confirmCompletion() async {
    if (_order == null) return;
    setState(() => _actionLoading = true);
    try {
      await OrderService.confirmCompletion(_order!.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Completion confirmed')),
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to confirm completion: $e')),
      );
    } finally {
      if (mounted) setState(() => _actionLoading = false);
    }
  }

  Future<void> _openReview() async {
    if (_order == null) return;
    final result = await Navigator.pushNamed(context, '/review/${_order!.id}');
    if (result == true) {
      await _load();
      if (!mounted) return;
      Navigator.pop(context, true);
    }
  }

  Future<void> _openDispute() async {
    if (_payment == null) return;
    final result = await Navigator.pushNamed(context, '/dispute/${_payment!.id}');
    if (result == true) {
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Dispute submitted successfully')),
      );
    }
  }

  Future<void> _payWithMethod(String method) async {
    if (_payment == null) return;
    setState(() => _actionLoading = true);
    try {
      final payment = await PaymentService.pay(_payment!.id, method);
      if (!mounted) return;
      setState(() => _payment = payment);
      if (payment.paymentUrl.isNotEmpty) {
        await showDialog<void>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Payment link created'),
            content: SelectableText(payment.paymentUrl),
            actions: [
              TextButton(
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: payment.paymentUrl));
                  Navigator.pop(context);
                  ScaffoldMessenger.of(this.context).showSnackBar(
                    const SnackBar(content: Text('Payment link copied')),
                  );
                },
                child: const Text('Copy'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Close'),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment started successfully')),
        );
      }
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Payment failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _actionLoading = false);
    }
  }

  Future<void> _selectPaymentMethod() async {
    final method = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const ListTile(title: Text('Select payment method')),
            ListTile(
              title: const Text('Wallet'),
              onTap: () => Navigator.pop(context, 'wallet'),
            ),
            ListTile(
              title: const Text('Payme'),
              onTap: () => Navigator.pop(context, 'payme'),
            ),
            ListTile(
              title: const Text('Click'),
              onTap: () => Navigator.pop(context, 'click'),
            ),
            ListTile(
              title: const Text('Uzum'),
              onTap: () => Navigator.pop(context, 'uzum'),
            ),
          ],
        ),
      ),
    );
    if (method != null) {
      await _payWithMethod(method);
    }
  }

  Future<void> _cancelOrder() async {
    final order = _order;
    if (order == null) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel Order'),
        content: Text('Are you sure you want to cancel "${order.title}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Yes')),
        ],
      ),
    );
    if (confirm != true) return;

    setState(() => _actionLoading = true);
    try {
      await OrderService.cancelOrder(order.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Order cancelled')),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to cancel: $e')),
      );
    } finally {
      if (mounted) setState(() => _actionLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_order == null) {
      return const Scaffold(body: Center(child: Text('Order not found')));
    }

    final order = _order!;
    final displayPrice = order.finalPrice > 0 ? order.finalPrice : order.budget;

    return Scaffold(
      appBar: AppBar(title: Text(order.title)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Chip(
                  label: Text(order.status.replaceAll('_', ' ')),
                  backgroundColor: _statusColor(order.status).withValues(alpha: 0.2),
                ),
                const SizedBox(width: 8),
                if (_payment != null)
                  Chip(
                    label: Text('Payment: ${_payment!.status}'),
                    backgroundColor: _statusColor(_payment!.status).withValues(alpha: 0.15),
                  ),
                const Spacer(),
                Text(
                  '${displayPrice.toStringAsFixed(0)} UZS',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              order.description.isEmpty ? 'No description provided' : order.description,
              style: const TextStyle(fontSize: 15),
            ),
            const SizedBox(height: 16),
            _detailRow('Urgency', order.urgency.replaceAll('_', ' ')),
            _detailRow('Address', order.address),
            if (order.apartment.isNotEmpty) _detailRow('Apartment', order.apartment),
            _detailRow('Coordinates', '${order.latitude}, ${order.longitude}'),
            if (order.preferredDate != null) _detailRow('Preferred date', order.preferredDate!),
            if (order.preferredTime != null) _detailRow('Preferred time', order.preferredTime!),
            _detailRow('Created at', _formatDateTime(order.createdAt)),
            _detailRow('Paid', order.isPaid ? 'Yes' : 'No'),
            _detailRow('Reviewed', order.isRated ? 'Yes' : 'No'),
            if (_payment != null) ...[
              _detailRow('Payment method', _payment!.method),
              _detailRow('Payment status', _payment!.status),
              _detailRow('Payment amount', '${_payment!.amount.toStringAsFixed(0)} UZS'),
              if (_payment!.paymentUrl.isNotEmpty)
                _detailRow('Payment link', _payment!.paymentUrl),
            ],
            const Spacer(),
            if (_payment != null && order.status == 'accepted' && _payment!.status == 'pending') ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _actionLoading ? null : _selectPaymentMethod,
                  child: _actionLoading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Pay now'),
                ),
              ),
              const SizedBox(height: 12),
            ],
            if (order.status == 'completed' && !order.isPaid) ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _actionLoading ? null : _confirmCompletion,
                  child: _actionLoading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Confirm completion'),
                ),
              ),
              const SizedBox(height: 12),
            ],
            if (order.status == 'completed' && order.isPaid && !order.isRated) ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _actionLoading ? null : _openReview,
                  child: const Text('Leave review'),
                ),
              ),
              const SizedBox(height: 12),
            ],
            if (_payment != null && (_payment!.status == 'held' || _payment!.status == 'completed')) ...[
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: _actionLoading ? null : _openDispute,
                  child: const Text('Open dispute'),
                ),
              ),
              const SizedBox(height: 12),
            ],
            if (order.status == 'pending' || order.status == 'looking_master')
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _actionLoading ? null : _cancelOrder,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                  child: _actionLoading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Cancel Order', style: TextStyle(color: Colors.white)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
