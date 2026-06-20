import 'package:flutter/material.dart';
import '../services/api_client.dart';
import '../utils/theme.dart';

class ReviewScreen extends StatefulWidget {
  final String orderId;
  const ReviewScreen({super.key, required this.orderId});
  @override
  State<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends State<ReviewScreen> {
  int _rating = 5;
  int _quality = 5;
  int _speed = 5;
  int _communication = 5;
  final _commentCtl = TextEditingController();
  bool _submitting = false;

  Future<void> _submit() async {
    setState(() => _submitting = true);
    try {
      await ApiClient.post('/reviews/', body: {
        'order_id': widget.orderId,
        'rating': _rating,
        'quality': _quality,
        'speed': _speed,
        'communication': _communication,
        'professionalism': (_quality + _speed + _communication) ~/ 3,
        'comment': _commentCtl.text,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Sharh qoldirildi!")));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Xatolik: $e")));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Widget _stars(int value, Function(int) onChanged) {
    return Row(children: List.generate(5, (i) => IconButton(
      icon: Icon(i < value ? Icons.star : Icons.star_border, color: Colors.amber, size: 32),
      onPressed: () => onChanged(i + 1),
    )));
  }

  @override
  void dispose() { _commentCtl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final avg = (_quality + _speed + _communication) / 3;
    return Scaffold(
      appBar: AppBar(title: const Text('Sharh qoldirish')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(avg >= 4.5 ? '🌟' : avg >= 3.5 ? '👍' : avg >= 2.5 ? '😐' : '👎', style: const TextStyle(fontSize: 48)),
            const SizedBox(height: 8),
            Text('${avg.toStringAsFixed(1)} / 5', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            _buildCategory('Sifat', _quality, (v) => _quality = v),
            _buildCategory('Tezlik', _speed, (v) => _speed = v),
            _buildCategory('Muloqot', _communication, (v) => _communication = v),
            const SizedBox(height: 16),
            TextField(controller: _commentCtl, decoration: const InputDecoration(labelText: 'Sharhingiz', border: OutlineInputBorder()), maxLines: 3),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submitting ? null : _submit,
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, padding: const EdgeInsets.symmetric(vertical: 16)),
                child: _submitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Sharhni yuborish', style: TextStyle(color: Colors.white, fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategory(String label, int value, Function(int) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        _stars(value, onChanged),
      ],
    );
  }
}
