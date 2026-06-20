import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/category_provider.dart';
import '../providers/master_provider.dart';
import '../widgets/category_card.dart';
import '../widgets/master_card.dart';
import '../utils/theme.dart';
import 'search_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CategoryProvider>().loadCategories();
      context.read<MasterProvider>().loadNearbyMasters(lat: 41.2995, lng: 69.2401);
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final cats = context.watch<CategoryProvider>();
    final masters = context.watch<MasterProvider>();
    final isMaster = auth.isMaster;

    final screens = [
      _buildHome(cats, masters, isMaster),
      const SearchScreen(),
      Scaffold(body: Center(child: ElevatedButton(onPressed: () => Navigator.pushNamed(context, '/create-order'), child: const Text('Create Order')))),
      Scaffold(body: Center(child: ElevatedButton(onPressed: () => Navigator.pushNamed(context, '/chat'), child: const Text('Open Chat')))),
      Scaffold(body: Center(child: ElevatedButton(onPressed: () => Navigator.pushNamed(context, '/profile'), child: const Text('View Profile')))),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(10)),
              child: const Center(child: Text('U', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
            ),
            const SizedBox(width: 10),
            const Text('UstaGo', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () => Navigator.pushNamed(context, '/notifications')),
          IconButton(icon: const Icon(Icons.person_outline), onPressed: () => Navigator.pushNamed(context, '/profile')),
        ],
      ),
      body: screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        type: BottomNavigationBarType.fixed,
        items: [
          const BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
          const BottomNavigationBarItem(icon: Icon(Icons.search_outlined), activeIcon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(
            icon: Icon(isMaster ? Icons.dashboard_outlined : Icons.add_circle_outline),
            activeIcon: Icon(isMaster ? Icons.dashboard : Icons.add_circle),
            label: isMaster ? 'Dashboard' : 'Order',
          ),
          const BottomNavigationBarItem(icon: Icon(Icons.chat_outlined), activeIcon: Icon(Icons.chat), label: 'Chat'),
          const BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildHome(CategoryProvider cats, MasterProvider masters, bool isMaster) {
    return RefreshIndicator(
      onRefresh: () async {
        await cats.loadCategories();
        await masters.loadNearbyMasters(lat: 41.2995, lng: 69.2401);
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
              child: const TextField(
                decoration: InputDecoration(
                  hintText: 'Xizmat qidirish...',
                  border: InputBorder.none,
                  icon: Icon(Icons.search, color: Colors.grey),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Kategoriyalar', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                TextButton(onPressed: () => Navigator.pushNamed(context, '/categories'), child: const Text('Hammasi')),
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
                const Text('Yaqin ustalar', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                TextButton(onPressed: () => Navigator.pushNamed(context, '/masters'), child: const Text('Hammasi')),
              ],
            ),
            const SizedBox(height: 12),
            masters.loading
                ? const Center(child: CircularProgressIndicator())
                : ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: masters.nearbyMasters.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (ctx, i) => MasterCard(master: masters.nearbyMasters[i]),
                  ),
          ],
        ),
      ),
    );
  }
}
