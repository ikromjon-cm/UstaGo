import 'package:flutter/material.dart';
import '../widgets/master_card.dart';
import '../services/master_service.dart';
import '../models/master.dart';

class MastersScreen extends StatefulWidget {
  final String? categoryId;
  const MastersScreen({super.key, this.categoryId});
  @override
  State<MastersScreen> createState() => _MastersScreenState();
}

class _MastersScreenState extends State<MastersScreen> {
  List<Master> _masters = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final masters = await MasterService.getMasters(categoryId: widget.categoryId);
      setState(() { _masters = masters; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Xatolik: $e")));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Masters')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _masters.length,
                itemBuilder: (ctx, i) => MasterCard(master: _masters[i]),
              ),
            ),
    );
  }
}
