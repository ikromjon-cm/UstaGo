import 'package:flutter/material.dart';

import '../services/api_client.dart';
import '../services/master_service.dart';
import '../models/master.dart';

class MasterDetailScreen extends StatefulWidget {
  final String masterId;
  const MasterDetailScreen({super.key, required this.masterId});
  @override
  State<MasterDetailScreen> createState() => _MasterDetailScreenState();
}

class _MasterDetailScreenState extends State<MasterDetailScreen> {
  Master? _master;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final master = await MasterService.getMaster(widget.masterId);
      setState(() { _master = master; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Xatolik: $e")));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_master == null) return const Scaffold(body: Center(child: Text('Master not found')));
    final m = _master!;
    return Scaffold(
      appBar: AppBar(title: Text(m.fullName)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(radius: 40, backgroundImage: m.avatar != null ? NetworkImage(m.avatar!) : null, child: Text(m.fullName[0])),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(m.fullName, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Row(children: [
                      ...List.generate(5, (i) => Icon(Icons.star, size: 16, color: i < m.rating.round() ? Colors.amber : Colors.grey)),
                      const SizedBox(width: 4),
                      Text('${m.rating} (${m.ratingCount})'),
                    ]),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
            _statRow('Completed Jobs', m.completedJobs.toString()),
            _statRow('Price/hour', '${m.pricePerHour.toStringAsFixed(0)} UZS'),
            if (m.description.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text('About', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(m.description, style: const TextStyle(color: Colors.black87)),
            ],
            if (m.categoryNames.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text('Services', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: m.categoryNames
                    .map((name) => Chip(label: Text(name), visualDensity: VisualDensity.compact))
                    .toList(),
              ),
            ],
            const Spacer(),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () async {
                      try {
                        final data = await ApiClient.get('/chat/rooms/get_or_create/', params: {
                          'user_id': m.userId,
                        });
                        if (!mounted) return;
                        Navigator.pushNamed(context, '/chat/${data['id']}');
                      } catch (e) {
                        if (!mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Chat error: $e')));
                      }
                    },
                    child: const Text('Chat'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pushNamed(
                        context,
                        '/create-order',
                        arguments: {
                          'categoryId': m.categoryIds.isNotEmpty ? m.categoryIds.first : null,
                          'title': 'Need help from ${m.fullName}',
                          'description': m.categoryNames.isNotEmpty
                              ? 'Requesting ${m.categoryNames.first} service from ${m.fullName}'
                              : 'Requesting service from ${m.fullName}',
                        },
                      );
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: Theme.of(context).primaryColor, padding: const EdgeInsets.symmetric(vertical: 16)),
                    child: const Text('Hire Master', style: TextStyle(color: Colors.white, fontSize: 16)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _statRow(String label, String value) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 8),
    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(label, style: const TextStyle(color: Colors.grey)), Text(value, style: const TextStyle(fontWeight: FontWeight.bold))]),
  );
}
