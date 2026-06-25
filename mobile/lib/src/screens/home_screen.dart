import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/master.dart';
import '../providers/auth_provider.dart';
import '../providers/category_provider.dart';
import '../services/master_service.dart';
import '../utils/theme.dart';
import '../widgets/category_card.dart';
import '../widgets/master_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Master> _masters = [];
  bool _mastersLoading = true;
  final _searchCtl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CategoryProvider>().loadCategories();
      _loadMasters();
    });
  }

  @override
  void dispose() {
    _searchCtl.dispose();
    super.dispose();
  }

  Future<void> _loadMasters() async {
    try {
      final masters = await MasterService.getMasters();
      if (mounted) {
        setState(() {
          _masters = masters.take(5).toList();
        });
      }
    } catch (_) {
      // Intentionally ignored here; empty-state UI handles failures gracefully.
    }
    if (mounted) setState(() => _mastersLoading = false);
  }

  void _handleBottomNavTap(int index, bool isMaster) {
    switch (index) {
      case 0:
        return;
      case 1:
        Navigator.pushNamed(context, '/search');
        return;
      case 2:
        Navigator.pushNamed(context, isMaster ? '/master-dashboard' : '/orders');
        return;
      case 3:
        Navigator.pushNamed(context, '/chat');
        return;
      case 4:
        Navigator.pushNamed(context, '/profile');
        return;
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final cats = context.watch<CategoryProvider>();
    final isMaster = auth.isMaster;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Center(
                child: Text(
                  'U',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(width: 10),
            const Text('UstaGo', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => Navigator.pushNamed(context, '/notifications'),
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => Navigator.pushNamed(context, '/profile'),
          ),
        ],
      ),
      body: _buildHome(cats, isMaster),
      floatingActionButton: isMaster
          ? null
          : FloatingActionButton.extended(
              onPressed: () => Navigator.pushNamed(context, '/create-order'),
              icon: const Icon(Icons.add),
              label: const Text('Create Order'),
            ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        onTap: (index) => _handleBottomNavTap(index, isMaster),
        type: BottomNavigationBarType.fixed,
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.search_outlined),
            activeIcon: Icon(Icons.search),
            label: 'Search',
          ),
          BottomNavigationBarItem(
            icon: Icon(isMaster ? Icons.dashboard_outlined : Icons.list_alt_outlined),
            activeIcon: Icon(isMaster ? Icons.dashboard : Icons.list_alt),
            label: isMaster ? 'Dashboard' : 'Orders',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.chat_outlined),
            activeIcon: Icon(Icons.chat),
            label: 'Chat',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildHome(CategoryProvider cats, bool isMaster) {
    return RefreshIndicator(
      onRefresh: () async {
        await cats.loadCategories();
        await _loadMasters();
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: TextField(
                controller: _searchCtl,
                decoration: const InputDecoration(
                  hintText: 'Search for a service...',
                  border: InputBorder.none,
                  icon: Icon(Icons.search, color: Colors.grey),
                ),
                onSubmitted: (query) {
                  if (query.trim().isNotEmpty) {
                    Navigator.pushNamed(context, '/search', arguments: {'query': query});
                  }
                },
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.pushNamed(
                      context,
                      isMaster ? '/master-dashboard' : '/orders',
                    ),
                    icon: Icon(isMaster ? Icons.dashboard_outlined : Icons.list_alt_outlined),
                    label: Text(isMaster ? 'Dashboard' : 'My Orders'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.pushNamed(
                      context,
                      isMaster ? '/wallet' : '/favorites',
                    ),
                    icon: Icon(
                      isMaster
                          ? Icons.account_balance_wallet_outlined
                          : Icons.favorite_border,
                    ),
                    label: Text(isMaster ? 'Wallet' : 'Favorites'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Categories',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                TextButton(
                  onPressed: () => Navigator.pushNamed(context, '/categories'),
                  child: const Text('View all'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 100,
              child: cats.loading
                  ? const Center(child: CircularProgressIndicator())
                  : ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: cats.categories.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 12),
                      itemBuilder: (ctx, i) => CategoryCard(category: cats.categories[i]),
                    ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isMaster ? 'Top Masters' : 'Nearby Masters',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                TextButton(
                  onPressed: () => Navigator.pushNamed(context, '/masters'),
                  child: const Text('View all'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _mastersLoading
                ? const Center(child: CircularProgressIndicator())
                : _masters.isEmpty
                    ? const Padding(
                        padding: EdgeInsets.all(16),
                        child: Text('No masters nearby', style: TextStyle(color: Colors.grey)),
                      )
                    : ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _masters.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (ctx, i) => MasterCard(master: _masters[i]),
                      ),
          ],
        ),
      ),
    );
  }
}
