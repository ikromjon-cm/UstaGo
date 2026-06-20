import 'package:flutter/material.dart';
import '../services/api_client.dart';
import '../services/master_service.dart';
import '../models/master.dart';
import '../widgets/master_card.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchCtl = TextEditingController();
  List<Master> _results = [];
  bool _loading = false;
  bool _hasSearched = false;

  Future<void> _search() async {
    final query = _searchCtl.text.trim();
    if (query.isEmpty) return;
    setState(() => _loading = true);
    try {
      final data = await ApiClient.get('/masters/', params: {'search': query});
      final results = data['results'] as List? ?? [];
      setState(() {
        _results = results.map((e) => Master.fromJson(e)).toList();
        _hasSearched = true;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _searchCtl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Search')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchCtl,
              decoration: InputDecoration(
                hintText: 'Search masters or services...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchCtl.text.isNotEmpty
                    ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchCtl.clear(); setState(() => _results = []); })
                    : null,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onSubmitted: (_) => _search(),
              textInputAction: TextInputAction.search,
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _hasSearched && _results.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.search_off, size: 64, color: Colors.grey.shade300),
                            const SizedBox(height: 16),
                            Text('No results for "${_searchCtl.text}"', style: const TextStyle(color: Colors.grey, fontSize: 16)),
                          ],
                        ),
                      )
                    : _results.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.search, size: 64, color: Colors.grey.shade300),
                                const SizedBox(height: 16),
                                const Text('Search for masters or services', style: TextStyle(color: Colors.grey, fontSize: 16)),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _results.length,
                            itemBuilder: (ctx, i) => Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: MasterCard(master: _results[i]),
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}
