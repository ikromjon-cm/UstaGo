import 'package:flutter/material.dart';
import '../services/api_client.dart';
import '../models/master.dart';
import '../widgets/master_card.dart';

class SearchScreen extends StatefulWidget {
  final String? initialQuery;
  const SearchScreen({super.key, this.initialQuery});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  late final TextEditingController _searchCtl;
  List<Master> _results = [];
  bool _loading = false;
  bool _hasSearched = false;

  @override
  void initState() {
    super.initState();
    _searchCtl = TextEditingController(text: widget.initialQuery ?? '');
    if (widget.initialQuery != null && widget.initialQuery!.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _search());
    }
  }

  Future<void> _search() async {
    final query = _searchCtl.text.trim();
    if (query.isEmpty) return;
    setState(() => _loading = true);
    try {
      final data = await ApiClient.get('/masters/', params: {'search': query});
      final results = data is Map<String, dynamic>
          ? (data['results'] as List? ?? <dynamic>[])
          : (data as List? ?? <dynamic>[]);
      setState(() {
        _results = results.map((e) => Master.fromJson(e as Map<String, dynamic>)).toList();
        _hasSearched = true;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Qidiruv xatolik: $e")));
      }
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
                        : RefreshIndicator(
                            onRefresh: () => _search(),
                            child: ListView.builder(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              itemCount: _results.length,
                              itemBuilder: (ctx, i) => Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: MasterCard(master: _results[i]),
                              ),
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}
