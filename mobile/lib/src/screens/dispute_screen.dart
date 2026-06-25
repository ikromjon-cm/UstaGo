import 'package:flutter/material.dart';

import '../services/payment_service.dart';
import '../utils/theme.dart';

class DisputeScreen extends StatefulWidget {
  final String paymentId;
  const DisputeScreen({super.key, required this.paymentId});
  @override
  State<DisputeScreen> createState() => _DisputeScreenState();
}

class _DisputeScreenState extends State<DisputeScreen> {
  String? _reason;
  final _detailsCtl = TextEditingController();
  bool _submitting = false;
  bool _submitted = false;

  final _reasons = [
    "Master didn't show up",
    "Work not completed as agreed",
    "Quality of work is poor",
    "Overcharged / Wrong price",
    "Damaged property",
    "Other",
  ];

  Future<void> _submit() async {
    if (_reason == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Iltimos, sababni tanlang")));
      return;
    }
    setState(() => _submitting = true);
    try {
      final details = _detailsCtl.text.trim();
      final reason = details.isEmpty ? _reason! : '$_reason: $details';
      await PaymentService.dispute(widget.paymentId, reason);
      if (!mounted) return;
      setState(() => _submitted = true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Xatolik: $e")));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  void dispose() { _detailsCtl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Dispute")),
      body: _submitted
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.shield, size: 64, color: AppTheme.primary),
                    const SizedBox(height: 16),
                    const Text("Dispute Submitted", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    const Text(
                      "Our support team will review your dispute within 24 hours.",
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text("Back to Order"),
                    ),
                    TextButton(
                      onPressed: () => Navigator.popUntil(context, (r) => r.isFirst),
                      child: const Text("Back to Home"),
                    ),
                  ],
                ),
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Open a Dispute", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text("Having an issue? We're here to help.", style: TextStyle(color: Colors.grey)),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.amber.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
                    ),
                    child: const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.warning_amber, color: Colors.amber),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            "Try contacting the master via chat first. Provide as much detail as possible.",
                            style: TextStyle(fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  DropdownButtonFormField<String>(
                    value: _reason,
                    decoration: const InputDecoration(labelText: "Reason", border: OutlineInputBorder()),
                    items: _reasons.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                    onChanged: (v) => setState(() => _reason = v),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _detailsCtl,
                    decoration: const InputDecoration(
                      labelText: "Details",
                      hintText: "Describe what happened...",
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 5,
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _submitting ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: _submitting
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text("Submit Dispute", style: TextStyle(color: Colors.white, fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
