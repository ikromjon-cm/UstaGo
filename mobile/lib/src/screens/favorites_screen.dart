import 'package:flutter/material.dart';
import '../services/api_client.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});
  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  List<dynamic> _favorites = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await ApiClient.get('/favorites/');
      final results = data is Map<String, dynamic>
          ? (data['results'] as List<dynamic>? ?? <dynamic>[])
          : (data as List<dynamic>? ?? <dynamic>[]);
      setState(() => _favorites = results);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Xatolik: $e")));
      }
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Favorites')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _favorites.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.favorite_border, size: 64, color: Colors.grey.shade300),
                      const SizedBox(height: 16),
                      const Text('No favorites yet', style: TextStyle(color: Colors.grey, fontSize: 16)),
                      const SizedBox(height: 8),
                      TextButton(onPressed: () => Navigator.pushNamed(context, '/masters'), child: const Text('Browse Masters')),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _favorites.length,
                    itemBuilder: (ctx, i) {
                      final fav = _favorites[i] as Map<String, dynamic>;
                      final master = fav['master_detail'] as Map<String, dynamic>?;
                      return Card(
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Theme.of(context).primaryColor,
                            child: Text((master?['user']?['full_name']?[0] as String? ?? 'U').toUpperCase(),
                                style: const TextStyle(color: Colors.white)),
                          ),
                          title: Text(master?['user']?['full_name'] ?? 'Master'),
                          subtitle: Text('Rating: ${master?['rating'] ?? "—"}'),
                          trailing: IconButton(
                            icon: const Icon(Icons.favorite, color: Colors.red),
                            onPressed: () async {
                              try {
                                await ApiClient.delete('/favorites/${fav['id']}/');
                                _load();
                              } catch (_) {}
                            },
                          ),
                          onTap: () => Navigator.pushNamed(context, '/master/${master?['id']}'),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
