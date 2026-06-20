import 'package:flutter/material.dart';
import '../services/order_service.dart';
import '../services/api_client.dart';
import '../utils/theme.dart';

class CreateOrderScreen extends StatefulWidget {
  const CreateOrderScreen({super.key});
  @override
  State<CreateOrderScreen> createState() => _CreateOrderScreenState();
}

class _CreateOrderScreenState extends State<CreateOrderScreen> {
  int _step = 0;
  bool _saving = false;
  bool _analyzing = false;

  final _titleCtl = TextEditingController();
  final _descCtl = TextEditingController();
  final _budgetCtl = TextEditingController();
  final _addressCtl = TextEditingController();

  Map<String, dynamic>? _aiResult;
  String _urgency = 'normal';

  Future<void> _analyze() async {
    if (_titleCtl.text.isEmpty) return;
    setState(() => _analyzing = true);
    try {
      final data = await ApiClient.post('/ai/analyze/', body: {
        'text': '${_titleCtl.text} ${_descCtl.text}',
      });
      _aiResult = data;
      setState(() => _step = 1);
    } catch (e) {
      setState(() => _step = 1);
    } finally {
      setState(() => _analyzing = false);
    }
  }

  Future<void> _submit() async {
    setState(() => _saving = true);
    try {
      await OrderService.createOrder({
        'title': _titleCtl.text,
        'description': _descCtl.text,
        'budget': double.tryParse(_budgetCtl.text) ?? 0,
        'address': _addressCtl.text,
        'urgency': _urgency,
        'category_id': _aiResult?['category_id'],
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Buyurtma yaratildi!')));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Xatolik: $e')));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  void dispose() {
    _titleCtl.dispose(); _descCtl.dispose(); _budgetCtl.dispose(); _addressCtl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Buyurtma berish')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStepper(),
            const SizedBox(height: 24),
            Expanded(child: _step == 0 ? _buildStep1() : _step == 1 ? _buildStep2() : _buildStep3()),
          ],
        ),
      ),
    );
  }

  Widget _buildStepper() {
    return Row(
      children: [0, 1, 2].map((i) => Expanded(
        child: Container(
          height: 4,
          margin: const EdgeInsets.symmetric(horizontal: 2),
          decoration: BoxDecoration(
            color: i <= _step ? AppTheme.primary : Colors.grey.shade300,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
      )).toList(),
    );
  }

  Widget _buildStep1() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Nima kerak?', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          TextField(controller: _titleCtl, decoration: const InputDecoration(labelText: 'Sarlavha', border: OutlineInputBorder(), hintText: 'Masalan: Kran oqayapti')),
          const SizedBox(height: 16),
          TextField(controller: _descCtl, decoration: const InputDecoration(labelText: 'Tavsif', border: OutlineInputBorder()), maxLines: 3, hintText: 'Muammoni batafsil yozing...'),
          const SizedBox(height: 24),
          if (_aiResult != null)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('AI aniqladi: ${_aiResult!['category'] ?? 'Noma\'lum'}', style: const TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text('Narx: ${_aiResult!['price_estimate']?['min'] ?? 0} - ${_aiResult!['price_estimate']?['max'] ?? 0} UZS'),
                  Text('Yaqin atrofda: ${_aiResult!['nearby_masters'] ?? 0} ta usta'),
                ],
              ),
            ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _analyzing ? null : _analyze,
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, padding: const EdgeInsets.symmetric(vertical: 16)),
              child: _analyzing
                  ? const Row(mainAxisAlignment: MainAxisAlignment.center, children: [CircularProgressIndicator(color: Colors.white), SizedBox(width: 12), Text('AI tahlil qilmoqda...', style: TextStyle(color: Colors.white))])
                  : const Text('AI bilan davom etish', style: TextStyle(color: Colors.white, fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep2() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Joylashuv', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          TextField(controller: _addressCtl, decoration: const InputDecoration(labelText: 'Manzil', border: OutlineInputBorder())),
          const SizedBox(height: 16),
          DropdownButtonFormField(
            value: _urgency,
            decoration: const InputDecoration(labelText: 'Shoshilinchlik', border: OutlineInputBorder()),
            items: const [
              DropdownMenuItem(value: 'low', child: Text('Past - Bir hafta ichida')),
              DropdownMenuItem(value: 'normal', child: Text('Normal - 2-3 kun')),
              DropdownMenuItem(value: 'high', child: Text('Yuqori - Ertaga')),
              DropdownMenuItem(value: 'emergency', child: Text('Favqulodda')),
            ],
            onChanged: (v) => setState(() => _urgency = v ?? 'normal'),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => setState(() => _step = 2),
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, padding: const EdgeInsets.symmetric(vertical: 16)),
              child: const Text('Davom etish', style: TextStyle(color: Colors.white, fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep3() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Byudjet', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          TextField(controller: _budgetCtl, decoration: const InputDecoration(labelText: 'Byudjet (UZS)', border: OutlineInputBorder()), keyboardType: TextInputType.number),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppTheme.warning.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
            child: const Row(children: [Icon(Icons.info_outline, color: AppTheme.warning), SizedBox(width: 8), Expanded(child: Text('Usta taklifini qabul qilguningizcha to\'lov olinmaydi', style: TextStyle(fontSize: 13)))]),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _saving ? null : _submit,
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, padding: const EdgeInsets.symmetric(vertical: 16)),
              child: _saving
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Buyurtmani yuborish', style: TextStyle(color: Colors.white, fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }
}
